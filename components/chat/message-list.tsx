"use client";

import type { RefObject } from "react";
import { MessageBubble } from "./message-bubble";
import { formatDateDivider, isSameCalendarDay } from "@/utils/date";
import { senderNameIn } from "@/utils/conversation";
import type { ClientMessage } from "@/types/message";
import type { Conversation } from "@/types/conversation";

export function MessageList({
  scrollRef,
  messages,
  currentUserId,
  conversation,
  isLoading,
  isError,
  error,
  onRetryLoad,
  onRetrySend,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  messages: ClientMessage[];
  currentUserId: string;
  conversation: Conversation;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onRetryLoad: () => void;
  onRetrySend: (tempId: string, conversationId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-accent-to" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted">{error ?? "Couldn't load messages."}</p>
        <button
          onClick={onRetryLoad}
          className="rounded-md border border-border-subtle px-3 py-1.5 text-sm transition-colors hover:bg-border-subtle"
        >
          Try again
        </button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="text-sm text-muted">No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:px-6">
      {messages.map((message, index) => {
        const previous = messages[index - 1];
        const showDivider = !previous || !isSameCalendarDay(previous.createdAt, message.createdAt);
        const isOwnMessage = message.sender === currentUserId;
        const senderName =
          conversation.type === "group" && !isOwnMessage
            ? (senderNameIn(conversation, message.sender) ?? "Unknown")
            : undefined;

        return (
          <div key={message._id}>
            {showDivider && (
              <div className="my-4 flex items-center justify-center">
                <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-muted">
                  {formatDateDivider(message.createdAt)}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isOwnMessage={isOwnMessage}
              senderName={senderName}
              onRetry={onRetrySend}
            />
          </div>
        );
      })}
    </div>
  );
}
