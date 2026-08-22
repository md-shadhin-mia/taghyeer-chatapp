export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
}

// The socket's `message:new` payload does NOT match the REST message shape:
// it sends `id` instead of `_id`, and `createdAt` as epoch milliseconds instead
// of an ISO string. (API.md documents it as identical to REST-it isn't.)
// Normalize with `normalizeSocketMessage` before it reaches the cache.
export interface SocketMessagePayload {
  _id?: string;
  id?: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string | number;
}

// "sent" is specific to the socket transport: the server acknowledged the
// message, but the ack carries no `_id`, so the entry keeps its `temp-` id
// until the next full refetch of the conversation swaps in the canonical copy.
export type MessageStatus = "sending" | "sent" | "failed";

export interface ClientMessage extends Message {
  status?: MessageStatus;
  /** Why a `failed` send failed-the server's own wording where it gave one. */
  error?: string;
}
