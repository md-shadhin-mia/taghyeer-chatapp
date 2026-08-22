"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "@/services/socket/client";
import { useConnectionStore } from "@/store/connection-store";
import { useChatStore } from "@/store/chat-store";
import { useUnreadStore } from "@/store/unread-store";
import { useToastStore } from "@/store/toast-store";
import { queryKeys } from "@/utils/query-keys";
import { normalizeSocketMessage, reconcileIncomingMessage } from "@/utils/messages";
import {
  conversationTitle,
  isGroupAdmin,
  isParticipant,
  normalizeSocketConversation,
  senderNameIn,
} from "@/utils/conversation";
import type { ClientMessage, SocketMessagePayload } from "@/types/message";
import type { Conversation, SocketConversationPayload } from "@/types/conversation";

export function useSocket(token: string | null, currentUserId: string | null) {
  const queryClient = useQueryClient();
  const setSocketConnected = useConnectionStore((state) => state.setSocketConnected);

  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    function invalidateConversations() {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(token) });
    }

    function handleMessageNew(payload: SocketMessagePayload) {
      const incoming = normalizeSocketMessage(payload);
      invalidateConversations();

      // Only patch a conversation's message cache if that thread has already
      // been opened this session-never seed a partial history here.
      const key = queryKeys.messages(token, incoming.conversation);
      if (queryClient.getQueryData(key) !== undefined) {
        queryClient.setQueryData<ClientMessage[]>(key, (old = []) =>
          reconcileIncomingMessage(old, incoming),
        );
      }

      notifyIfUnseen(incoming.conversation, incoming.sender, incoming.text, incoming.createdAt);
    }

    /**
     * Decides whether an arriving message counts as "unseen". Store state is
     * read via `getState()` rather than a subscription on purpose: subscribing
     * would put the active conversation in this effect's dependencies and tear
     * down every socket listener on each conversation switch.
     */
    function notifyIfUnseen(
      conversationId: string,
      sender: string,
      text: string,
      createdAt: string,
    ) {
      const { activeConversationId } = useChatStore.getState();
      const isActive = conversationId === activeConversationId;
      const isWatching = isActive && document.visibilityState === "visible";

      if (isWatching) {
        // You are looking straight at it-that counts as read.
        useUnreadStore.getState().markRead(conversationId);
        return;
      }

      useUnreadStore.getState().noteIncoming(conversationId, { text, sender, createdAt });

      // A toast for a tab nobody is looking at would only pile up; the badge
      // and the tab-title count carry that case instead.
      if (document.visibilityState !== "visible") return;

      const conversations =
        queryClient.getQueryData<Conversation[]>(queryKeys.conversations(token)) ?? [];
      const conversation = conversations.find((item) => item._id === conversationId);
      if (!conversation) return;

      const from = conversation.type === "group" ? senderNameIn(conversation, sender) : undefined;
      useToastStore.getState().push({
        conversationId,
        title: conversationTitle(conversation),
        body: from ? `${from}: ${text}` : text,
      });
    }

    /**
     * A group you're in changed: created, renamed, or members/admins edited.
     * Every participant receives this-including the person who made the
     * change and, importantly, a member who was just removed (verified against
     * the live server), which is what makes the removal path reliable.
     *
     * The payload is patched into the cache rather than triggering a refetch,
     * mirroring `use-group-management.ts`'s `applyUpdatedGroup`.
     */
    function handleConversationUpdated(payload: SocketConversationPayload) {
      const key = queryKeys.conversations(token);
      const cached = queryClient.getQueryData<Conversation[]>(key) ?? [];
      const existing = cached.find(
        (conversation) => conversation._id === (payload._id ?? payload.id),
      );
      const group = normalizeSocketConversation(payload, existing);

      // Unrecognizable payload-fall back to the old blunt-but-safe behaviour.
      if (!group) {
        invalidateConversations();
        return;
      }

      if (!isParticipant(group, currentUserId)) {
        // You were removed, or left from another device.
        queryClient.setQueryData<Conversation[]>(key, (old = []) =>
          old.filter((conversation) => conversation._id !== group._id),
        );
        const chat = useChatStore.getState();
        if (chat.activeConversationId === group._id) {
          chat.setActiveConversationId(null);
        }
        // Only worth announcing if we knew about the group in the first place.
        if (existing) {
          pushToast(group.name, "You were removed from this group");
        }
        return;
      }

      if (!existing) {
        // Added to a group (or one you created). Insert it straight away for
        // instant feedback, then refetch once-the event carries no
        // `lastMessage`, so an existing group's preview would read as empty.
        queryClient.setQueryData<Conversation[]>(key, (old = []) => [group, ...old]);
        invalidateConversations();
        pushToast(group.name, "You were added to this group", group._id);
        return;
      }

      queryClient.setQueryData<Conversation[]>(key, (old = []) =>
        old.map((conversation) => (conversation._id === group._id ? group : conversation)),
      );

      // Announce only what affects you-other members coming and going is noise.
      const previousName = existing.type === "group" ? existing.name : undefined;
      if (previousName && previousName !== group.name) {
        pushToast(group.name, `Renamed from "${previousName}"`, group._id);
      } else if (
        existing.type === "group" &&
        !isGroupAdmin(existing, currentUserId) &&
        isGroupAdmin(group, currentUserId)
      ) {
        pushToast(group.name, "You're now an admin of this group", group._id);
      }
    }

    /** Toasts are pointless behind a hidden tab-they'd just pile up. */
    function pushToast(title: string, body: string, conversationId?: string) {
      if (document.visibilityState !== "visible") return;
      useToastStore.getState().push({ conversationId, title, body });
    }

    // Realtime health feeds the global connection banner. A dropped socket only
    // degrades delivery-REST sending still works-so it never blocks the
    // composer; that is gated on the /health poll instead.
    function handleDisconnected() {
      setSocketConnected(false);
    }

    // Socket.IO does not redeliver events missed while disconnected-recover
    // from any gap by invalidating already-open conversations/messages caches
    // whenever the socket (re)connects. Cached data already exists for these
    // queries by the time a reconnect can happen, so this triggers a silent
    // background refetch (isFetching, not isLoading)-no spinner flash.
    function handleConnect() {
      setSocketConnected(true);
      invalidateConversations();
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesPrefix(token) });
    }

    socket.on("message:new", handleMessageNew);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("connect_error", handleDisconnected);
    socket.on("disconnect", handleDisconnected);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("connect_error", handleDisconnected);
      socket.off("disconnect", handleDisconnected);
      socket.off("connect", handleConnect);
      disconnectSocket();
      // Our own teardown is not an outage-don't leave a stale warning up.
      setSocketConnected(true);
    };
  }, [token, currentUserId, queryClient, setSocketConnected]);
}
