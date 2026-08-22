"use client";

import { colorForName } from "@/components/layout/avatar";
import type { ConversationFilter } from "@/components/layout/icon-rail";
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
      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg py-2.5 pl-4 pr-3 text-left transition-colors ${
        isActive ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
      }`}
    >
      <span
        aria-hidden
        className="absolute inset-y-1.5 left-0 w-[3px] rounded-full"
        style={{ backgroundColor: colorForName(title) }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{title}</p>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-muted-dim">
      {children}
    </p>
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
  filter = "all",
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
  filter?: ConversationFilter;
  className?: string;
}) {
  const { conversations, isLoading, isError, error, refetch } = useConversations(token);

  const searched = searchQuery.trim()
    ? conversations.filter((conversation) =>
        conversationTitle(conversation).toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : conversations;

  const filtered =
    filter === "groups"
      ? searched.filter((conversation) => conversation.type === "group")
      : searched;

  const direct = filtered.filter((conversation) => conversation.type === "direct");
  const groups = filtered.filter((conversation) => conversation.type === "group");

  return (
    <div
      className={`w-full flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface p-4 md:w-80 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-3 pb-2">
        <div>
          <h2 className="text-base font-semibold">
            {filter === "groups" ? "Groups" : "Conversations"}
          </h2>
          <p className="text-xs text-muted">
            {filter === "groups"
              ? `${groups.length} ${groups.length === 1 ? "group" : "groups"}`
              : `${conversations.length} ${conversations.length === 1 ? "chat" : "chats"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenNewChat("direct")}
            className="flex-1 rounded-full bg-accent-to px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            + New Chat
          </button>
          <button
            onClick={() => onOpenNewChat("group")}
            className="flex-1 rounded-full border border-border-subtle px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
          >
            + New Group
          </button>
        </div>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          type="search"
          placeholder="Search"
          aria-label="Search conversations"
          className="w-full rounded-lg border border-border-subtle bg-inset px-3 py-2 text-sm outline-none transition-colors focus:border-accent-to"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 pt-2">
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
        ) : conversations.length === 0 || (filter === "groups" && groups.length === 0 && !searchQuery.trim()) ? (
          <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
            <p className="text-sm text-muted">
              {filter === "groups" ? "No group chats yet." : "No conversations yet."}
            </p>
            <button
              onClick={() => onOpenNewChat(filter === "groups" ? "group" : "direct")}
              className="text-sm text-accent-to hover:underline"
            >
              {filter === "groups" ? "Create your first group" : "Start your first chat"}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted">
            No conversations match &ldquo;{searchQuery}&rdquo;.
          </p>
        ) : (
          <>
            {direct.length > 0 && (
              <>
                <SectionLabel>Direct</SectionLabel>
                <div className="space-y-1">
                  {direct.map((conversation) => (
                    <ConversationRow
                      key={conversation._id}
                      conversation={conversation}
                      isActive={conversation._id === activeConversationId}
                      onSelectConversation={onSelectConversation}
                    />
                  ))}
                </div>
              </>
            )}
            {groups.length > 0 && (
              <>
                <SectionLabel>Groups</SectionLabel>
                <div className="space-y-1">
                  {groups.map((conversation) => (
                    <ConversationRow
                      key={conversation._id}
                      conversation={conversation}
                      isActive={conversation._id === activeConversationId}
                      onSelectConversation={onSelectConversation}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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
