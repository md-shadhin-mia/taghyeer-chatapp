import { apiRequest } from "@/services/api/client";
import type { Conversation, GroupConversation } from "@/types/conversation";

// The API rejects a group with fewer than 3 total members. The creator is added
// server-side and is NOT part of `participantIds`, so the caller must pick at
// least two other people. Selecting exactly one is a direct conversation.
export const MIN_GROUP_PARTICIPANTS = 2;

export async function listConversations(token: string): Promise<Conversation[]> {
  const body = await apiRequest<{ data: Conversation[] }>("/conversations", { token });
  return body.data;
}

// POST /conversations returns a slimmed-down shape that doesn't match the
// list item shape (no `type`/`participant`/`updatedAt`), so callers should
// invalidate/re-fetch the conversations list afterwards.
export function createDirectConversation(
  token: string,
  userId: string,
): Promise<{ _id: string }> {
  return apiRequest<{ _id: string }>("/conversations", {
    method: "POST",
    token,
    body: { userId },
  });
}

// Unlike direct creation, this returns the full group object (type, participants,
// admins), so the caller can use it directly rather than re-fetching to read it.
export function createGroupConversation(
  token: string,
  name: string,
  participantIds: string[],
): Promise<GroupConversation> {
  return apiRequest<GroupConversation>("/conversations/group", {
    method: "POST",
    token,
    body: { name, participantIds },
  });
}

// Every group mutation below is admins-only (403 FORBIDDEN otherwise) and returns
// the full updated group, so callers can patch the cache instead of re-fetching.

export function addGroupParticipants(
  token: string,
  conversationId: string,
  userIds: string[],
): Promise<GroupConversation> {
  return apiRequest<GroupConversation>(`/conversations/${conversationId}/participants`, {
    method: "POST",
    token,
    body: { userIds },
  });
}

// Passing your own id is how you leave a group; anyone may do that.
// Note: removing a member also drops them from `admins`.
export function removeGroupParticipant(
  token: string,
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  return apiRequest<GroupConversation>(
    `/conversations/${conversationId}/participants/${userId}`,
    { method: "DELETE", token },
  );
}

export function promoteGroupAdmin(
  token: string,
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  return apiRequest<GroupConversation>(`/conversations/${conversationId}/admins`, {
    method: "POST",
    token,
    body: { userId },
  });
}

export function renameGroup(
  token: string,
  conversationId: string,
  name: string,
): Promise<GroupConversation> {
  return apiRequest<GroupConversation>(`/conversations/${conversationId}`, {
    method: "PATCH",
    token,
    body: { name },
  });
}
