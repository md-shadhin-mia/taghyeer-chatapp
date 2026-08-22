"use client";

import { useState } from "react";
import { Avatar } from "@/components/layout/avatar";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";
import { JumpToBottomButton } from "@/components/chat/jump-to-bottom-button";
import { GroupInfoPanel } from "@/components/chat/group-info-panel";
import { Modal } from "@/components/ui/modal";
import { useMessages } from "@/hooks/use-messages";
import { useSendMessage } from "@/hooks/use-send-message";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { conversationTitle } from "@/utils/conversation";
import type { Conversation } from "@/types/conversation";

export function ChatWindow({
  token,
  currentUserId,
  conversation,
  onBack,
  className,
}: {
  token: string | null;
  currentUserId: string;
  conversation: Conversation | null;
  onBack: () => void;
  className?: string;
}) {
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);

  return (
    <div className={`min-w-0 flex-1 flex-col overflow-hidden ${className ?? ""}`}>
      {conversation ? (
        <ChatWindowContent
          key={conversation._id}
          token={token}
          currentUserId={currentUserId}
          conversation={conversation}
          onBack={onBack}
          isGroupInfoOpen={isGroupInfoOpen}
          onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
          onCloseGroupInfo={() => setIsGroupInfoOpen(false)}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted">Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  );
}

function ChatWindowContent({
  token,
  currentUserId,
  conversation,
  onBack,
  isGroupInfoOpen,
  onOpenGroupInfo,
  onCloseGroupInfo,
}: {
  token: string | null;
  currentUserId: string;
  conversation: Conversation;
  onBack: () => void;
  isGroupInfoOpen: boolean;
  onOpenGroupInfo: () => void;
  onCloseGroupInfo: () => void;
}) {
  const { messages, isLoading, isError, error, refetch } = useMessages(token, conversation._id);
  const { send, retry, pendingConversationId } = useSendMessage(token, currentUserId);
  const lastMessage = messages[messages.length - 1];
  const { scrollRef, isAtBottom, newMessageCount, scrollToBottom } = useAutoScroll({
    itemCount: messages.length,
    lastItemId: lastMessage?._id ?? null,
    resetKey: conversation._id,
  });

  const title = conversationTitle(conversation);
  const isGroup = conversation.type === "group";
  const isSending = pendingConversationId === conversation._id;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border-subtle px-4 py-3 md:px-6">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="text-muted hover:text-foreground md:hidden"
        >
          ←
        </button>
        <Avatar name={title} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          {isGroup && (
            <p className="truncate text-xs text-muted">
              {conversation.participants.length} members
            </p>
          )}
        </div>
        {isGroup && (
          <button
            onClick={onOpenGroupInfo}
            aria-label="Group info"
            aria-haspopup="dialog"
            className="rounded-md px-2 py-1 text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
          >
            ⋮
          </button>
        )}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <MessageList
          scrollRef={scrollRef}
          messages={messages}
          currentUserId={currentUserId}
          conversation={conversation}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetryLoad={() => refetch()}
          onRetrySend={retry}
        />
        <JumpToBottomButton
          visible={!isAtBottom && messages.length > 0}
          count={newMessageCount}
          onClick={scrollToBottom}
        />
        {isSending && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-muted shadow">
              Sending…
            </span>
          </div>
        )}
      </div>

      <MessageComposer conversationId={conversation._id} onSend={send} />

      {isGroupInfoOpen && isGroup && (
        <Modal onClose={onCloseGroupInfo}>
          <GroupInfoPanel
            token={token}
            conversation={conversation}
            currentUserId={currentUserId}
            onClose={onCloseGroupInfo}
            onLeft={() => {
              onCloseGroupInfo();
              onBack();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
