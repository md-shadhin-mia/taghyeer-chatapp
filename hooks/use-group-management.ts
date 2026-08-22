"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addGroupParticipants,
  promoteGroupAdmin,
  removeGroupParticipant,
  renameGroup,
} from "@/services/api/conversations";
import { queryKeys } from "@/utils/query-keys";
import type { Conversation, GroupConversation } from "@/types/conversation";

export function useGroupManagement(token: string | null, conversationId: string) {
  const queryClient = useQueryClient();

  // Every endpoint returns the updated group, so swap it into the cached list
  // directly — instant, and no refetch flash. Members other than the actor get
  // the same update over the socket (`conversation:updated` → invalidate).
  function applyUpdatedGroup(group: GroupConversation) {
    queryClient.setQueryData<Conversation[]>(queryKeys.conversations(token), (old = []) =>
      old.map((conversation) => (conversation._id === group._id ? group : conversation)),
    );
  }

  // Leaving removes the conversation from *our* list entirely — patching it in
  // place would leave a group we're no longer part of sitting in the sidebar.
  function dropConversation() {
    queryClient.setQueryData<Conversation[]>(queryKeys.conversations(token), (old = []) =>
      old.filter((conversation) => conversation._id !== conversationId),
    );
  }

  const addMembers = useMutation({
    mutationFn: (userIds: string[]) =>
      addGroupParticipants(token as string, conversationId, userIds),
    onSuccess: applyUpdatedGroup,
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) =>
      removeGroupParticipant(token as string, conversationId, userId),
    onSuccess: applyUpdatedGroup,
  });

  const promoteAdmin = useMutation({
    mutationFn: (userId: string) => promoteGroupAdmin(token as string, conversationId, userId),
    onSuccess: applyUpdatedGroup,
  });

  const rename = useMutation({
    mutationFn: (name: string) => renameGroup(token as string, conversationId, name),
    onSuccess: applyUpdatedGroup,
  });

  const leaveGroup = useMutation({
    mutationFn: (userId: string) =>
      removeGroupParticipant(token as string, conversationId, userId),
    onSuccess: dropConversation,
  });

  return { addMembers, removeMember, promoteAdmin, rename, leaveGroup };
}
