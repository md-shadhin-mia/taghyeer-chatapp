"use client";

import { motion } from "motion/react";

export function Wordmark({ className }: { className?: string }) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      Taghyeer
      <span className="sr-only">Chat</span>
    </motion.span>
  );
}