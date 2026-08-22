"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function TopBar({
  userName,
  searchQuery,
  onSearchChange,
  onSignOut,
  unreadTotal,
  isNotificationsOpen,
  onToggleNotifications,
  notificationsPanel,
}: {
  userName: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSignOut: () => void;
  unreadTotal: number;
  isNotificationsOpen: boolean;
  onToggleNotifications: (open: boolean) => void;
  notificationsPanel: React.ReactNode;
}) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userName) {
        // Mark conversations as read when tab becomes visible
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [userName]);

  return (
    <header className="flex items-center justify-between border-b border-border-subtle bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar name={userName} size={32} />
        <span className="text-sm font-medium">{userName}</span>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          aria-label="Search"
          onClick={() => onSearchChange("")}
          className="relative"
        >
          <SearchIcon className="h-4 w-4" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            type="search"
            className="hidden w-24 rounded-md border-border-subtle px-3 py-2 text-sm transition-all focus:visible focus:w-48 focus:border-accent-to"
            placeholder="Search conversations..."
          />
        </IconButton>

        <button
          onClick={() => onToggleNotifications(!isNotificationsOpen)}
          className="relative rounded-md p-2 hover:bg-border-subtle transition-colors"
          aria-controls="notifications-panel"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-accent-to"></span>
        </button>
      </div>

      {isNotificationsOpen && (
        <div id="notifications-panel" className="fixed top-20 right-4 w-64 bg-background border border-border-subtle rounded-md shadow-lg p-4 z-50">
          {notificationsPanel}
        </div>
      )}

      <button
        onClick={onSignOut}
        className="text-xs text-muted hover:underline"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </header>
  );
}

function Avatar({ name }: { name: string; size?: number }) {
  const size = size ?? 32;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={`h-[${size}px] w-[${size}px] rounded-full flex items-center justify-center flex-shrink-0 bg-border-subtle text-xs font-medium`}
    >
      {initials}
    </div>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
function IconButton({ className, ...rest }: IconButtonProps) {
  return <button className={className} {...rest} />;
}