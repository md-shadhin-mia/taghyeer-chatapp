"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const subscribeNever = () => () => {};

/**
 * `useReducedMotion` that is `false` during SSR *and* the hydration render,
 * flipping to the real value right after. Use it wherever reduced motion
 * changes rendered markup (element presence, classNames, text) — branching
 * those on the raw hook mismatches the server HTML for reduced-motion users.
 * For Motion transitions/durations the raw hook is fine (they are behavior,
 * not markup).
 */
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return hydrated && Boolean(reduced);
}
