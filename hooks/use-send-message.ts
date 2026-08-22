"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/services/api/messages";
import { emitMessageSend, isSocketConnected, SocketSendError } from "@/services/socket/client";
import { ApiError } from "@/services/api/error";
import { queryKeys } from "@/utils/query-keys";
import { mergeMessage } from "@/utils/messages";
import type { ClientMessage, Message } from "@/types/message";

interface SendMessageVars {
  conversationId: string;
  text: string;
  tempId: string;
}

interface MutationContext {
  key: ReturnType<typeof queryKeys.messages>;
  tempId: string;
}

export function useSendMessage(token: string | null, currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    /**
     * Socket-first, REST fallback. The connected check happens *before* any
     * emit, which is what makes the fallback safe: REST is only ever used when
     * nothing was sent over the socket. Once an emit is in flight its errors
     * propagate as-is-a rejection means the server refused it, and a timeout
     * is ambiguous enough that retrying over REST could duplicate the message.
     *
     * Resolves to `null` on the socket path, since the ack returns no message.
     */
    mutationFn: async (vars: SendMessageVars): Promise<Message | null> => {
      if (isSocketConnected()) {
        await emitMessageSend(vars.conversationId, vars.text);
        return null;
      }
      return sendMessage(token as string, vars.conversationId, vars.text);
    },

    onMutate: async (vars): Promise<MutationContext> => {
      const key = queryKeys.messages(token, vars.conversationId);
      await queryClient.cancelQueries({ queryKey: key });

      const optimistic: ClientMessage = {
        _id: vars.tempId,
        conversation: vars.conversationId,
        sender: currentUserId as string,
        text: vars.text,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      queryClient.setQueryData<ClientMessage[]>(key, (old = []) => [...old, optimistic]);

      return { key, tempId: vars.tempId };
    },

    onSuccess: (serverMessage, _vars, ctx) => {
      if (!ctx) return;

      queryClient.setQueryData<ClientMessage[]>(ctx.key, (old = []) =>
        serverMessage
          ? // REST returned the canonical message-swap the optimistic entry for it.
            mergeMessage(
              old.filter((message) => message._id !== ctx.tempId),
              serverMessage,
            )
          : // Socket ack: nothing to swap in, so just settle the optimistic entry.
            old.map((message) =>
              message._id === ctx.tempId ? { ...message, status: "sent" as const } : message,
            ),
      );

      // The sender never receives their own `message:new` (verified against the
      // live API), so nothing else would refresh the sidebar's preview text and
      // ordering after sending-on either transport.
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(token) });
    },

    onError: (error, _vars, ctx) => {
      if (!ctx) return;

      // A server-supplied reason ("Conversation not found") is far more useful
      // than a generic failure, so keep it on the message for the bubble.
      const reason =
        error instanceof SocketSendError || error instanceof ApiError ? error.message : undefined;

      queryClient.setQueryData<ClientMessage[]>(ctx.key, (old = []) =>
        old.map((message) =>
          message._id === ctx.tempId
            ? { ...message, status: "failed" as const, error: reason }
            : message,
        ),
      );
    },
  });

  function send(conversationId: string, text: string) {
    mutation.mutate({ conversationId, text, tempId: `temp-${crypto.randomUUID()}` });
  }

  function retry(tempId: string, conversationId: string) {
    const key = queryKeys.messages(token, conversationId);
    const cached = queryClient.getQueryData<ClientMessage[]>(key) ?? [];
    const failed = cached.find((message) => message._id === tempId);
    if (!failed) return;

    queryClient.setQueryData<ClientMessage[]>(key, (old = []) =>
      old.map((message) =>
        message._id === tempId
          ? { ...message, status: "sending" as const, error: undefined }
          : message,
      ),
    );
    mutation.mutate({ conversationId, text: failed.text, tempId });
  }

  const pendingConversationId = mutation.isPending
    ? (mutation.variables?.conversationId ?? null)
    : null;

  return { send, retry, pendingConversationId };
}
