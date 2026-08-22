"use client";

import { useEffect, useState, type RefObject } from "react";

interface UseInViewportOptions {
  /** Shrink/grow the observed area; default triggers slightly before fully visible. */
  rootMargin?: string;
}

/**
 * Live viewport visibility for an element. Unlike Motion's `whileInView` this
 * returns a boolean that flips both ways, which is what the landing-page demos
 * need: their timers must stop the moment they scroll offscreen and resume when
 * they come back.
 *
 * Also doubles as a client-only gate-it can only ever be `true` after mount,
 * so anything rendered behind it (e.g. demo messages stamped with `Date.now()`)
 * never renders during SSR and cannot cause a hydration mismatch.
 */
export function useInViewport(
  ref: RefObject<Element | null>,
  { rootMargin = "0px 0px -10% 0px" }: UseInViewportOptions = {},
): boolean {
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inViewport;
}
