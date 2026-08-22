"use client";

import { motion } from "framer-motion";
import { useToast } from "@/store/toast-store";

export function ToastStack({ onOpenConversation }: { onOpenConversation: (id: string) => void }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-sm z-50">
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          className="bg-background border border-border-subtle rounded-md p-3 flex items-start gap-3 shadow-sm animate__inherits"
          style={{
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
          whileHover={{
            transform: "translateX(4px)",
          }}
          whileTap={{
            transform: "scale(0.95)",
          }}
        >
          <div className="flex-shrink-0 rounded-md p-2" style={{ width: "40px", height: "40px" }}>
            <motion.span
              initial="0"
              animate={1}
              className="block rounded-full bg-border-subtle"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => {
                  removeToast(toast.id);
                  onOpenConversation(toast.conversationId);
                }}
                className="ml-auto text-xs text-muted hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}