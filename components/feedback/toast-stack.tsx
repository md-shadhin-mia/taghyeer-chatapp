"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useToastStore } from "@/store/toast-store";

const AUTO_DISMISS_MS = 5000;

export function ToastStack({ onOpenConversation }: { onOpenConversation: (id: string) => void }) {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    // Toasts are suppressed while the tab is hidden (see use-socket.ts), so a
    // hidden tab never has a stray timer racing a toast that was never shown.
    for (const toast of toasts) {
      if (timers.current.has(toast.id)) continue;
      const timer = setTimeout(() => {
        timers.current.delete(toast.id);
        dismiss(toast.id);
      }, AUTO_DISMISS_MS);
      timers.current.set(toast.id, timer);
    }

    const activeIds = new Set(toasts.map((toast) => toast.id));
    for (const [id, timer] of timers.current) {
      if (!activeIds.has(id)) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }
  }, [toasts, dismiss]);

  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      for (const timer of timerMap.values()) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-elevated p-3 shadow-lg"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{toast.title}</p>
              <p className="truncate text-xs text-muted">{toast.body}</p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {toast.conversationId && (
                <button
                  onClick={() => {
                    dismiss(toast.id);
                    onOpenConversation(toast.conversationId as string);
                  }}
                  className="text-xs font-medium text-accent-to hover:underline"
                >
                  Open
                </button>
              )}
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-xs text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
