const PREFIX = "chat-draft:";

export function getDraft(conversationId: string): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PREFIX + conversationId) ?? "";
}

export function setDraft(conversationId: string, text: string): void {
  if (typeof window === "undefined") return;
  if (text) {
    window.localStorage.setItem(PREFIX + conversationId, text);
  } else {
    window.localStorage.removeItem(PREFIX + conversationId);
  }
}

export function clearDraft(conversationId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + conversationId);
}
