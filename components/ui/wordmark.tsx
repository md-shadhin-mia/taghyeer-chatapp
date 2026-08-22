"use client";

import { LazyMotion, domAnimation, m } from "motion/react";

export function Wordmark({ className }: { className?: string }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.span
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Taghyeer <span className="font-semibold">Chat</span>
      </m.span>
    </LazyMotion>
  );
}