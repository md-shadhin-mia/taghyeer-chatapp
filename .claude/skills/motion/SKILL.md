---
name: motion
description: Animation guidance for this chat app using Motion (motion@13, formerly Framer Motion) and Tailwind v4 keyframes. Load before adding, changing, or reviewing any animation — entrance/exit transitions, list reordering, modal open/close, loading indicators, gestures, or when deciding whether an animation needs a library at all.
---

# Animation in this codebase

Stack: `motion@13` (imported from `motion/react`; it re-exports `framer-motion`), Tailwind CSS v4, React 19, Next 16 App Router.

## 1. First decide: CSS or Motion?

**Default to CSS.** Reach for Motion only when CSS genuinely cannot do the job:

| Use CSS/Tailwind | Use Motion |
| --- | --- |
| Looping indicators (sending dots, spinners, skeleton pulse) | **Exit** animations (element leaving the DOM) |
| Hover/focus states, color and opacity transitions | **Layout/FLIP** (items sliding when a list reorders) |
| Anything that runs on mount and never stops | Spring physics, interruptible/reversible transitions |
| One-shot entrance where exit doesn't matter | Gestures: drag, swipe-to-reply, drag-to-dismiss |

If a plain `transition-*` utility or an `@theme` keyframe does it, use that — do not add `<motion.div>` for it. An animation that CSS handles costs 0 kB.

## 2. CSS animations belong in the theme, not in one-off classes

Tailwind v4 makes keyframes first-class. Register them in `app/globals.css` so they become real utilities and stay tokenized alongside the color scales:

```css
@theme {
  --animate-sending-dot: sending-dot 1.1s infinite ease-in-out;

  @keyframes sending-dot {
    0%, 70%, 100% { opacity: 0.25; transform: translateY(0); }
    35%           { opacity: 1;    transform: translateY(-2px); }
  }
}
```

Then use `className="animate-sending-dot"`. Do not hand-write bare `.my-animation` classes outside `@theme`. The only rules that belong outside are the `prefers-reduced-motion` overrides (see §4) — unlayered CSS wins over Tailwind's `@layer utilities`, which is what lets them override the generated utility.

Existing theme animations: `animate-sending-dot` (sending indicator), `animate-message-pop` (incoming message entrance).

## 3. Motion usage rules for this project

**Import from `motion/react`.** Not `framer-motion` (the legacy package name) and not bare `motion`.

**Every file using Motion needs `"use client"`.** The chat tree already is; a Server Component that renders `<motion.div>` will fail at build.

**Prefer `LazyMotion` + `m` over `motion` in shared components.** `motion.*` pulls the whole feature set into the initial bundle; `m` + `domAnimation` is a fraction of the size.

```tsx
"use client";
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";

<LazyMotion features={domAnimation} strict>
  <AnimatePresence initial={false}>
    {isOpen && (
      <m.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />
    )}
  </AnimatePresence>
</LazyMotion>
```

`strict` makes it a type error to use `motion.*` inside, which is the point — it stops the bundle from silently regrowing. `domAnimation` covers enter/exit/gesture; `domMax` adds layout animations and costs more, so only swap it in where a layout animation actually renders.

**`AnimatePresence` needs a stable `key` on its direct children** and only animates exit for children that unmount from *its* subtree. Conditional rendering above it defeats it.

## 4. Honor reduced motion — always

```tsx
import { useReducedMotion } from "motion/react";
const reduced = useReducedMotion();
// then: y: reduced ? 0 : 8   /   transition={{ duration: reduced ? 0 : 0.18 }}
```

For CSS keyframes, pair every looping animation with:

```css
@media (prefers-reduced-motion: reduce) {
  .thing { animation: none; }
}
```

Never ship a looping or large-travel animation without a reduced-motion path.

## 5. Chat-specific hazards (read before animating the message list)

**Animating message bubbles fights `hooks/use-auto-scroll.ts`.** That hook samples scroll position to decide "is the user near the bottom?" If an entering bubble changes the list's height over ~200ms, the measurement is taken mid-animation and the jump-to-bottom button flickers on every new message.

If you animate bubbles in `components/chat/message-list.tsx`:

- Animate **`opacity` and `transform` only**. Never `height`, `margin`, `padding`, or `scale` on a container whose height the scroll math depends on — layout must be final on frame one.
- Keep durations short (≤ 200ms). Long entrances widen the window where scroll state is wrong.
- Re-verify: send a message while scrolled to the bottom (should stick), and while scrolled up (must NOT force-scroll, and the jump button should appear once and stay stable).

**Do not animate on `status` changes in `message-bubble.tsx`.** An optimistic message re-renders as `sending` → confirmed (and its `_id` changes from `temp-*` to the server id). Keying an animation off that makes every sent message replay its entrance. The bubble's existing `opacity-60` + dots treatment is the intended sending affordance.

**Socket-driven updates arrive unpredictably.** Any animation in the message path can fire in bursts when several messages land at once, or on reconnect when the cache re-syncs. Test with rapid messages and with a socket reconnect before considering it done.

## 6. Review checklist

- [ ] Could CSS/`@theme` have done this? If yes, it should have.
- [ ] `"use client"` present on the file.
- [ ] Imported from `motion/react`; `m` + `LazyMotion` used in shared components.
- [ ] `useReducedMotion` (or a `prefers-reduced-motion` block) honored.
- [ ] No `height`/`margin` animation anywhere inside the scrolling message list.
- [ ] Auto-scroll re-verified: sticks at bottom, does not yank when scrolled up.
- [ ] Animation supports the chat workflow rather than decorating it (per AGENTS.md §4).
