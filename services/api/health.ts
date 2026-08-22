import { HEALTH_URL } from "@/services/config";

// A hung request is an outage as far as the user is concerned — cap it well
// under the healthy poll interval so a stalled check can never overlap the next.
const HEALTH_TIMEOUT_MS = 8_000;

/**
 * Pings `GET /health`. Resolves `true` only for a 2xx response; a network
 * failure, timeout, or error status all resolve `false` rather than throwing —
 * "unreachable" is the answer, not an exception for callers to handle.
 *
 * Not routed through `apiRequest` because /health sits at the server root
 * (outside `/api`) and needs no auth header.
 */
export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  const timeout = AbortSignal.timeout(HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(HEALTH_URL, {
      cache: "no-store",
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    return response.ok;
  } catch {
    return false;
  }
}
