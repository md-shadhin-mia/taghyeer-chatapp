"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Wordmark } from "@/components/ui/wordmark";

const FEATURES = [
  {
    title: "Performance",
    body: "Built to feel instant-optimistic sends, snappy loads, zero waiting around.",
  },
  {
    title: "Instant messages",
    body: "Messages land the moment they're sent, live over sockets-no refresh, ever.",
  },
  {
    title: "Group chat",
    body: "Spin up a group in seconds and bring the whole crew into one thread.",
  },
  {
    title: "Polished UI",
    body: "A refined dark interface with careful loading, empty, and error states.",
  },
  {
    title: "Admin control on groups",
    body: "Rename groups, add or remove members, and promote admins on the fly.",
  },
];

const ROTATE_MS = 4200;

/** Static, purely decorative conversation snippet-no timers, no live data. */
function ChatPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of a Taghyeer Chat conversation"
      className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface/80 p-4 shadow-2xl backdrop-blur"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-border-subtle pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-to text-xs font-semibold text-white">
          N
        </div>
        <div>
          <p className="text-xs font-semibold">Nusrat Jahan</p>
          <p className="text-[10px] text-accent-hover">online</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-fit max-w-[75%] animate-hero-message-in rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-1.5 text-xs [animation-delay:0.15s]">
          Kemon acho? Cholo aj plan kori 🎉
        </div>
        <div className="ml-auto w-fit max-w-[75%] animate-hero-message-in rounded-2xl rounded-br-sm bg-accent-to px-3 py-1.5 text-xs text-white [animation-delay:0.45s]">
          Obosshoi! Group banai ekhon
        </div>
        <div className="w-fit max-w-[75%] animate-hero-message-in rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-1.5 text-xs [animation-delay:0.75s]">
          Perfect-invite pathao 👌
        </div>
      </div>
    </div>
  );
}

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
  const duration = prefersReducedMotion ? 0 : 0.5;

  return (
    <div
      className="relative flex h-full flex-col justify-between overflow-hidden p-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Decorative glow, mirrored from the mobile form background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-from/25 to-accent-to/10 blur-[110px]"
      />

      <Wordmark className="relative text-2xl font-semibold" />

      <div className="relative flex flex-col gap-10">
        <ChatPreview />

        <div className="max-w-md">
          {/* min-height fits the tallest slide (two-line title + body) so the
              dots below don't jump as titles of different lengths rotate. */}
          <div className="min-h-40">
            <AnimatePresence mode="wait">
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
              transition={{ duration, ease: "easeOut" }}
            >
              <h2 className="mb-3 text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
                {feature.title}
              </h2>
              <p className="text-muted">{feature.body}</p>
            </motion.div>
            </AnimatePresence>
          </div>

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
      </div>

      <p className="relative text-xs text-muted-dim">Sign in to start messaging.</p>
    </div>
  );
}
