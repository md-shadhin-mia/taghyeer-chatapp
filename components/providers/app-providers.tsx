"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { useUnreadStore } from "@/store/unread-store";
import { useConnectionStore } from "@/store/connection-store";
import { useGlobalHealth } from "@/hooks/use-global-health";

function HealthMonitor() {
  useGlobalHealth();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Persisted stores use `skipHydration` so they never touch `localStorage`
  // during server-side rendering-rehydrate manually once mounted on the client.
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useUnreadStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    function handleOnline() {
      useConnectionStore.getState().setBrowserOnline(true);
    }
    function handleOffline() {
      useConnectionStore.getState().setBrowserOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HealthMonitor />
      {children}
    </QueryClientProvider>
  );
}
