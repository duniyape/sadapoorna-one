import React, { useMemo } from 'react';
import { Users, ShieldCheck, Building2, Wallet, Package, Layers } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MASTER_MODULES, DASHBOARD_GROUPS } from '../utils/constants';
import { usePermissions } from '../utils/permissions';

// Dashboard section config — icon, colors per group
const GROUP_CONFIG = {
  'Sales & Billing': {
    icon: Users,
    border: 'border-indigo-200/60',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    hover: 'group-hover:text-indigo-600',
  },
  'Inventory & Fleet': {
    icon: Package,
    border: 'border-emerald-200/60',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    hover: 'group-hover:text-emerald-600',
  },
  'Accounting & Finance': {
    icon: Wallet,
    border: 'border-rose-200/60',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
    hover: 'group-hover:text-rose-600',
  },
  'Inventory Master': {
    icon: Layers,
    border: 'border-teal-200/60',
    iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
    badge: 'bg-teal-50 text-teal-700 border-teal-100',
    hover: 'group-hover:text-teal-600',
  },
  'System & HR': {
    icon: ShieldCheck,
    border: 'border-amber-200/60',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    hover: 'group-hover:text-amber-600',
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { showToast, searchQuery = '', user } = useOutletContext();
  const { isAllowed } = usePermissions(user);

  // Build filtered groups based on permissions + search
  const visibleGroups = useMemo(() => {
    return DASHBOARD_GROUPS.map((group) => {
      let items = MASTER_MODULES.filter(
        (m) => m.dashboardGroup === group && isAllowed(m)
      );
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.desc.toLowerCase().includes(q)
        );
      }
      return { group, items };
    }).filter((g) => g.items.length > 0);
  }, [searchQuery, user]);

  const handleCardClick = (item) => {
    navigate(item.route);
  };

  return (
    <div className="space-y-4 pt-2">
      {visibleGroups.map(({ group, items }) => {
        const cfg = GROUP_CONFIG[group] || GROUP_CONFIG['Sales & Billing'];
        const GroupIcon = cfg.icon;
        return (
          <section
            key={group}
            className={`bg-white/95 backdrop-blur rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${cfg.border} shadow-sm relative overflow-hidden transition-all`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-slate-50">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${cfg.iconBg}`}>
                  <GroupIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                  {group}
                </h2>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border ${cfg.badge} shrink-0`}>
                {items.length} Modules
              </span>
            </div>

            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-2 sm:gap-3">
              {items.map((item) => {
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
                    <span className={`text-[10px] sm:text-[11px] font-semibold text-slate-700 ${cfg.hover} transition-colors line-clamp-2 leading-tight`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {visibleGroups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
          <p className="font-bold text-sm">No modules found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
        </div>
      )}
    </div>
  );
}
