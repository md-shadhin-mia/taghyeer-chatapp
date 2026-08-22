"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDirectConversation } from "@/services/api/conversations";
import { queryKeys } from "@/utils/query-keys";
import type { UserSearchResult } from "@/types/api";

interface StartConversationResult {
  conversationId: string;
  participantName: string;
}

export function useStartConversation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidate: UserSearchResult): Promise<StartConversationResult> => {
      const conversation = await createDirectConversation(token as string, candidate._id);
      return { conversationId: conversation._id, participantName: candidate.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(token) });
    },
  });
}
