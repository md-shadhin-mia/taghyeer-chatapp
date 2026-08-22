"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Rotates through what the product actually does, one line at a time. */
const CAPTIONS = [
  "REAL-TIME COMMUNICATION",
  "INSTANT MESSAGE DELIVERY",
  "GROUP CONVERSATIONS",
  "LIVE TYPING INDICATORS",
];

const ROTATE_MS = 3000;

export function HeroStatusBadge() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % CAPTIONS.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);

  const caption = reducedMotion ? CAPTIONS[0] : CAPTIONS[index];

  return (
    <span
      className="flex items-center gap-2 overflow-hidden rounded-full border border-border-subtle bg-surface px-4 py-1 text-xs font-medium tracking-wide text-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-to animate-pulse motion-reduce:animate-none" />
      <span className="relative inline-grid">
        {/* Reserves width for the longest caption so the pill never resizes as it rotates. */}
        <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {CAPTIONS.reduce((longest, c) => (c.length > longest.length ? c : longest))}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {caption}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
