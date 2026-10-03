import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2, X, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useVersionCheck } from '../hooks/useVersionCheck';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useLocationSocket } from '../hooks/useLocationSocket';
import { useGeolocation } from '../hooks/useGeolocation';

// ── Helper: Calculate distance in meters using Haversine formula ──────────────
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ── Page loader fallback ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400">Loading...</p>
    </div>
  </div>
);

// Premium Toast config
const TOAST_CONFIG = {
  success: { 
    icon: CheckCircle2, 
    containerClass: 'bg-emerald-500 border-emerald-400 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.7)]',
    iconContainer: 'bg-emerald-600 text-white',
    textColor: 'text-white'
  },
  error: { 
    icon: AlertCircle,  
    containerClass: 'bg-rose-600 border-rose-500 shadow-[0_20px_50px_-10px_rgba(225,29,72,0.7)]',
    iconContainer: 'bg-rose-700 text-white',
    textColor: 'text-white'
  },
  info: { 
    icon: Info,         
    containerClass: 'bg-blue-600 border-blue-500 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.7)]',
    iconContainer: 'bg-blue-700 text-white',
    textColor: 'text-white'
  },
};

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // ── Version polling: detect new deploys while user is active ─────────────────
  useVersionCheck(() => setUpdateAvailable(true));

  const currentUserId = user?.id || user?._id || localStorage.getItem('userId');

  // ── Real-time WS location state (updated from other users' broadcasts) ──────
  const [liveLocations, setLiveLocations] = useState([]);

  const handleLiveUpdate = useCallback((update) => {
    if (typeof update.latitude !== 'number' || typeof update.longitude !== 'number') return;
    setLiveLocations((prev) => {
      const idx = prev.findIndex((l) => l.user_id === update.user_id);
      const newLoc = {
        user_id: update.user_id,
        latitude: update.latitude,
        longitude: update.longitude,
        accuracy: update.accuracy,
        speed: update.speed,
        heading: update.heading,
        tracking: true,
        updated_at: update.updated_at,
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newLoc };
        return copy;
      }
      return [...prev, newLoc];
    });
  }, []);

  // --- GPS Tracking Activated ---
  // WebSocket auto-connects as soon as userId is available
  const { sendLocation } = useLocationSocket(currentUserId, handleLiveUpdate);

  // GPS auto-starts once user is loaded
  const { position } = useGeolocation(!!currentUserId);

  // Auto-call /location/start once user is available
  useEffect(() => {
    if (!currentUserId || trackingStarted) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('/location/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          console.log('[AutoTrack] Tracking started for user:', currentUserId);
          setTrackingStarted(true);
        }
      })
      .catch(() => {
        // Backend might already have it started — mark as started anyway
        setTrackingStarted(true);
      });
  }, [currentUserId, trackingStarted]);

  const lastSentPosRef = useRef(null);

  // Send GPS position via WebSocket whenever it updates, but only if moved > 10 meters
  useEffect(() => {
    if (!position || !currentUserId || !trackingStarted) return;

    if (lastSentPosRef.current) {
      const distance = calculateDistanceMeters(
        lastSentPosRef.current.latitude,
        lastSentPosRef.current.longitude,
        position.latitude,
        position.longitude
      );

      // Don't send if distance is less than 10 meters
      if (distance < 10) return;
    }

    sendLocation(position.latitude, position.longitude, {
      accuracy: position.accuracy,
      speed: position.speed,
      heading: position.heading,
    });

    lastSentPosRef.current = {
      latitude: position.latitude,
      longitude: position.longitude
    };
  }, [position, currentUserId, trackingStarted, sendLocation]);

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data.data || data);
        } else if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error("Failed to fetch layout user", err);
      }
    };
    fetchUser();
  }, []);

  const showToast = useCallback((msg, type = 'success') => {
    if (!msg || typeof msg !== 'string') return;
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  }, []);

  const cfg = toast ? (TOAST_CONFIG[toast.type] || TOAST_CONFIG.success) : null;
  const ToastIcon = cfg?.icon;

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col md:flex-row antialiased overflow-x-hidden">

      {/* New Deploy Banner — shown when version.json changes while user is active */}
      {updateAvailable && (
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            <span className="text-sm font-medium">New update available! Refresh to get the latest version.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold bg-white text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors"
            >
              Refresh Now
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="p-1 text-indigo-200 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Premium Top-Centered Toast Banner */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[10000] flex items-center p-2 sm:p-3 rounded-full border-2 pointer-events-auto max-w-[95vw] sm:max-w-2xl w-max animate-in slide-in-from-top-10 fade-in duration-300 zoom-in ${cfg.containerClass}`}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner ${cfg.iconContainer}`}>
            <ToastIcon className="w-7 h-7 sm:w-10 sm:h-10" />
          </div>
          <span className={`px-5 sm:px-8 text-base sm:text-xl font-black flex-1 text-center sm:text-left leading-tight tracking-wide ${cfg.textColor}`}>
            {toast.msg}
          </span>
          <button onClick={() => setToast(null)} className="p-3 text-white/70 hover:text-white shrink-0 bg-black/10 hover:bg-black/30 rounded-full transition-colors ml-2">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        showToast={showToast}
        user={user}
      />

      {/* Header and Content Area */}
      <main className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
      }`}>
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          setMobileMenuOpen={setMobileMenuOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}
        />

        <div className="pt-16 sm:pt-20 p-3 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ showToast, searchQuery, user, liveLocations, currentUserId, trackingStarted }} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
