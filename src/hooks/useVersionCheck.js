import { useEffect, useRef, useCallback } from 'react';

const VERSION_URL = '/version.json';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

/**
 * Polls /version.json every 5 minutes.
 * If the version has changed since the app loaded, calls onUpdateAvailable().
 * No backend API call — just a tiny 30-byte static file.
 */
export function useVersionCheck(onUpdateAvailable) {
  const initialVersion = useRef(null);
  const onUpdateRef   = useRef(onUpdateAvailable);

  // Keep callback ref fresh without re-triggering effect
  useEffect(() => { onUpdateRef.current = onUpdateAvailable; }, [onUpdateAvailable]);

  const fetchVersion = useCallback(async () => {
    try {
      // Cache-bust to always get fresh file from server
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const serverVersion = data?.v;
      if (!serverVersion) return;

      if (initialVersion.current === null) {
        // First load — store the version the user started with
        initialVersion.current = serverVersion;
      } else if (serverVersion !== initialVersion.current) {
        // Version changed → new deploy detected!
        onUpdateRef.current?.();
      }
    } catch {
      // Network error or server down — silently ignore
    }
  }, []);

  useEffect(() => {
    fetchVersion(); // Check immediately on mount
    const timer = setInterval(fetchVersion, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchVersion]);
}
