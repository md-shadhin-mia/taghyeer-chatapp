import { apiRequest } from "@/services/api/client";
import type { Message } from "@/types/message";

export function sendMessage(
  token: string,
  conversationId: string,
  text: string,
): Promise<Message> {
  return apiRequest<Message>("/messages", {
    method: "POST",
    token,
    body: { conversationId, text },
  });
}

export interface GetMessagesResult {
  messages: Message[];
  hasMore: boolean;
}

export function getMessages(
  token: string,
  conversationId: string,
  opts: { limit?: number } = {},
): Promise<GetMessagesResult> {
  const limit = opts.limit ?? 50;
  return apiRequest<GetMessagesResult>(
    `/conversations/${conversationId}/messages?limit=${limit}`,
    { token },
  );
}
