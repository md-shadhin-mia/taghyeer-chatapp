"use client";

import type { ReactNode } from "react";
import { Avatar } from "@/components/layout/avatar";

export function TopBar({
  userName,
  onSignOut,
  unreadTotal,
  isNotificationsOpen,
  onToggleNotifications,
  notificationsPanel,
}: {
  userName: string;
  /** Kept in the props contract for parity with ChatSidebar's own search box; not rendered here to avoid a duplicate input. */
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSignOut: () => void;
  unreadTotal: number;
  isNotificationsOpen: boolean;
  onToggleNotifications: () => void;
  notificationsPanel: ReactNode;
}) {
  return (
    <header className="relative flex flex-shrink-0 items-center gap-3 border-b border-border-subtle bg-background px-4 py-3 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Avatar name={userName} size={32} />
        <span className="truncate text-sm font-medium">{userName}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleNotifications}
          aria-label="Notifications"
          aria-haspopup="true"
          aria-expanded={isNotificationsOpen}
          className="relative rounded-md p-2 text-muted transition-colors hover:bg-border-subtle hover:text-foreground md:hidden"
        >
          <span aria-hidden>🔔</span>
          {unreadTotal > 0 && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent-to" />
          )}
        </button>
        <button
          onClick={onSignOut}
          className="rounded-md px-2 py-1.5 text-xs text-muted transition-colors hover:bg-border-subtle hover:text-foreground md:hidden"
        >
          Sign out
        </button>
      </div>

      {isNotificationsOpen && (
        <div
          id="notifications-panel"
          className="absolute right-4 top-full z-30 mt-2 w-72 rounded-lg border border-border-subtle bg-surface p-2 shadow-lg"
        >
          {notificationsPanel}
        </div>
      )}
    </header>
  );
}
