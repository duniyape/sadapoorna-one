import { useState, useRef, useEffect, useCallback } from 'react';

// We use relative paths so Vite's proxy can forward the requests properly 

export const useLiveLocation = () => {
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [usersLocations, setUsersLocations] = useState([]);

  // Fetch token (modify according to your auth logic)
  const getToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

  // ==========================================
  // START TRACKING
  // ==========================================
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setError(null);

    // Request location immediately to preserve user gesture context on mobile (iOS Safari)
    navigator.geolocation.getCurrentPosition(
      async (initialPosition) => {
        const token = getToken();

        try {
          const response = await fetch(`/location/start`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (!data.success) {
            setError(data.message || "Failed to start location tracking");
            return;
          }

          const userId = data.user_id;

          // --------------------------------------
          // WebSocket Setup
          // --------------------------------------
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/location/ws/${userId}`;
          
          const ws = new WebSocket(wsUrl);
          socketRef.current = ws;

          ws.onopen = () => {
            console.log("Location WebSocket connected");
            setTracking(true);

            // Send initial location immediately
            const initialLocData = {
              latitude: initialPosition.coords.latitude,
              longitude: initialPosition.coords.longitude,
              accuracy: initialPosition.coords.accuracy,
              speed: initialPosition.coords.speed,
              heading: initialPosition.coords.heading
            };
            setLocation(initialLocData);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(initialLocData));
            }

            watchIdRef.current = navigator.geolocation.watchPosition(
              (position) => {
                const locationData = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  speed: position.coords.speed,
                  heading: position.coords.heading
                };

                setLocation(locationData);

                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify(locationData));
                }
              },
              (err) => {
                console.error("Location error:", err);
                setError(`Location error: ${err.message}`);
              },
              {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
              }
            );
          };

          ws.onerror = (err) => {
            console.error("WebSocket error", err);
            setError("WebSocket error occurred.");
          };

          ws.onclose = () => {
            console.log("Location WebSocket disconnected");
            setTracking(false);
            if (watchIdRef.current !== null) {
              navigator.geolocation.clearWatch(watchIdRef.current);
              watchIdRef.current = null;
            }
          };

        } catch (err) {
          console.error(err);
          setError("An error occurred while starting tracking.");
        }
      },
      (err) => {
        console.error("Location access denied or failed", err);
        setError(`Location access denied: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }, []);

  // ==========================================
  // STOP TRACKING
  // ==========================================
  const stopTracking = useCallback(async () => {
    const token = getToken();
    try {
      await fetch(`/location/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      setTracking(false);
      setLocation(null);
    } catch (err) {
      console.error(err);
      setError("Failed to stop tracking.");
    }
  }, []);

  // ==========================================
  // GET ALL USERS LOCATIONS
  // ==========================================
  const fetchAllUsersLocations = useCallback(async () => {
    const token = getToken();
    try {
      const response = await fetch(`/location/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsersLocations(data.data);
      }
    } catch (err) {
      console.error("Error fetching users locations:", err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    tracking,
    location,
    usersLocations,
    error,
    startTracking,
    stopTracking,
    fetchAllUsersLocations
  };
};
