"use client";

import { AnimatePresence, motion } from "motion/react";
import { selectConnectionStatus, useConnectionStore } from "@/store/connection-store";

export function ConnectionBanner() {
  const status = useConnectionStore(selectConnectionStatus);

  if (status === "online") return null;

  const isOffline = status === "offline";

  return (
    <AnimatePresence>
      <motion.div
        role="status"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`w-full px-4 py-2 text-center text-sm font-medium ${
          isOffline ? "bg-danger-bg text-danger" : "bg-accent-to/15 text-accent-hover"
        }`}
      >
        {isOffline
          ? "Connection lost. Attempting to reconnect..."
          : "Live updates paused. Messages will still send."}
      </motion.div>
    </AnimatePresence>
  );
}
