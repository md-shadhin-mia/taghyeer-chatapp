export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://frontend-task-chatapp.onrender.com/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  "https://frontend-task-chatapp.onrender.com";

// The health check lives at the server root, not under /api (see API.md), so it
// is derived from the socket origin rather than from API_BASE_URL.
export const HEALTH_URL =
  process.env.NEXT_PUBLIC_HEALTH_URL ?? `${SOCKET_URL}/health`;

export const AUTH_STORAGE_KEY = "taghyeer-auth";
