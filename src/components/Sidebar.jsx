import React from 'react';
import { X, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIZED_SIDEBAR } from '../utils/constants';
import SadapoornaLogo from './SadapoornaLogo';

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen, showToast, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (route, label) => {
    navigate(route);
    setMobileMenuOpen(false);
    showToast(`Navigated to ${label}`);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#0C1327] text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800/80 shadow-2xl ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-3 sm:p-4 flex items-center justify-between md:justify-center border-b border-slate-800/80 shrink-0">
        {!sidebarCollapsed ? (
          <div className="scale-90 origin-left md:origin-center cursor-pointer" onClick={() => handleNavigate('/', 'Home')}>
            <SadapoornaLogo />
          </div>
        ) : (
          <div onClick={() => handleNavigate('/', 'Home')} className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-serif text-white font-bold text-lg shadow-md border border-red-400/30 cursor-pointer">
            S
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-3 custom-scrollbar">
        {(() => {
          const allowedIcons = user?.access?.frontend_icons || user?.designation?.frontend_icons || [];
          const isAllowed = (item) => {
            if (!user) return false;
            if (['home', 'ai-suite', 'product-units', 'product-attributes', 'packing-types', 'products', 'warehouses', 'vehicles', 'vendors'].includes(item.id)) return true; 
            return allowedIcons.some(iconData => {
              if (typeof iconData === 'string') return iconData === item.id;
              if (typeof iconData === 'object') return iconData.icon === item.id;
              return false;
            });
          };

          const filteredSidebar = CATEGORIZED_SIDEBAR.map(group => ({
            ...group,
            items: group.items.filter(isAllowed)
          })).filter(group => group.items.length > 0);

          return filteredSidebar.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5 flex items-center justify-between">
                  <span>{group.category}</span>
                </div>
              )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.route;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.route, item.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-xs transition-all duration-150 group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600/20 via-indigo-600/30 to-indigo-900/20 text-white border-l-4 border-red-500 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))})()}
      </div>

      <div className="p-2 border-t border-slate-800/80 shrink-0 space-y-2">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs font-semibold transition-colors hidden md:flex"
        >
          {sidebarCollapsed ? <ChevronsRight className="w-5 h-5 text-indigo-400" /> : <><ChevronsLeft className="w-4 h-4 text-indigo-400" /><span>Collapse Sidebar</span></>}
        </button>
      </div>
    </aside>
  );
}
