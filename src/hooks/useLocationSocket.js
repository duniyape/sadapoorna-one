import { useEffect, useRef, useCallback } from "react";

export function useLocationSocket(userId, onUpdate) {
  // WebSocket completely disabled per user request to stop reconnect errors
  
  const sendLocation = useCallback((lat, lng, extra = {}) => {
    // Disabled: no-op
  }, []);

  return { sendLocation };
}
