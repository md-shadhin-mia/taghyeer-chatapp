"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Wordmark } from "@/components/ui/wordmark";

const FEATURES = [
  {
    title: "Instant delivery",
    body: "Messages land the moment they're sent, with live status when they don't.",
  },
  {
    title: "Group conversations",
    body: "Spin up a group, promote admins, and manage members on the fly.",
  },
  {
    title: "Always know where you stand",
    body: "Connection status is never a mystery — you'll see it the instant it changes.",
  },
  {
    title: "Search by phone number",
    body: "Find anyone and start chatting without hunting for a username.",
  },
];

const ROTATE_MS = 4200;

export function FeatureShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % FEATURES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const feature = FEATURES[index];
  const duration = prefersReducedMotion ? 0 : 0.35;

  return (
    <div
      className="flex h-full flex-col justify-between p-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Wordmark className="text-2xl font-semibold" />

      <div className="max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration, ease: "easeOut" }}
          >
            <h2 className="mb-3 text-2xl font-semibold tracking-tight">{feature.title}</h2>
            <p className="text-muted">{feature.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex gap-2">
          {FEATURES.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show feature: ${item.title}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent-to" : "w-1.5 bg-border-subtle"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-dim">Sign in to start messaging.</p>
    </div>
  );
}
