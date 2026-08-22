"use client";

import { useState } from "react";

export type NewChatTab = "direct" | "group";

export function StartChatPanel({
  isNewChatOpen,
  setIsNewChatOpen,
  newChatTab,
  setNewChatTab,
  onSelectTab,
  onClose,
}: {
  isNewChatOpen: boolean;
  setIsNewChatOpen: (open: boolean) => void;
  newChatTab: NewChatTab;
  setNewChatTab: (tab: NewChatTab) => void;
  onSelectTab: (tab: NewChatTab) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg p-6 w-full max-w-sm">
        <h3 className="font-medium mb-4">Start New Chat</div>
        <div className="space-y-3">
          <button
            onClick={() => {
              onSelectTab("direct");
              setIsNewChatOpen(false);
            }}
            className="w-full flex items-center justify-between rounded-border px-3 py-2 border-border-subtle hover:bg-border-subtle transition-colors"
          >
            Direct
            <span>+</span>
          </button>
          <button
            onClick={() => {
              onSelectTab("group");
              setIsNewChatOpen(false);
            }}
            className="w-full flex items-center justify-between rounded-border px-3 py-2 border-border-subtle hover:bg-border-subtle transition-colors"
          >
            Group
            <span>+</span>
          </button}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-border px-3 py-2 border-border-subtle hover:bg-border-subtle transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}