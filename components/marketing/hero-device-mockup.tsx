"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useInViewport } from "@/hooks/use-in-viewport";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

/**
 * Scripted transcript for the laptop. `at` is the timeline step at which the
 * bubble appears; `TYPING_STEP` sits between Maya's messages so a typing row
 * can occupy it before her reply lands. Mirrors the production bubble
 * styling (`components/chat/message-bubble.tsx`) so the landing page reads
 * as the real product, not a mockup of it.
 */
const THREAD = [
  { id: "m1", from: "them" as const, text: "Did you see the new landing page?", at: 0 },
  { id: "m2", from: "me" as const, text: "Yep — looks great 🚀", at: 1 },
  { id: "m3", from: "them" as const, text: "Let's ship it.", at: 3 },
];

/** Phone bubbles ride the same step counter, offset so the devices trade turns. */
const PHONE_THREAD = [
  { from: "them" as const, text: "Weekend plans? 🎉", at: 0 },
  { from: "me" as const, text: "Group call at 6?", at: 2 },
  { from: "them" as const, text: "I'm in! 🙌", at: 4 },
];

const TYPING_STEP = 2;
const FINAL_STEP = 4;
/** Per-step dwell time; the last entry is the pause before the loop restarts. */
const STEP_DELAYS = [1500, 1600, 1700, 1600, 3200];

const SIDEBAR_ROWS = [
  { initials: "MA", name: "Maya", active: true },
  { initials: "DC", name: "Design crew", active: false },
  { initials: "RK", name: "Rakib", active: false },
];

function TypingRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-1.5 text-[10px] text-muted-dim"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-to animate-pulse motion-reduce:animate-none" />
      Maya is typing…
    </motion.div>
  );
}

/** Single check once sent, double (accent-colored) once the reply lands-standing in for delivery. */
function DeliveryStatus({ delivered }: { delivered: boolean }) {
  return (
    <span
      className={`flex items-center ${delivered ? "text-accent-hover" : "text-muted-dim"}`}
      aria-label={delivered ? "Delivered" : "Sent"}
    >
      <svg width="11" height="7" viewBox="0 0 16 10" fill="none" aria-hidden>
        <path
          d="M1 5l3.5 3.5L11 1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {delivered && (
          <path
            d="M5.5 5l3.5 3.5L15.5 1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </span>
  );
}

function Bubble({
  from,
  text,
  delivered,
}: {
  from: "me" | "them";
  text: string;
  delivered?: boolean;
}) {
  const mine = from === "me";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: mine ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: [0.34, 1, 0.64, 1] }}
      className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
    >
      <span
        className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-snug ${
          mine
            ? "rounded-br-sm bg-accent-to text-white"
            : "rounded-bl-sm bg-surface-elevated text-foreground"
        }`}
      >
        {text}
      </span>
      {mine && delivered !== undefined && (
        <span className="mt-0.5 px-0.5">
          <DeliveryStatus delivered={delivered} />
        </span>
      )}
    </motion.div>
  );
}

/**
 * The hero's primary visual: a laptop running a live, looping demonstration
 * of a real-time conversation (messages arriving one at a time, a typing
 * indicator, a delivery tick) with a phone trading its own thread alongside
 * it-rather than a static screenshot. Timers only run while the mockup is
 * on screen (`useInViewport`) and collapse to the finished conversation
 * under `prefers-reduced-motion`.
 */
export function HeroDeviceMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(ref);
  const reduced = useReducedMotionSafe();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inViewport || reduced) return;
    const t = setTimeout(
      () => setStep((s) => (s + 1) % (FINAL_STEP + 1)),
      STEP_DELAYS[step] ?? 1500,
    );
    return () => clearTimeout(t);
  }, [inViewport, reduced, step]);

  // Reduced motion: skip the playback and show the finished conversation.
  const shown = reduced ? FINAL_STEP : step;
  const laptopVisible = THREAD.filter((msg) => shown >= msg.at);
  const showTyping = !reduced && shown === TYPING_STEP;

  return (
    <div ref={ref} className="relative w-full max-w-3xl [perspective:1600px]">
      {/* Laptop-hidden on the smallest screens, where the phone stands alone. */}
      <div className="hidden animate-hero-float sm:block">
        <div
          role="img"
          aria-label="Taghyeer Chat on desktop: a realtime conversation with Maya arriving message by message"
          className="origin-bottom transition-transform duration-700 ease-out [transform:rotateX(9deg)_rotateY(-4deg)] [transform-style:preserve-3d] hover:[transform:rotateX(2deg)_rotateY(0deg)]"
        >
          <div
            aria-hidden
            className="overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-[0_40px_80px_-24px_rgba(59,130,246,0.25),0_24px_48px_-24px_rgba(0,0,0,0.7)]"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-elevated px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-3 rounded-md bg-inset px-3 py-0.5 text-[10px] text-muted-dim">
                taghyeer-chat.netlify.app
              </span>
            </div>

            <div className="grid h-[320px] grid-cols-[150px_1fr] md:grid-cols-[190px_1fr]">
              {/* Sidebar */}
              <div className="flex flex-col gap-1 border-r border-border-subtle bg-inset p-2.5">
                <span className="mb-1 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-dim">
                  Chats
                </span>
                {SIDEBAR_ROWS.map((row) => (
                  <div
                    key={row.name}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                      row.active ? "bg-accent-to/15" : ""
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-to/20 text-[9px] font-semibold text-accent-hover">
                      {row.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{row.name}</p>
                      <div className="mt-1 h-1.5 w-4/5 rounded-full bg-border-subtle" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Thread */}
              <div className="flex flex-col bg-background">
                <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-to/20 text-[9px] font-semibold text-accent-hover">
                    MA
                  </span>
                  <span className="text-xs font-medium">Maya</span>
                  <span className="ml-auto flex items-center gap-1.5 rounded-full border border-border-subtle bg-inset px-2 py-0.5 text-[9px] font-medium tracking-wide text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-to animate-pulse motion-reduce:animate-none" />
                    LIVE
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
                  <AnimatePresence initial={false}>
                    {laptopVisible.map((msg) => (
                      <Bubble
                        key={msg.id}
                        from={msg.from}
                        text={msg.text}
                        delivered={msg.from === "me" ? shown >= TYPING_STEP : undefined}
                      />
                    ))}
                    {showTyping && <TypingRow key="typing" />}
                  </AnimatePresence>
                </div>
                <div className="border-t border-border-subtle p-2.5">
                  <div className="flex items-center gap-2 rounded-full bg-inset px-3 py-1.5">
                    <span className="flex-1 text-[11px] text-muted-dim">Type a message…</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-to">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white" aria-hidden>
                        <path d="M2 21 23 12 2 3v7l15 2-15 2v7Z" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Laptop base */}
          <div
            aria-hidden
            className="mx-auto h-2.5 w-[92%] rounded-b-2xl bg-surface-elevated shadow-[0_16px_32px_-12px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Phone-the whole hero visual below `sm`, an overlapping companion above. */}
      <div className="mx-auto w-52 animate-hero-float-phone sm:absolute sm:-bottom-10 sm:-right-3 sm:mx-0 sm:w-44 md:-right-8 md:w-48">
        <div
          role="img"
          aria-label="Taghyeer Chat on mobile: a second conversation staying in sync alongside it"
          className="transition-transform duration-700 ease-out sm:[transform:rotateY(-14deg)_rotateX(4deg)_rotateZ(3deg)] sm:hover:[transform:rotateY(-4deg)_rotateX(1deg)_rotateZ(1deg)]"
        >
          <div
            aria-hidden
            className="overflow-hidden rounded-[2rem] border border-border-subtle bg-surface p-2 shadow-[0_32px_64px_-20px_rgba(59,130,246,0.3),0_20px_40px_-20px_rgba(0,0,0,0.8)]"
          >
            <div className="flex h-[340px] flex-col overflow-hidden rounded-[1.5rem] bg-background sm:h-[300px]">
              <div className="flex items-center justify-center border-b border-border-subtle py-2">
                <span className="h-1 w-12 rounded-full bg-border-subtle" />
              </div>
              <div className="flex items-center gap-2 border-b border-border-subtle px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-to/20 text-[9px] font-semibold text-accent-hover">
                  WP
                </span>
                <span className="text-xs font-medium">Weekend plans</span>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
                <AnimatePresence initial={false}>
                  {PHONE_THREAD.filter((msg) => shown >= msg.at).map((msg) => (
                    <Bubble key={msg.text} from={msg.from} text={msg.text} />
                  ))}
                </AnimatePresence>
              </div>
              <div className="p-2.5">
                <div className="rounded-full bg-inset px-3 py-1.5 text-[10px] text-muted-dim">
                  Message…
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
