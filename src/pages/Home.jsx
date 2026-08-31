import React, { useMemo } from 'react';
import { Users, ShieldCheck, Building2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SALES_OPERATIONS, HR_FLEET_MODULES, MASTER_MODULES } from '../utils/constants';

export default function Home() {
  const navigate = useNavigate();
  const { showToast, searchQuery = '', user } = useOutletContext();

  const allowedIcons = user?.access?.frontend_icons || user?.designation?.frontend_icons || [];
  const isAllowed = (item) => {
    if (!user) return false; // Hide modules until user is loaded
    if (['home', 'ai-suite', 'product-units', 'product-attributes', 'packing-types', 'products', 'warehouses', 'vehicles', 'vendors', 'purchase-orders', 'warehouse-in', 'warehouse-inventory', 'vehicle-in', 'main-inventory'].includes(item.id)) return true;
    return allowedIcons.some(iconData => {
      if (typeof iconData === 'string') return iconData === item.id;
      if (typeof iconData === 'object') return iconData.icon === item.id;
      return false;
    });
  };

  const filteredSalesOps = useMemo(() => {
    let items = SALES_OPERATIONS.filter(isAllowed);
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, user]);

  const filteredHrModules = useMemo(() => {
    let items = HR_FLEET_MODULES.filter(isAllowed);
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, user]);

  const filteredMasterModules = useMemo(() => {
    let items = MASTER_MODULES.filter(isAllowed);
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, user]);

  const getRoute = (id) => {
    const directRoutes = ['add-customer', 'orders', 'add-order', 'customers', 'inventory-stock', 'main-inventory', 'ai-suite', 'branch-profile', 'department', 'designation', 'users', 'accessibility', 'data-access', 'product-units', 'product-attributes', 'packing-types', 'products', 'warehouses', 'vehicles', 'vendors', 'purchase-orders', 'warehouse-in', 'warehouse-inventory', 'vehicle-in'];
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
    <div className="space-y-4 pt-2">
      {/* Sales Operations Section */}
      {filteredSalesOps.length > 0 && (
        <section className="bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-200/60 shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-indigo-50/50">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl border border-indigo-100">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Customer &amp; Sales Operations
            </h2>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-indigo-100 shrink-0">
            {filteredSalesOps.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
          {filteredSalesOps.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center min-h-[85px] sm:min-h-[100px]"
              >
                {item.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {item.badge}
                  </span>
                )}
                <div className={`p-2 sm:p-2.5 rounded-xl ${item.color} mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform shadow-xs border`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
        </section>
      )}

      {/* HR & Fleet Section */}
      {filteredHrModules.length > 0 && (
        <section className="bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-200/60 shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-emerald-50/50">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              HR, Staff &amp; Fleet Management
            </h2>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-100 shrink-0">
            {filteredHrModules.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
          {filteredHrModules.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center min-h-[85px] sm:min-h-[100px]"
              >
                {item.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {item.badge}
                  </span>
                )}
                <div className={`p-2 sm:p-2.5 rounded-xl ${item.color} mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform shadow-xs border`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
        </section>
      )}

      {/* Master Configurations Section */}
      {filteredMasterModules.length > 0 && (
        <section className="bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-200/60 shadow-sm relative overflow-hidden transition-all">
        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-amber-50/50">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl border border-amber-100">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
              Master Configurations
            </h2>
          </div>
          <span className="bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-amber-100 shrink-0">
            {filteredMasterModules.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
          {filteredMasterModules.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center min-h-[85px] sm:min-h-[100px]"
              >
                {item.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {item.badge}
                  </span>
                )}
                <div className={`p-2 sm:p-2.5 rounded-xl ${item.color} mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform shadow-xs border`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
        </section>
      )}
    </div>
  );
}
