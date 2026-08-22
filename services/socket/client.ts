import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/services/config";

let socket: Socket | null = null;
let socketToken: string | null = null;

export function connectSocket(token: string): Socket {
  if (socket && socketToken === token) return socket;

  socket?.disconnect();
  socketToken = token;
  socket = io(SOCKET_URL, { auth: { token } });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return socket?.connected === true;
}

// The server acknowledges `message:send` with `{ ok: true }` or
// `{ ok: false, error }` — it never returns the created message (see API.md).
interface SendAck {
  ok: boolean;
  error?: string;
}

const SEND_ACK_TIMEOUT_MS = 10_000;

/**
 * Why the caller must care which of these happened: a `rejected` send is
 * definitively not stored, so retrying it elsewhere is safe. A `timeout` is
 * ambiguous — the server may well have processed the emit and broadcast it —
 * so it must never be silently retried over REST, or the message duplicates.
 */
export class SocketSendError extends Error {
  constructor(
    message: string,
    readonly reason: "rejected" | "timeout" | "disconnected",
  ) {
    super(message);
    this.name = "SocketSendError";
  }
}

/**
 * Sends over the socket and resolves only once the server acknowledges.
 * Resolves with nothing: the ack carries no message to reconcile against.
 */
export function emitMessageSend(conversationId: string, text: string): Promise<void> {
  const active = socket;
  if (!active?.connected) {
    return Promise.reject(new SocketSendError("Socket is not connected", "disconnected"));
  }

  return new Promise((resolve, reject) => {
    active
      .timeout(SEND_ACK_TIMEOUT_MS)
      .emit(
        "message:send",
        { conversationId, text },
        (timeoutError: Error | null, ack?: SendAck) => {
          if (timeoutError) {
            reject(new SocketSendError("The server didn't acknowledge the message", "timeout"));
          } else if (!ack?.ok) {
            reject(new SocketSendError(ack?.error ?? "The server rejected the message", "rejected"));
          } else {
            resolve();
          }
        },
      );
  });
}
