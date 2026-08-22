import type {
  Conversation,
  GroupConversation,
  SocketConversationPayload,
} from "@/types/conversation";

/** The name shown for a conversation: the other person, or the group's name. */
export function conversationTitle(conversation: Conversation): string {
  return conversation.type === "direct" ? conversation.participant.name : conversation.name;
}

/**
 * Resolves a sender id to a display name from the conversation itself, which is
 * why unread records store only the sender id and never a name.
 */
export function senderNameIn(conversation: Conversation, senderId: string): string | undefined {
  if (conversation.type === "direct") {
    return conversation.participant._id === senderId ? conversation.participant.name : undefined;
  }
  return conversation.participants.find((participant) => participant._id === senderId)?.name;
}

export function isParticipant(group: GroupConversation, userId: string | null): boolean {
  if (!userId) return false;
  return group.participants.some((participant) => participant._id === userId);
}

export function isGroupAdmin(group: GroupConversation, userId: string | null): boolean {
  if (!userId) return false;
  return group.admins.includes(userId);
}

function toIsoString(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? new Date(value).toISOString() : value;
}

/**
 * Converts a `conversation:updated` payload into a cache-ready group, merging in
 * the fields the event does not send.
 *
 * That merge is the whole point: the payload has no `updatedAt` and no
 * `lastMessage`, so writing it in raw would blank the sidebar preview and put
 * `NaN` into `sortByRecency`'s ordering. Anything the event omits is taken from
 * the copy already in cache.
 *
 * Returns `null` for a payload that isn't a usable group, so the caller can fall
 * back to refetching rather than corrupting the list.
 */
export function normalizeSocketConversation(
  payload: SocketConversationPayload,
  existing: Conversation | undefined,
): GroupConversation | null {
  const id = payload._id ?? payload.id;
  if (!id || !Array.isArray(payload.participants)) return null;

  const previous = existing?.type === "group" ? existing : undefined;

  return {
    _id: id,
    type: "group",
    name: payload.name ?? previous?.name ?? "Group",
    createdBy: payload.createdBy ?? previous?.createdBy ?? "",
    admins: payload.admins ?? previous?.admins ?? [],
    participants: payload.participants,
    lastMessage: payload.lastMessage ?? previous?.lastMessage,
    updatedAt:
      toIsoString(payload.updatedAt) ?? previous?.updatedAt ?? new Date().toISOString(),
  };
}
