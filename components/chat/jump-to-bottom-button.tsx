"use client";

import { useRef, useEffect } from "react";

export function JumpToBottomButton() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrollHeight = ref.current.scrollHeight - ref.clientHeight;
        const scrollTop = ref.current.scrollTop;
        if (scrollTop >= scrollHeight - 1) {
          // User is at bottom, show button hidden
        } else {
          // User scrolled up, show button
        }
      }
    };
    ref.current?.addEventListener("scroll", handleScroll);
    return () => ref.current?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className="fixed bottom-4 right-4 hidden w-10 h-10 rounded-full bg-accent-to text-accent-from flex items-center justify-center text-xs opacity-0 transition-opacity"
      onClick={() => ref.current?.scrollTo({ top: ref.current.scrollHeight })}
      aria-label="Jump to bottom"
    >
      ↓
    </button>
  );
}