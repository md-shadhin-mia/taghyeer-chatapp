"use client";

import { useState } from "react";
import { MessageBubble } from "./message-bubble";

export function MessageList({
  messages,
  currentUserId,
}: {
  messages: Array<{ id: string; text: string; createdAt: number; userId: string }>;
  currentUserId: string;
}) {
  const [scrollRef] = useState<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (scrollRef) {
      scrollRef.scrollTop = 0;
    }
  };

  return (
    <div
      className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}