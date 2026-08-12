import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col md:flex-row antialiased overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-3 border border-slate-700 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-slate-400 hover:text-white shrink-0">
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
        />

        <div className="pt-16 sm:pt-20 p-3 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
          <Outlet context={{ showToast, searchQuery, user }} />
        </div>
      </main>
    </div>
  );
}
