"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in seconds (e.g. hero text 0, hero mockup 0.18). */
  delay?: number;
  className?: string;
}

/**
 * Fade-and-rise entrance that fires once when the element scrolls into view
 * (immediately for above-the-fold content). Plain IntersectionObserver + CSS
 * transition rather than Motion's `whileInView`: the landing page scrolls
 * inside its own container (the root layout locks body scroll) and Motion's
 * viewport observer failed to re-fire on nested-container scroll here, while
 * a raw observer works-and a one-shot entrance needs no exit handling.
 * SSR renders the hidden state for everyone (no reduced-motion branch in
 * markup); `motion-reduce:transition-none` snaps it instead of sliding.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer support: reveal on the next frame rather than synchronously,
      // so the effect body never sets state directly (react-hooks rule).
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
