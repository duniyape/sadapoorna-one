/**
 * Centralized API & WebSocket configuration helpers.
 * Ensures consistent Base URL and WebSocket resolution across the entire application.
 */

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};

/**
 * Derives the proper WebSocket (ws:// or wss://) URL dynamically from the Base URL.
 * In production: Uses VITE_API_URL host (e.g. wss://api.sadapoorna.in)
 * In development / local: Uses VITE_API_URL host or falls back to current host proxy.
 *
 * @param {string} endpointPath - e.g. `/location/ws/${userId}`
 * @returns {string} full WebSocket URL
 */
export const getWebSocketUrl = (endpointPath) => {
  const normalizedPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const apiBase = getApiBaseUrl();
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (apiBase) {
    try {
      const parsed = new URL(apiBase);
      const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${parsed.host}${normalizedPath}`;
    } catch {
      return `${protocol}//${window.location.host}${normalizedPath}`;
    }
  }

  return `${protocol}//${window.location.host}${normalizedPath}`;
};
