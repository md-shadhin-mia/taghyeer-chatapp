"use client";

import { useEffect } from "react";
import { selectTotalUnread, useUnreadStore } from "@/store/unread-store";

const BASE_TITLE = "Taghyeer Chat";

/**
 * Mirrors the unread total into the browser tab title, so a backgrounded tab
 * still shows that something arrived.
 */
export function useUnreadDocumentTitle() {
  const total = useUnreadStore(selectTotalUnread);

  useEffect(() => {
    const desired = total > 0 ? `(${total}) ${BASE_TITLE}` : BASE_TITLE;
    const apply = () => {
      if (document.title !== desired) document.title = desired;
    };

    apply();

    // React owns the route's <title> element and re-applies it after hydration,
    // which silently overwrites a plain `document.title` assignment-the count
    // would then never appear on a reload. Re-assert it whenever <head> changes.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      document.title = BASE_TITLE;
    };
  }, [total]);
}
