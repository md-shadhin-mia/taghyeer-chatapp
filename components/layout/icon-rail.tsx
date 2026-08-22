"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useConversations } from "@/hooks/use-conversations";
import { useUnreadStore, selectTotalUnread } from "@/store/unread-store";
import { Avatar } from "@/components/layout/avatar";
import { useSocket } from "@/hooks/use-socket";

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
  onToggleNotifications: (open: boolean) => void;
}) {
  const { socketConnected, isOffline } = useSocket();
  const { conversations } = useConversations();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleOnline = () => {};
    const handleOffline = () => {};

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <aside
      className="fixed left-0 top-0 inset-y-auto w-16 bg-background flex flex-col items-center border-r border-border-subtle min-h-screen z-40"
    >
      <div className="flex-1 flex flex-col items-center py-4">
        <Avatar name={userName} size={36} />

        <div className="mt-2 text-center text-xs text-muted">
          {userName.split(" ")[0]}
        </div>
      </div>

      <nav className="mt-6 w-full space-y-1">
        {conversations.map((conversation) => (
          <button
            key={conversation._id}
            className={`flex items-center justify-center rounded-md px-3 py-2 text-sm ${
              expanded ? "bg-accent-to" : "text-muted hover:bg-border-subtle transition-colors"
            }`}
            onClick={() => setExpanded(!expanded)}
          >
            {conversation.participants.length > 2 ? "Group" : "Chats"}
          </button>
        ))}
      </nav>
    </aside>
  );
}