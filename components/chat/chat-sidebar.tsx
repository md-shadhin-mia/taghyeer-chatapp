"use client";

import { Avatar } from "@/components/layout/avatar";
import { StartChatPanel, type NewChatTab } from "@/components/chat/start-chat-panel";
import { useConversations } from "@/hooks/use-conversations";
import { selectUnreadCount, useUnreadStore } from "@/store/unread-store";
import { conversationTitle } from "@/utils/conversation";
import { formatMessageTime } from "@/utils/date";
import type { Conversation } from "@/types/conversation";

function ConversationRow({
  conversation,
  isActive,
  onSelectConversation,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelectConversation: (id: string) => void;
}) {
  const unreadCount = useUnreadStore(selectUnreadCount(conversation._id));
  const title = conversationTitle(conversation);
  const preview = conversation.lastMessage?.text ?? "No messages yet";

  return (
    <button
      onClick={() => onSelectConversation(conversation._id)}
      aria-current={isActive}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        isActive ? "bg-surface-elevated" : "hover:bg-border-subtle"
      }`}
    >
      <Avatar name={title} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{title}</p>
          {conversation.lastMessage && (
            <span className="flex-shrink-0 text-xs text-muted-dim">
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted">{preview}</p>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-to px-1 text-xs font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function ChatSidebar({
  token,
  currentUserId,
  activeConversationId,
  onSelectConversation,
  isNewChatOpen,
  newChatTab,
  onOpenNewChat,
  onCloseNewChat,
  onConversationStarted,
  searchQuery,
  onSearchChange,
  className,
}: {
  token: string | null;
  currentUserId: string;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isNewChatOpen: boolean;
  newChatTab: NewChatTab;
  onOpenNewChat: (tab?: NewChatTab) => void;
  onCloseNewChat: () => void;
  onConversationStarted: (conversationId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}) {
  const { conversations, isLoading, isError, error, refetch } = useConversations(token);

  const filtered = searchQuery.trim()
    ? conversations.filter((conversation) =>
        conversationTitle(conversation).toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : conversations;

  return (
    <div className={`w-full flex-col overflow-hidden md:w-80 ${className ?? ""}`}>
      <div className="flex flex-col gap-3 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Chats</h1>
          <button
            onClick={() => onOpenNewChat("direct")}
            aria-label="Start new chat"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-to text-white transition-colors hover:bg-accent-hover"
          >
            +
          </button>
        </div>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder="Search conversations…"
          aria-label="Search conversations"
          className="w-full rounded-md border border-border-subtle bg-inset px-3 py-2 text-sm outline-none transition-colors focus:border-accent-to"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 px-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-elevated" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <p className="text-sm text-muted">{error ?? "Couldn't load conversations."}</p>
            <button
              onClick={() => refetch()}
              className="rounded-md border border-border-subtle px-3 py-1.5 text-sm transition-colors hover:bg-border-subtle"
            >
              Try again
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <p className="text-sm text-muted">No conversations yet.</p>
            <button
              onClick={() => onOpenNewChat("direct")}
              className="text-sm text-accent-to hover:underline"
            >
              Start your first chat
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">
            No conversations match &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          filtered.map((conversation) => (
            <ConversationRow
              key={conversation._id}
              conversation={conversation}
              isActive={conversation._id === activeConversationId}
              onSelectConversation={onSelectConversation}
            />
          ))
        )}
      </div>

      {isNewChatOpen && (
        <StartChatPanel
          token={token}
          currentUserId={currentUserId}
          activeTab={newChatTab}
          onTabChange={onOpenNewChat}
          onClose={onCloseNewChat}
          onConversationStarted={onConversationStarted}
        />
      )}
    </div>
  );
}
