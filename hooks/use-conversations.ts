"use client";

import { useQuery } from "@tanstack/react-query";
import { listConversations } from "@/services/api/conversations";
import { ApiError } from "@/services/api/error";
import { queryKeys } from "@/utils/query-keys";
import { sortByRecency } from "@/utils/sort";

export function useConversations(token: string | null) {
  const conversationsQuery = useQuery({
    queryKey: queryKeys.conversations(token),
    queryFn: () => listConversations(token as string),
    enabled: Boolean(token),
    select: sortByRecency,
  });

  return {
    conversations: conversationsQuery.data ?? [],
    isLoading: conversationsQuery.isPending,
    isError: conversationsQuery.isError,
    error:
      conversationsQuery.error instanceof ApiError
        ? conversationsQuery.error.message
        : conversationsQuery.isError
          ? "Couldn't load conversations. Please try again."
          : null,
    refetch: conversationsQuery.refetch,
  };
}
