"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewport } from "@/hooks/use-in-viewport";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

/**
 * Scripted transcript for the laptop. `at` is the timeline step at which the
 * bubble appears; the typing indicator fills the step before an incoming
 * message. Steps advance only while the mockup is in the viewport.
 */
const THREAD = [
  { from: "them" as const, name: "Maya", text: "Did you see the new landing page?", at: 0 },
  { from: "me" as const, name: "", text: "Just shipped it 🚀", at: 1 },
  { from: "them" as const, name: "Maya", text: "It updates instantly on my end 😍", at: 3 },
  { from: "me" as const, name: "", text: "Realtime-no refresh, ever ✨", at: 5 },
];

/** Phone bubbles ride the same step counter, offset so the devices trade turns. */
const PHONE_THREAD = [
  { from: "them" as const, text: "Weekend plans? 🎉", at: 0 },
  { from: "me" as const, text: "Group call at 6?", at: 2 },
  { from: "them" as const, text: "I'm in! 🙌", at: 4 },
];

/** Step 2 shows Maya typing on the laptop before her second message lands. */
const TYPING_STEP = 2;
const FINAL_STEP = 5;
/** Per-step dwell time; the last entry is the pause before the loop restarts. */
const STEP_DELAYS = [1000, 1300, 1300, 1300, 1300, 3200];

const SIDEBAR_ROWS = [
  { initials: "MA", name: "Maya", active: true },
  { initials: "DC", name: "Design crew", active: false },
  { initials: "RK", name: "Rakib", active: false },
];

function TypingDots() {
  return (
    <span className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-surface-elevated px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted animate-sending-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function Bubble({
  from,
  name,
  text,
}: {
  from: "me" | "them";
  name?: string;
  text: string;
}) {
  const mine = from === "me";
  return (
    <div className={`flex flex-col animate-hero-message-in ${mine ? "items-end" : "items-start"}`}>
      {name ? <span className="mb-0.5 text-[10px] text-muted-dim">{name}</span> : null}
      <span
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-snug ${
          mine
            ? "rounded-br-sm bg-accent-to text-white"
            : "rounded-bl-sm bg-surface-elevated text-foreground"
        }`}
      >
        {text}
      </span>
    </div>
  );
}

export function HeroDeviceMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const inViewport = useInViewport(ref);
  const reduced = useReducedMotionSafe();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inViewport || reduced) return;
    const t = setTimeout(
      () => setStep((s) => (s + 1) % (FINAL_STEP + 1)),
      STEP_DELAYS[step] ?? 1300,
    );
    return () => clearTimeout(t);
  }, [inViewport, reduced, step]);

  // Reduced motion: skip the playback and show the finished conversation.
  const shown = reduced ? FINAL_STEP : step;

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
                taghyeer.chat
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
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    live
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
                  {THREAD.filter((msg) => shown >= msg.at).map((msg) => (
                    <Bubble key={msg.text} from={msg.from} text={msg.text} />
                  ))}
                  {!reduced && shown === TYPING_STEP ? (
                    <div className="flex animate-hero-message-in">
                      <TypingDots />
                    </div>
                  ) : null}
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
          aria-label="Taghyeer Chat on mobile: the same group conversation staying in sync"
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
                {PHONE_THREAD.filter((msg) => shown >= msg.at).map((msg) => (
                  <Bubble key={msg.text} from={msg.from} text={msg.text} />
                ))}
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
