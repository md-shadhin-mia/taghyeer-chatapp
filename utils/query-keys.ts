export const queryKeys = {
  me: (token: string | null) => ["me", token] as const,
  conversations: (token: string | null) => ["conversations", token] as const,
  userSearch: (token: string | null, query: string) =>
    ["users", "search", token, query] as const,
  messages: (token: string | null, conversationId: string | null) =>
    ["messages", token, conversationId] as const,
  messagesPrefix: (token: string | null) => ["messages", token] as const,
};
