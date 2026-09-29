import { useEffect, useRef, useCallback } from "react";

export function useLocationSocket(userId, onUpdate) {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const shouldReconnect = useRef(true);

  const connect = useCallback(() => {
    if (!userId) return;

    // Prevent multiple connections
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/location/ws/${userId}`);

    socket.onopen = () => {
      console.log("[LiveLocation] WebSocket connected for user:", userId);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "location_update") {
          onUpdate(data);
        }
      } catch (e) {
        console.error("[LiveLocation] Invalid WS message", e);
      }
    };

    socket.onclose = () => {
      console.log("[LiveLocation] WebSocket closed");
      if (shouldReconnect.current) {
        console.log("[LiveLocation] Reconnecting in 3s...");
        reconnectTimer.current = window.setTimeout(connect, 3000);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    ws.current = socket;
  }, [userId, onUpdate]);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  const sendLocation = useCallback((lat, lng, extra = {}) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          latitude: lat,
          longitude: lng,
          ...extra,
        })
      );
    }
  }, []);

  return { sendLocation };
}
