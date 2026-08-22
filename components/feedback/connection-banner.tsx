"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket";

export function ConnectionBanner() {
  const { socketConnected, isOffline } = useSocket();
  const [isConnectionLost, setIsConnectionLost] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsConnectionLost(false);
    const handleOffline = () => setIsConnectionLost(true);
    const handleSocketConnect = () => setIsConnectionLost(false);
    const handleSocketDisconnect = () => setIsConnectionLost(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-destructive text-white px-4 py-2 rounded text-sm animate-fade-in">
        Offline
      </div>
    );
  }

  if (isConnectionLost) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-accent-to text-accent-from px-4 py-2 rounded text-sm animate-fade-in">
        Connection lost. Attempting to reconnect...
      </div>
    );
  }

  return null;
}