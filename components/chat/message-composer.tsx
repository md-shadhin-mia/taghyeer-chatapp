"use client";

import { useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useConversations } from "@/hooks/use-conversations";

export function MessageComposer({
  currentUserId,
  token,
}: {
  currentUserId: string;
  token: string;
}) {
  const [text, setText] = useState("");
  const { socket } = useSocket();
  const { conversations } = useConversations(token);
  const activeConversationId = conversations[0]?._id;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const messageText = text;
    setText("");

    if (socket?.readyState === WebSocket.OPEN) {
      socket.emit("message:send", {
        conversationId: activeConversationId,
        text: messageText,
        userId: currentUserId,
      });
    }
  };

  return (
    <form onSubmit={sendMessage} className="flex gap-3">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        type="text"
        className="flex-1 rounded-border-input border-border-subtle px-3 py-2 focus:outline-none focus:border-accent-to"
        placeholder="Type a message..."
        disabled={!activeConversationId}
      />
      <button type="submit" disabled={!activeConversationId} className="px-4 py-2 bg-accent-to text-accent-from rounded">
        Send
      </button>
    </form>
  );
}