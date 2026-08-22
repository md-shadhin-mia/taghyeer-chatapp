import { create } from "zustand";

const MAX_VISIBLE = 3;

export interface Toast {
  id: string;
  /** Absent when there is nothing to open — e.g. a group you were removed from. */
  conversationId?: string;
  title: string;
  body: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

/**
 * Transient popups are events, not state, so they live apart from the durable
 * unread records in `unread-store`. Nothing here is persisted: a toast the user
 * never saw is not worth restoring — the sidebar badge already covers that.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (toast) =>
    set((state) => {
      // A burst of messages shouldn't bury the screen — keep the newest few.
      const next = [...state.toasts, { ...toast, id: crypto.randomUUID() }];
      return { toasts: next.slice(-MAX_VISIBLE) };
    }),

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));
