"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const NEAR_BOTTOM_PX = 80;

interface UseAutoScrollOptions {
  itemCount: number;
  lastItemId: string | null;
  resetKey: string | null;
}

export function useAutoScroll({ itemCount, lastItemId, resetKey }: UseAutoScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  const isAtBottomRef = useRef(isAtBottom);
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  const prevLastItemIdRef = useRef<string | null>(null);
  const prevResetKeyRef = useRef<string | null>(null);

  function evaluateScrollPosition() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < NEAR_BOTTOM_PX;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMessageCount(0);
  }

  // Attach the scroll listener directly via addEventListener rather than
  // JSX onScroll — React's synthetic scroll event does not reliably fire
  // for every native scroll in all environments, so this bypasses that.
  // Depends on itemCount (not []) because the scrollable container only
  // mounts once messages have loaded — while loading, MessageList renders
  // a spinner instead, so scrollRef.current is still null at first mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", evaluateScrollPosition, { passive: true });
    return () => el.removeEventListener("scroll", evaluateScrollPosition);
  }, [itemCount]);

  function scrollToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setIsAtBottom(true);
    setNewMessageCount(0);
  }

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const conversationChanged = prevResetKeyRef.current !== resetKey;
    prevResetKeyRef.current = resetKey;

    if (conversationChanged) {
      el.scrollTop = el.scrollHeight;
      setIsAtBottom(true);
      setNewMessageCount(0);
      prevLastItemIdRef.current = lastItemId;
      return;
    }

    // A transient render with no messages yet (e.g. a brief refetch window)
    // must never overwrite the tracked id — otherwise the next real message
    // to arrive would be wrongly compared against `null` instead of the
    // last message actually seen, and this hook would silently forget it.
    if (lastItemId === null) return;

    const itemAdded = prevLastItemIdRef.current !== lastItemId;
    prevLastItemIdRef.current = lastItemId;
    if (!itemAdded) return;

    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    } else {
      setNewMessageCount((count) => count + 1);
    }
  }, [itemCount, lastItemId, resetKey]);

  return { scrollRef, isAtBottom, newMessageCount, scrollToBottom };
}
