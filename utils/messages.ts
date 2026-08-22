import type { ClientMessage, Message, SocketMessagePayload } from "@/types/message";

// Realtime payloads arrive in a different shape than REST ones (`id` vs `_id`,
// epoch-ms vs ISO). Converting at the boundary keeps that quirk out of the cache
// and out of every consumer-and it's what makes `mergeMessage`'s `_id` dedup
// work at all, since an undefined `_id` never matches an existing message.
export function normalizeSocketMessage(payload: SocketMessagePayload): Message {
  return {
    _id: payload._id ?? payload.id ?? "",
    conversation: payload.conversation,
    sender: payload.sender,
    text: payload.text,
    createdAt:
      typeof payload.createdAt === "number"
        ? new Date(payload.createdAt).toISOString()
        : payload.createdAt,
  };
}

// The API's example response is newest-first-never trust wire order.
export function normalizeMessages(messages: Message[]): ClientMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

// Idempotent by `_id`, inserts at the correct sorted position by `createdAt`.
export function mergeMessage(
  list: ClientMessage[],
  incoming: Message,
): ClientMessage[] {
  if (list.some((message) => message._id === incoming._id)) return list;

  const incomingTime = new Date(incoming.createdAt).getTime();
  const insertAt = list.findIndex(
    (message) => new Date(message.createdAt).getTime() > incomingTime,
  );

  if (insertAt === -1) return [...list, incoming];
  return [...list.slice(0, insertAt), incoming, ...list.slice(insertAt)];
}

// Defensive only, as of the current server: probing the live API showed the
// sender never receives a `message:new` echo of their own message-not on the
// sending socket, not in their other tabs, and not for REST sends either-so
// nothing can currently race `onSuccess`'s reconciliation of the optimistic
// entry. Kept because it costs one filter and is the difference between a
// visible duplicate and none if the server ever starts echoing.
export function reconcileIncomingMessage(
  list: ClientMessage[],
  incoming: Message,
): ClientMessage[] {
  const withoutOptimisticDuplicate = list.filter(
    (message) =>
      !(
        message.status === "sending" &&
        message.sender === incoming.sender &&
        message.text === incoming.text
      ),
  );
  return mergeMessage(withoutOptimisticDuplicate, incoming);
}
