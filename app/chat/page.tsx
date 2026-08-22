"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/hooks/use-socket";
import { useConversations } from "@/hooks/use-conversations";
import { useUnreadDocumentTitle } from "@/hooks/use-document-title";
import { useChatStore } from "@/store/chat-store";
import { selectTotalUnread, useUnreadStore } from "@/store/unread-store";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import type { NewChatTab } from "@/components/chat/start-chat-panel";
import { ChatWindow } from "@/components/chat/chat-window";
import { NotificationsPanel } from "@/components/chat/notifications-panel";
import { ToastStack } from "@/components/feedback/toast-stack";
import { IconRail, type ConversationFilter } from "@/components/layout/icon-rail";
import { TopBar } from "@/components/layout/top-bar";

export default function ChatPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatTab, setNewChatTab] = useState<NewChatTab>("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [conversationFilter, setConversationFilter] = useState<ConversationFilter>("all");

  const markRead = useUnreadStore((state) => state.markRead);
  const prune = useUnreadStore((state) => state.prune);
  const unreadTotal = useUnreadStore(selectTotalUnread);

  useSocket(token, user?._id ?? null);
  useUnreadDocumentTitle();
  const { conversations } = useConversations(token);
  const activeConversation =
    conversations.find((conversation) => conversation._id === activeConversationId) ?? null;

  const openConversation = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      markRead(conversationId);
    },
    [setActiveConversationId, markRead],
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // Coming back to the tab means you're looking at the open conversation again.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && activeConversationId) {
        markRead(activeConversationId);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeConversationId, markRead]);

  // Keeps stored records bounded to conversations that still exist.
  useEffect(() => {
    if (conversations.length === 0) return;
    prune(conversations.map((conversation) => conversation._id));
  }, [conversations, prune]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent-to" />
      </div>
    );
  }

  function handleConversationStarted(conversationId: string) {
    openConversation(conversationId);
    setIsNewChatOpen(false);
  }

  // On mobile only one pane fits, so the active conversation swaps the list out.
  const showChatOnMobile = Boolean(activeConversationId);

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      <IconRail
        userName={user.name}
        onSignOut={logout}
        activeFilter={conversationFilter}
        onFilterChange={setConversationFilter}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          userName={user.name}
          onSignOut={logout}
          unreadTotal={unreadTotal}
          isNotificationsOpen={isNotificationsOpen}
          onToggleNotifications={() => setIsNotificationsOpen((open) => !open)}
          notificationsPanel={
            <NotificationsPanel
              conversations={conversations}
              onSelectConversation={openConversation}
              onClose={() => setIsNotificationsOpen(false)}
            />
          }
        />

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden px-4 pb-4 md:px-6 md:pb-6">
          <ChatSidebar
            token={token}
            currentUserId={user._id}
            activeConversationId={activeConversationId}
            onSelectConversation={openConversation}
            isNewChatOpen={isNewChatOpen}
            newChatTab={newChatTab}
            onOpenNewChat={(tab = "direct") => {
              setNewChatTab(tab);
              setIsNewChatOpen(true);
            }}
            onCloseNewChat={() => setIsNewChatOpen(false)}
            onConversationStarted={handleConversationStarted}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={conversationFilter}
            className={
              showChatOnMobile
                ? "hidden flex-1 md:flex md:flex-none"
                : "flex flex-1 md:flex-none"
            }
          />

          <ChatWindow
            token={token}
            currentUserId={user._id}
            conversation={activeConversation}
            onBack={() => setActiveConversationId(null)}
            className={showChatOnMobile ? "flex" : "hidden md:flex"}
          />
        </div>
      </div>

      <ToastStack onOpenConversation={openConversation} />
    </div>
  );
}
