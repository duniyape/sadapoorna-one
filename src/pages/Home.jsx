import React, { useState, useMemo } from 'react';
import { Search, X, Users, ShieldCheck } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SALES_OPERATIONS, HR_FLEET_MODULES } from '../utils/constants';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const filteredSalesOps = useMemo(() => {
    if (!searchQuery.trim()) return SALES_OPERATIONS;
    return SALES_OPERATIONS.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredHrModules = useMemo(() => {
    if (!searchQuery.trim()) return HR_FLEET_MODULES;
    return HR_FLEET_MODULES.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getRoute = (id) => {
    const directRoutes = ['add-customer', 'orders', 'customers', 'inventory-stock', 'ai-suite'];
    if (directRoutes.includes(id)) {
      return `/${id}`;
    }
    return `/module/${id}`;
  };

  const handleCardClick = (item) => {
    navigate(getRoute(item.id));
    showToast(`Navigated to ${item.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5 py-2 px-3">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Trusted partner in rice, grains, and essential commodities.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mx-auto">
          Click any module below to launch its dedicated full page workspace, powered by Sadapoorna Enterprise.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative px-1">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules (e.g. Orders, Stock, AI, Customer)..."
            className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white rounded-full border border-slate-200/90 shadow-2xs hover:shadow-md text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sales Operations Section */}
      <section className="bg-white/95 backdrop-blur rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-indigo-200/60 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 border-b border-indigo-50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl border border-indigo-100">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Customer &amp; Sales Operations
            </h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-indigo-100 shrink-0">
            {filteredSalesOps.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4">
          {filteredSalesOps.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center min-h-[110px] sm:min-h-[125px]"
              >
                {item.badge && (
                  <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                    {item.badge}
                  </span>
                )}
                <div className={`p-2.5 sm:p-3.5 rounded-2xl ${item.color} mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs border`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* HR & Fleet Section */}
      <section className="bg-white/95 backdrop-blur rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-200/60 shadow-xs relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 border-b border-emerald-50">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              HR, Staff &amp; Fleet Management
            </h2>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-100 shrink-0">
            {filteredHrModules.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4">
          {filteredHrModules.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center min-h-[110px] sm:min-h-[125px]"
              >
                {item.badge && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                    {item.badge}
                  </span>
                )}
                <div className={`p-2.5 sm:p-3.5 rounded-2xl ${item.color} mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs border`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
