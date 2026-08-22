"use client";

import { Avatar } from "@/components/layout/avatar";

export type ConversationFilter = "all" | "groups";

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

export function IconRail({
  userName,
  onSignOut,
  activeFilter,
  onFilterChange,
}: {
  userName: string;
  onSignOut: () => void;
  activeFilter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
}) {
  return (
    <aside className="hidden w-16 flex-shrink-0 flex-col items-center border-r border-border-subtle bg-background py-4 md:flex">
      {/* Brand mark */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-to text-white">
        <ChatIcon />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Primary">
        <button
          onClick={() => onFilterChange("all")}
          aria-label="All chats"
          aria-pressed={activeFilter === "all"}
          title="All chats"
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            activeFilter === "all"
              ? "bg-accent-to/15 text-accent-hover"
              : "text-muted hover:bg-border-subtle hover:text-foreground"
          }`}
        >
          <ChatIcon />
        </button>
        <button
          onClick={() => onFilterChange("groups")}
          aria-label="Group chats"
          aria-pressed={activeFilter === "groups"}
          title="Group chats"
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            activeFilter === "groups"
              ? "bg-accent-to/15 text-accent-hover"
              : "text-muted hover:bg-border-subtle hover:text-foreground"
          }`}
        >
          <GroupIcon />
        </button>
      </nav>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
        >
          <PowerIcon />
        </button>
        <Avatar name={userName} size={34} />
      </div>
    </aside>
  );
}
