"use client";

import Image from "next/image";

export function MessageBubble({
  message,
  currentUserId,
}: {
  message: { id: string; text: string; createdAt: number; userId: string };
  currentUserId: string;
}) {
  const isOwnMessage = message.userId === currentUserId;
  const date = new Date(message.createdAt);

  return (
    <div className={`p-3 rounded-lg max-w-[80%] ${
      isOwnMessage ? "ml-auto" : "mr-auto"
    } mb-2 ${isOwnMessage ? "bg-accent-to" : "bg-background"}`}>
      <div className="flex flex-col gap-1">
        <p className="text-sm">{message.text}</p>
        <span className="text-xs text-muted">
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}