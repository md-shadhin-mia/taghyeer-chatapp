import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  truncatePreview,
  UNREAD_STORAGE_KEY,
  type UnreadMap,
  type UnreadRecord,
} from "@/utils/unread-storage";

interface IncomingPreview {
  text: string;
  sender: string;
  createdAt: string;
}

interface UnreadState {
  entries: UnreadMap;
  noteIncoming: (conversationId: string, message: IncomingPreview) => void;
  markRead: (conversationId: string) => void;
  markAllRead: () => void;
  prune: (existingConversationIds: string[]) => void;
}

/**
 * Client-side unread tracking. The API exposes no unread count, no read state
 * on a message, and no event other than `message:new`-but that event reaches
 * every participant regardless of what they have open, so everything here is
 * derived from it without a single extra request.
 */
export const useUnreadStore = create<UnreadState>()(
  persist(
    (set) => ({
      entries: {},

      noteIncoming: (conversationId, message) =>
        set((state) => {
          const previous = state.entries[conversationId];
          return {
            entries: {
              ...state.entries,
              [conversationId]: {
                count: (previous?.count ?? 0) + 1,
                at: message.createdAt,
                text: truncatePreview(message.text ?? ""),
                sender: message.sender,
                seenAt: previous?.seenAt ?? new Date(0).toISOString(),
              },
            },
          };
        }),

      markRead: (conversationId) =>
        set((state) => {
          const previous = state.entries[conversationId];
          const seenAt = new Date().toISOString();
          // Keep a record even with a zero count: `seenAt` is what tells a later
          // session that everything up to this point has already been read.
          const next: UnreadRecord = {
            count: 0,
            at: previous?.at ?? seenAt,
            text: "",
            sender: previous?.sender ?? "",
            seenAt,
          };
          return { entries: { ...state.entries, [conversationId]: next } };
        }),

      markAllRead: () =>
        set((state) => {
          const seenAt = new Date().toISOString();
          const entries: UnreadMap = {};
          for (const [id, record] of Object.entries(state.entries)) {
            entries[id] = { ...record, count: 0, text: "", seenAt };
          }
          return { entries };
        }),

      prune: (existingConversationIds) =>
        set((state) => {
          const keep = new Set(existingConversationIds);
          const entries: UnreadMap = {};
          for (const [id, record] of Object.entries(state.entries)) {
            if (keep.has(id)) entries[id] = record;
          }
          return { entries };
        }),
    }),
    {
      name: UNREAD_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
      // Same manual-rehydration approach as `auth-store`-never touch
      // localStorage during SSR (see AppProviders).
      skipHydration: true,
    },
  ),
);

export function selectUnreadCount(conversationId: string) {
  return (state: UnreadState): number => state.entries[conversationId]?.count ?? 0;
}

export function selectTotalUnread(state: UnreadState): number {
  return Object.values(state.entries).reduce((total, record) => total + record.count, 0);
}

/**
 * True when a conversation's newest message post-dates the last time you opened
 * it-the only unread signal available for messages that arrived while the app
 * was closed, where the exact count can't be known without refetching threads.
 */
export function hasUnseenSince(
  record: UnreadRecord | undefined,
  lastMessageAt: string | undefined,
): boolean {
  if (!record || !lastMessageAt) return false;
  return new Date(lastMessageAt).getTime() > new Date(record.seenAt).getTime();
}
