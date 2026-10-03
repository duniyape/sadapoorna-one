import { useEffect, useRef, useCallback } from "react";
import { getWebSocketUrl } from "../utils/api";

export function useLocationSocket(userId, onUpdate) {
  const wsRef = useRef(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep ref updated to avoid re-triggering effect
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!userId) return;

    let reconnectTimeout = null;
    const wsUrl = getWebSocketUrl(`/location/ws/${userId}`);

    const connect = () => {
      console.log('[AutoTrack] Attempting WS connection to', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AutoTrack] WebSocket connected for user', userId);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const data = payload.data || payload;
          if (data && data.type === 'location_update' && onUpdateRef.current) {
            onUpdateRef.current(data);
          }
        } catch (e) {
          console.error('[AutoTrack] Message error:', e);
        }
      };

      ws.onclose = () => {
        console.log('[AutoTrack] WebSocket disconnected. Reconnecting in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[AutoTrack] WebSocket error:', err);
        // Error will typically trigger onclose next
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect loop on unmount
        wsRef.current.close();
      }
    };
  }, [userId]);

  const sendLocation = useCallback((lat, lng, extra = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        latitude: lat,
        longitude: lng,
        accuracy: extra.accuracy,
        speed: extra.speed,
        heading: extra.heading,
        timestamp: Date.now()
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { sendLocation };
}
