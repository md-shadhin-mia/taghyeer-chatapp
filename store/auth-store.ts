import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AUTH_STORAGE_KEY } from "@/services/config";

interface AuthState {
  token: string | null;
  hasHydrated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      // Rehydration is triggered manually (see AppProviders) so this store
      // never touches `localStorage` during server-side rendering.
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
