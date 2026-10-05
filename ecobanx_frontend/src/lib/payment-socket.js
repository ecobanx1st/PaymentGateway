import { io } from "socket.io-client";

const PAYMENT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3700/ecobanxApi").replace(
    /\/ecobanxApi\/?$/,
    "",
  );

function normalizeSocketToken(token) {
  return typeof token === "string"
    ? token.replace(/^Bearer\s+/i, "").trim()
    : "";
}

/**
 * Creates a Socket.IO connection for a single payment page session.
 *
 * The backend socket requires an authenticated checkout token
 * (verified via `socketAuth`), which is short-lived and scoped to one
 * transaction, so a fresh connection is created per payment page mount
 * instead of a shared singleton. The caller owns the connection:
 * join/leave the transaction room and call `socket.disconnect()` on
 * unmount.
 *
 * @param {string} token - Checkout token (with or without "Bearer " prefix).
 * @returns {import("socket.io-client").Socket}
 */
export function createPaymentSocket(token) {
  return io(PAYMENT_SOCKET_URL, {
    auth: { token: normalizeSocketToken(token) },
    transports: ["websocket", "polling"],
  });
}

export const PAYMENT_PAYLOAD_STATUS_CONFIRMED = "confirmed";