import React, { useState, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// ── Page loader fallback ──────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400">Loading...</p>
    </div>
  </div>
);

// Toast config per type
const TOAST_CONFIG = {
  success: { icon: CheckCircle2, bg: 'bg-slate-900', iconColor: 'text-emerald-400', border: 'border-slate-700' },
  error:   { icon: AlertCircle,  bg: 'bg-rose-950',  iconColor: 'text-rose-400',    border: 'border-rose-800' },
  info:    { icon: Info,         bg: 'bg-slate-900', iconColor: 'text-sky-400',     border: 'border-slate-700' },
};

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

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

  /**
   * showToast(message)            → green success toast
   * showToast(message, 'error')   → red error toast
   * showToast(message, 'info')    → blue info toast
   */
  const showToast = (msg, type = 'success') => {
    if (!msg || typeof msg !== 'string') return;
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cfg = toast ? (TOAST_CONFIG[toast.type] || TOAST_CONFIG.success) : null;
  const ToastIcon = cfg?.icon;

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col md:flex-row antialiased overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-[9999] ${cfg.bg} text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-3 border ${cfg.border} animate-in fade-in`}>
          <div className="flex items-center gap-2.5">
            <ToastIcon className={`w-5 h-5 shrink-0 ${cfg.iconColor}`} />
            <span className="text-xs sm:text-sm font-medium">{toast.msg}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 text-slate-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
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
            <Outlet context={{ showToast, searchQuery, user }} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
