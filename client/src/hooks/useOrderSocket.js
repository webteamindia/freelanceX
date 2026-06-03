import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

/**
 * Subscribe to real-time messages for an order thread.
 */
export function useOrderSocket({ orderId, jwt, onMessage }) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!orderId || !jwt) return undefined;

    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      auth: { token: jwt },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join:order", { orderId });
    });

    socket.on("message:new", (payload) => {
      if (payload?.message && onMessageRef.current) {
        onMessageRef.current(payload.message);
      }
    });

    return () => {
      socket.emit("leave:order", { orderId });
      socket.disconnect();
    };
  }, [orderId, jwt]);
}
