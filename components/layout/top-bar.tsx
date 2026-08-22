"use client";

import type { ReactNode } from "react";
import { Avatar } from "@/components/layout/avatar";

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopBar({
  userName,
  onSignOut,
  unreadTotal,
  isNotificationsOpen,
  onToggleNotifications,
  notificationsPanel,
}: {
  userName: string;
  onSignOut: () => void;
  unreadTotal: number;
  isNotificationsOpen: boolean;
  onToggleNotifications: () => void;
  notificationsPanel: ReactNode;
}) {
  const firstName = userName.trim().split(/\s+/)[0] || userName;

  return (
    <header className="relative flex flex-shrink-0 items-center gap-3 bg-background px-4 py-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="md:hidden">
          <Avatar name={userName} size={32} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold md:text-xl">
            {greetingForNow()}, {firstName}
          </h1>
          <p className="hidden truncate text-xs text-muted md:block">
            Here&rsquo;s what&rsquo;s happening in your inbox today.
          </p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={onToggleNotifications}
          aria-label="Notifications"
          aria-haspopup="true"
          aria-expanded={isNotificationsOpen}
          className={`relative flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle transition-colors ${
            isNotificationsOpen
              ? "bg-border-subtle text-foreground"
              : "text-muted hover:bg-border-subtle hover:text-foreground"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadTotal > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-to px-1 text-[10px] font-medium text-white">
              {unreadTotal > 9 ? "9+" : unreadTotal}
            </span>
          )}
        </button>

        <button
          onClick={onSignOut}
          className="rounded-lg px-2 py-1.5 text-xs text-muted transition-colors hover:bg-border-subtle hover:text-foreground md:hidden"
        >
          Sign out
        </button>
      </div>

      {isNotificationsOpen && (
        <div
          id="notifications-panel"
          className="absolute right-4 top-full z-30 mt-1 w-72 rounded-xl border border-border-subtle bg-surface p-2 shadow-lg md:right-6"
        >
          {notificationsPanel}
        </div>
      )}
    </header>
  );
}
