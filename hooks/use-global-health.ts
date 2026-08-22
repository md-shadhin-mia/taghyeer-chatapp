"use client";

import { useEffect } from "react";
import { checkHealth } from "@/services/api/health";
import { useConnectionStore } from "@/store/connection-store";

const HEALTHY_POLL_MS = 30_000;
// While down, check back sooner so recovery (and re-enabling Send) feels
// immediate instead of costing up to a full healthy interval.
const UNHEALTHY_POLL_MS = 5_000;

/**
 * Single owner of the `/health` poll. Mount once, app-wide; every consumer reads
 * the result from `useConnectionStore` rather than polling itself.
 *
 * Request-frugal by design: it skips the network entirely when the browser
 * already reports offline, pauses while the tab is hidden, and re-checks
 * immediately on `online` or on becoming visible again-so a backgrounded tab
 * costs nothing and a foregrounded one is never stale.
 */
export function useGlobalHealth() {
  const setBrowserOnline = useConnectionStore((state) => state.setBrowserOnline);
  const setServerReachable = useConnectionStore((state) => state.setServerReachable);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;

    function schedule(delay: number) {
      clearTimeout(timer);
      timer = setTimeout(() => void poll(), delay);
    }

    async function poll() {
      if (cancelled || document.hidden) return;

      // No point asking the network a question the browser already answered.
      if (!navigator.onLine) {
        setBrowserOnline(false);
        schedule(UNHEALTHY_POLL_MS);
        return;
      }
      setBrowserOnline(true);

      controller = new AbortController();
      const healthy = await checkHealth(controller.signal);
      if (cancelled) return;

      setServerReachable(healthy);
      schedule(healthy ? HEALTHY_POLL_MS : UNHEALTHY_POLL_MS);
    }

    function pollNow() {
      clearTimeout(timer);
      void poll();
    }

    function handleOnline() {
      setBrowserOnline(true);
      pollNow();
    }

    function handleOffline() {
      setBrowserOnline(false);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        clearTimeout(timer);
        controller?.abort();
      } else {
        pollNow();
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    pollNow();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller?.abort();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setBrowserOnline, setServerReachable]);
}
