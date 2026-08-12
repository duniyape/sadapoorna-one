import React from 'react';
import { Menu, Home, Search, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ sidebarCollapsed, setMobileMenuOpen, searchQuery, setSearchQuery }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [userProfile, setUserProfile] = React.useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data.user || data.data || data); // handle different response structures
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className={`fixed top-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shadow-xs transition-all duration-300 left-0 ${
      sidebarCollapsed ? 'md:left-16' : 'md:left-56'
    }`}>
      <div className="flex items-center gap-2">
        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
          <Home className="w-4 h-4 text-red-600" /> Home
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center px-2 sm:px-6 max-w-xl mx-auto">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 bg-slate-100 rounded-full border border-transparent shadow-xs hover:bg-slate-200/50 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          {userProfile?.profile_photo ? (
            <img src={userProfile.profile_photo} alt={userProfile.name} className="w-8 h-8 rounded-full object-cover shadow-sm bg-white" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {(userProfile?.name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left pr-2">
            <div className="font-bold text-xs text-slate-900 truncate max-w-[120px]">{userProfile?.name || 'Loading...'}</div>
            <div className="text-[10px] text-slate-500 capitalize">{userProfile?.designation?.name || userProfile?.role || 'Staff'}</div>
          </div>
        </div>
        
        <button onClick={handleLogout} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors shadow-sm border border-red-100" title="Logout">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
