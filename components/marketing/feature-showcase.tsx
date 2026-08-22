"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { NetworkBackground } from "@/components/marketing/network-background";
import { Wordmark } from "@/components/ui/wordmark";

/** Shared card chrome so every feature's visual occupies the same footprint. */
function PreviewCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-[220px] w-full max-w-sm flex-col rounded-2xl border border-border-subtle bg-surface/80 p-4 shadow-2xl backdrop-blur"
    >
      {children}
    </div>
  );
}

/** Optimistic-send bubble landing instantly, no sending-dots detour. */
function PerformanceVisual() {
  return (
    <PreviewCard label="Preview: messages send instantly, no waiting">
      <div className="mb-3 flex items-center gap-1.5 border-b border-border-subtle pb-3 text-[10px] font-medium uppercase tracking-wide text-muted-dim">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-to)" aria-hidden>
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
        </svg>
        Optimistic send
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="ml-auto flex w-fit max-w-[80%] flex-col items-end gap-1">
          <span className="animate-hero-message-in rounded-2xl rounded-br-sm bg-accent-to px-3 py-1.5 text-xs text-white [animation-delay:0.1s]">
            On my way!
          </span>
          <span className="animate-hero-message-in text-[10px] text-accent-hover [animation-delay:0.3s]">
            Delivered instantly
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-dim">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-inset">
            <span className="block h-full w-[14%] animate-hero-message-in rounded-full bg-accent-to [animation-delay:0.5s]" />
          </span>
          Zero perceived delay
        </div>
      </div>
    </PreviewCard>
  );
}

/** Static, purely decorative conversation snippet-no timers, no live data. */
function InstantMessagesVisual() {
  return (
    <PreviewCard label="Preview of a Taghyeer Chat conversation">
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
    </PreviewCard>
  );
}

const GROUP_MEMBERS = [
  { initials: "MA", color: "#3b82f6" },
  { initials: "RK", color: "#ec4899" },
  { initials: "ME", color: "#f59e0b" },
];

/** A freshly spun-up group: overlapping avatar stack, first message, activity note. */
function GroupChatVisual() {
  return (
    <PreviewCard label="Preview: creating and using a group chat">
      <div className="mb-3 flex items-center gap-3 border-b border-border-subtle pb-3">
        <div className="flex -space-x-2">
          {GROUP_MEMBERS.map((m) => (
            <span
              key={m.initials}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[9px] font-semibold text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.initials}
            </span>
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold">Weekend Trip</p>
          <p className="text-[10px] text-muted-dim">3 members</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className="w-fit max-w-[85%] animate-hero-message-in [animation-delay:0.15s]">
          <p className="mb-0.5 px-1 text-[10px] text-muted-dim">Maya</p>
          <span className="block rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-1.5 text-xs">
            Let&apos;s all meet at 6 🎒
          </span>
        </div>
        <p className="animate-hero-message-in px-1 text-[10px] italic text-muted-dim [animation-delay:0.45s]">
          Rakib added Meem to the group
        </p>
      </div>
    </PreviewCard>
  );
}

/** Loading, empty, and error states side by side-real states, not just a screenshot. */
function PolishedUiVisual() {
  return (
    <PreviewCard label="Preview: loading, empty, and error states">
      <p className="mb-3 border-b border-border-subtle pb-3 text-[10px] font-medium uppercase tracking-wide text-muted-dim">
        Every state, handled
      </p>
      <div className="flex flex-1 flex-col justify-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] text-muted-dim">Loading</span>
          <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-2">
            <span className="h-2 w-2/5 animate-pulse rounded-full bg-border-subtle motion-reduce:animate-none" />
            <span className="h-2 w-1/5 animate-pulse rounded-full bg-border-subtle motion-reduce:animate-none [animation-delay:0.15s]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] text-muted-dim">Empty</span>
          <div className="flex-1 rounded-lg bg-surface-elevated px-3 py-2 text-muted-dim">
            No messages yet
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] text-muted-dim">Error</span>
          <div className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-surface-elevated px-3 py-2">
            <span className="text-danger">Couldn&apos;t send</span>
            <span className="font-medium text-accent-to">Retry</span>
          </div>
        </div>
      </div>
    </PreviewCard>
  );
}

/** Member list with admin controls-promote, remove-mirroring the real group-info panel. */
function AdminControlVisual() {
  return (
    <PreviewCard label="Preview: managing admins and members in a group">
      <div className="mb-3 border-b border-border-subtle pb-3">
        <p className="text-xs font-semibold">Design crew</p>
        <p className="text-[10px] text-muted-dim">3 members</p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        {[
          { name: "Maya", tag: "Admin", tagClass: "bg-accent-to/15 text-accent-hover" },
          { name: "Rakib", tag: "Make admin", tagClass: "text-muted-dim" },
          { name: "Meem", tag: "Remove", tagClass: "text-danger" },
        ].map((row, i) => (
          <div
            key={row.name}
            className="flex animate-hero-message-in items-center justify-between text-xs"
            style={{ animationDelay: `${0.1 + i * 0.15}s` }}
          >
            <span>{row.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tagClass}`}>
              {row.tag}
            </span>
          </div>
        ))}
      </div>
    </PreviewCard>
  );
}

const FEATURES = [
  {
    title: "Performance",
    body: "Built to feel instant-optimistic sends, snappy loads, zero waiting around.",
    Visual: PerformanceVisual,
  },
  {
    title: "Instant messages",
    body: "Messages land the moment they're sent, live over sockets-no refresh, ever.",
    Visual: InstantMessagesVisual,
  },
  {
    title: "Group chat",
    body: "Spin up a group in seconds and bring the whole crew into one thread.",
    Visual: GroupChatVisual,
  },
  {
    title: "Polished UI",
    body: "A refined dark interface with careful loading, empty, and error states.",
    Visual: PolishedUiVisual,
  },
  {
    title: "Admin control on groups",
    body: "Rename groups, add or remove members, and promote admins on the fly.",
    Visual: AdminControlVisual,
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
  const duration = prefersReducedMotion ? 0 : 0.5;

  return (
    <div
      className="relative flex h-full flex-col justify-between overflow-hidden p-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <NetworkBackground />
      {/* Decorative glow, mirrored from the mobile form background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent-from/25 to-accent-to/10 blur-[110px]"
      />

      <Wordmark className="relative text-2xl font-semibold" />

      <div className="relative flex flex-col gap-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration, ease: "easeOut" }}
          >
            <feature.Visual />
          </motion.div>
        </AnimatePresence>

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
