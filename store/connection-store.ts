import { create } from "zustand";

/**
 * Global connectivity, assembled from three independent signals:
 *
 * - `browserOnline`   — the browser's own online/offline events (instant, but
 *                       only knows about the local link, not the server).
 * - `serverReachable` — the `/health` poll in `use-global-health.ts` (catches a
 *                       sleeping/failing API while the laptop is happily on wifi).
 * - `socketConnected` — the Socket.IO connection in `use-socket.ts`.
 *
 * The first two gate sending, since both mean a REST write would fail. The third
 * only degrades realtime delivery: history and sending still work over REST, so
 * losing it warns rather than blocks.
 */
interface ConnectionState {
  browserOnline: boolean;
  serverReachable: boolean;
  socketConnected: boolean;
  setBrowserOnline: (value: boolean) => void;
  setServerReachable: (value: boolean) => void;
  setSocketConnected: (value: boolean) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  // All three start optimistic: assume connected until a signal says otherwise,
  // so a healthy load never flashes a banner before the first check lands.
  browserOnline: true,
  serverReachable: true,
  socketConnected: true,
  setBrowserOnline: (value) => set({ browserOnline: value }),
  setServerReachable: (value) => set({ serverReachable: value }),
  setSocketConnected: (value) => set({ socketConnected: value }),
}));

export type ConnectionStatus = "online" | "degraded" | "offline";

export function selectConnectionStatus(state: ConnectionState): ConnectionStatus {
  if (!state.browserOnline || !state.serverReachable) return "offline";
  return state.socketConnected ? "online" : "degraded";
}

export function selectIsOffline(state: ConnectionState): boolean {
  return !state.browserOnline || !state.serverReachable;
}
