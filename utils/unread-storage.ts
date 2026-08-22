export const UNREAD_STORAGE_KEY = "taghyeer-unread";

// Previews are for a one-line badge/toast — anything longer is wasted bytes in
// localStorage, so it is truncated on the way in, not on the way out.
const MAX_PREVIEW_LENGTH = 120;

/**
 * One record per conversation — deliberately *not* a message log. A newer
 * message overwrites the preview and bumps `count`, so the stored size is
 * bounded by how many conversations you have, not by how many messages arrive.
 */
export interface UnreadRecord {
  /** Messages counted live this session while you weren't looking. */
  count: number;
  /** ISO time of the newest unseen message. */
  at: string;
  /** Truncated preview of that message. */
  text: string;
  /** Sender id — the display name is resolved at render, never stored. */
  sender: string;
  /** ISO time you last opened this conversation. */
  seenAt: string;
}

export type UnreadMap = Record<string, UnreadRecord>;

export function truncatePreview(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > MAX_PREVIEW_LENGTH
    ? `${trimmed.slice(0, MAX_PREVIEW_LENGTH - 1)}…`
    : trimmed;
}

export function readUnreadMap(): UnreadMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(UNREAD_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as UnreadMap) : {};
  } catch {
    // Corrupt or unavailable storage must never break the chat.
    return {};
  }
}

export function writeUnreadMap(map: UnreadMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UNREAD_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Quota or private-mode failures are non-fatal: unread state degrades to
    // session-only rather than taking the app down.
  }
}
