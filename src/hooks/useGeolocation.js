import { useState, useEffect, useCallback, useRef } from "react";

export function useGeolocation(enabled) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const watchId = useRef(null);

  const updatePosition = useCallback((pos) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
    });
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser");
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(updatePosition, (err) => {
      setError(err.message);
    });

    watchId.current = navigator.geolocation.watchPosition(
      updatePosition,
      (err) => setError(err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [enabled, updatePosition]);

  return { position, error };
}
