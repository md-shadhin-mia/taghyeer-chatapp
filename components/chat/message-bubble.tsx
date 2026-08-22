"use client";

import { Avatar } from "@/components/layout/avatar";
import { formatMessageTime } from "@/utils/date";
import type { ClientMessage } from "@/types/message";

export function MessageBubble({
  message,
  isOwnMessage,
  senderName,
  onRetry,
}: {
  message: ClientMessage;
  isOwnMessage: boolean;
  /** Set only in a group conversation for another participant's message. */
  senderName?: string;
  onRetry?: (tempId: string, conversationId: string) => void;
}) {
  const isFailed = message.status === "failed";
  const isSending = message.status === "sending";

  return (
    <div className={`flex items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
      {!isOwnMessage && senderName ? (
        <Avatar name={senderName} size={24} className="mb-1" />
      ) : (
        !isOwnMessage && <div className="w-6 flex-shrink-0" />
      )}

      <div className={`flex max-w-[75%] flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
        {!isOwnMessage && senderName && (
          <span className="px-1 text-xs font-medium text-muted">{senderName}</span>
        )}

        <div
          className={`animate-message-pop whitespace-pre-wrap break-words rounded-lg px-3.5 py-2 text-sm ${
            isOwnMessage
              ? `bg-accent-to text-white ${isFailed ? "opacity-60" : ""}`
              : "bg-surface-elevated text-foreground"
          }`}
        >
          {message.text}
        </div>

        <div className="flex items-center gap-1.5 px-1 text-xs text-muted-dim">
          {isSending ? (
            <span className="flex items-center gap-1" aria-label="Sending">
              <span className="flex gap-0.5">
                <span className="animate-sending-dot h-1 w-1 rounded-full bg-muted-dim" />
                <span
                  className="animate-sending-dot h-1 w-1 rounded-full bg-muted-dim"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="animate-sending-dot h-1 w-1 rounded-full bg-muted-dim"
                  style={{ animationDelay: "0.3s" }}
                />
              </span>
            </span>
          ) : (
            <span>{formatMessageTime(message.createdAt)}</span>
          )}

          {isFailed && (
            <>
              <span className="text-danger">{message.error ?? "Failed to send"}</span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message._id, message.conversation)}
                  className="font-medium text-accent-to hover:underline"
                >
                  Retry
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
