"use client";

import { Avatar } from "@/components/layout/avatar";
import { selectUnreadCount, useUnreadStore } from "@/store/unread-store";
import { conversationTitle } from "@/utils/conversation";
import type { Conversation } from "@/types/conversation";

function NotificationRow({
  conversation,
  onSelectConversation,
}: {
  conversation: Conversation;
  onSelectConversation: (id: string) => void;
}) {
  const unreadCount = useUnreadStore(selectUnreadCount(conversation._id));
  const title = conversationTitle(conversation);

  return (
    <button
      onClick={() => onSelectConversation(conversation._id)}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-border-subtle"
    >
      <Avatar name={title} size={28} />
      <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-to px-1 text-xs font-medium text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
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
  const unreadConversations = conversations.filter(
    (conversation) => conversation.lastMessage !== undefined,
  );

  return (
    <div className="max-w-sm space-y-1">
      <h2 className="px-3 pb-1 text-sm font-semibold">Notifications</h2>
      {unreadConversations.length === 0 ? (
        <p className="px-3 py-4 text-center text-sm text-muted">Nothing new right now.</p>
      ) : (
        <div className="max-h-72 space-y-0.5 overflow-y-auto">
          {unreadConversations.map((conversation) => (
            <NotificationRow
              key={conversation._id}
              conversation={conversation}
              onSelectConversation={(id) => {
                onSelectConversation(id);
                onClose();
              }}
            />
          ))}
        </div>
      )}
      <button
        onClick={onClose}
        className="mt-1 w-full rounded-md border border-border-subtle px-3 py-2 text-xs text-muted transition-colors hover:bg-border-subtle"
      >
        Close
      </button>
    </div>
  );
}
