"use client";

import { Avatar } from "@/components/layout/avatar";

export function IconRail({
  userName,
  onSignOut,
  unreadTotal,
  isNotificationsOpen,
  onToggleNotifications,
}: {
  userName: string;
  onSignOut: () => void;
  unreadTotal: number;
  isNotificationsOpen: boolean;
  onToggleNotifications: () => void;
}) {
  return (
    <aside className="hidden w-16 flex-shrink-0 flex-col items-center border-r border-border-subtle bg-background py-4 md:flex">
      <div className="flex flex-1 flex-col items-center gap-4">
        <Avatar name={userName} size={36} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onToggleNotifications}
          aria-label="Notifications"
          aria-pressed={isNotificationsOpen}
          className={`relative rounded-md p-2 transition-colors ${
            isNotificationsOpen ? "bg-border-subtle" : "text-muted hover:bg-border-subtle hover:text-foreground"
          }`}
        >
          <span aria-hidden>🔔</span>
          {unreadTotal > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-to px-1 text-[10px] font-medium text-white">
              {unreadTotal > 9 ? "9+" : unreadTotal}
            </span>
          )}
        </button>
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          className="rounded-md p-2 text-muted transition-colors hover:bg-border-subtle hover:text-foreground"
        >
          <span aria-hidden>⏻</span>
        </button>
      </div>
    </aside>
  );
}
