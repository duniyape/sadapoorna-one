import React from 'react';
import { Menu, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SadapoornaLogo from './SadapoornaLogo';

export default function Navbar({ sidebarCollapsed, setMobileMenuOpen }) {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs transition-all duration-300 left-0 ${
      sidebarCollapsed ? 'md:left-20' : 'md:left-64'
    }`}>
      <div className="flex items-center gap-2">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
          <Home className="w-4 h-4 text-red-600" /> Home
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <SadapoornaLogo size="normal" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Admin" className="w-8 h-8 rounded-full object-cover" />
          <div className="hidden sm:block text-left pr-2">
            <div className="font-bold text-xs text-slate-900">Admin User</div>
            <div className="text-[10px] text-slate-500">Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
