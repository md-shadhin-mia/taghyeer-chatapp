"use client";

import { Avatar } from "@/components/layout/avatar";
import { hasUnseenSince, useUnreadStore } from "@/store/unread-store";
import { conversationTitle, senderNameIn } from "@/utils/conversation";
import { formatMessageTime } from "@/utils/date";
import type { Conversation } from "@/types/conversation";
import type { UnreadRecord } from "@/utils/unread-storage";

interface NotificationItem {
  conversation: Conversation;
  /** ISO time of the newest unseen message, for ordering and display. */
  at: string;
  /** Preview of the newest unseen message; empty when only a dot is known. */
  preview: string;
  /** Live count from this session; 0 when the message arrived while the app was closed. */
  count: number;
}

/**
 * One notification per conversation with something unseen-either messages
 * counted live this session (unread-store), or a `lastMessage` newer than the
 * last time the conversation was opened (arrived while the app was closed,
 * where only a dot can be shown since the exact count isn't knowable).
 */
function buildNotifications(
  conversations: Conversation[],
  entries: Record<string, UnreadRecord>,
): NotificationItem[] {
  const items: NotificationItem[] = [];

  for (const conversation of conversations) {
    const record = entries[conversation._id];

    if (record && record.count > 0) {
      const from =
        conversation.type === "group" ? senderNameIn(conversation, record.sender) : undefined;
      items.push({
        conversation,
        at: record.at,
        preview: from ? `${from}: ${record.text}` : record.text,
        count: record.count,
      });
      continue;
    }

    if (hasUnseenSince(record, conversation.lastMessage?.createdAt)) {
      const last = conversation.lastMessage;
      const from =
        conversation.type === "group" && last
          ? senderNameIn(conversation, last.sender)
          : undefined;
      items.push({
        conversation,
        at: last?.createdAt ?? record?.seenAt ?? "",
        preview: last ? (from ? `${from}: ${last.text}` : last.text) : "New messages",
        count: 0,
      });
    }
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function NotificationsPanel({
  conversations,
  onSelectConversation,
  onClose,
}: {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onClose: () => void;
}) {
  const entries = useUnreadStore((state) => state.entries);
  const markAllRead = useUnreadStore((state) => state.markAllRead);
  const items = buildNotifications(conversations, entries);

  return (
    <div className="max-w-sm">
      <div className="flex items-center justify-between px-3 pb-2">
        <h2 className="text-sm font-semibold">Notifications</h2>
        {items.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-accent-hover hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-muted">Nothing new right now.</p>
      ) : (
        <div className="max-h-80 space-y-0.5 overflow-y-auto">
          {items.map(({ conversation, at, preview, count }) => {
            const title = conversationTitle(conversation);
            return (
              <button
                key={conversation._id}
                onClick={() => {
                  onSelectConversation(conversation._id);
                  onClose();
                }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-border-subtle"
              >
                <Avatar name={title} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{title}</span>
                    <span className="flex-shrink-0 text-[11px] text-muted-dim">
                      {formatMessageTime(at)}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">{preview}</span>
                    {count > 0 ? (
                      <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-to px-1 text-xs font-medium text-white">
                        {count > 9 ? "9+" : count}
                      </span>
                    ) : (
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full bg-accent-to"
                        aria-label="New messages"
                      />
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-2 w-full rounded-lg border border-border-subtle px-3 py-2 text-xs text-muted transition-colors hover:bg-border-subtle"
      >
        Close
      </button>
    </div>
  );
}
