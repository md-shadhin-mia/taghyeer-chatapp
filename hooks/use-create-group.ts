"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupConversation } from "@/services/api/conversations";
import { queryKeys } from "@/utils/query-keys";
import type { GroupConversation } from "@/types/conversation";

interface CreateGroupVars {
  name: string;
  participantIds: string[];
}

export function useCreateGroup(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: CreateGroupVars): Promise<GroupConversation> =>
      createGroupConversation(token as string, vars.name, vars.participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations(token) });
    },
  });
}
