"use client";

import { useEffect, useRef, useState } from "react";
import { selectIsOffline, useConnectionStore } from "@/store/connection-store";
import { getDraft, setDraft, clearDraft } from "@/utils/draft-storage";

export function MessageComposer({
  conversationId,
  onSend,
}: {
  conversationId: string;
  onSend: (conversationId: string, text: string) => void;
}) {
  // The composer is remounted per-conversation by ChatWindow's `key`, so the
  // draft only needs to be read once on mount, not synced via an effect.
  const [text, setText] = useState(() => getDraft(conversationId));
  const isOffline = useConnectionStore(selectIsOffline);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(conversationId, text);
  }, [conversationId, text]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isOffline) return;

    onSend(conversationId, trimmed);
    setText("");
    clearDraft(conversationId);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border-subtle bg-background p-3 md:p-4"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={isOffline ? "You're offline — reconnecting…" : "Type a message…"}
        aria-label="Message"
        disabled={isOffline}
        className="max-h-32 flex-1 resize-none rounded-lg border border-border-subtle bg-inset px-3 py-2 text-sm outline-none scrollbar-none transition-colors focus:border-accent-to disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isOffline || !text.trim()}
        aria-label="Send message"
        className="flex-shrink-0 rounded-lg bg-accent-to px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send
      </button>
    </form>
  );
}
