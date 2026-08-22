"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/services/api/messages";
import { ApiError } from "@/services/api/error";
import { queryKeys } from "@/utils/query-keys";
import { normalizeMessages } from "@/utils/messages";

const MESSAGE_PAGE_SIZE = 50;

export function useMessages(token: string | null, conversationId: string | null) {
  const messagesQuery = useQuery({
    queryKey: queryKeys.messages(token, conversationId),
    // Normalize inside queryFn (not `select`) so the cache itself holds a plain
    // ClientMessage[] — `select` only transforms what's read, not what's stored,
    // and use-socket.ts/use-send-message.ts patch the raw cache directly.
    queryFn: async () => {
      const result = await getMessages(token as string, conversationId as string, {
        limit: MESSAGE_PAGE_SIZE,
      });
      return normalizeMessages(result.messages);
    },
    enabled: Boolean(token) && Boolean(conversationId),
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    error:
      messagesQuery.error instanceof ApiError
        ? messagesQuery.error.message
        : messagesQuery.isError
          ? "Couldn't load messages. Please try again."
          : null,
    refetch: messagesQuery.refetch,
  };
}
