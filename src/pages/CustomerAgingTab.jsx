import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, RefreshCw, CheckCircle2, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { authHdr, fmtMoney, Skeleton } from '../utils/customerHelpers';

const BUCKETS = (d) => {
  const b = d?.aging_buckets || d || {};
  return [
    { label: 'Current (Not Due)', val: b.current ?? 0, color: 'emerald', Icon: CheckCircle2 },
    { label: '1–30 Days Overdue', val: b.days_1_30 ?? b['1_30'] ?? 0, color: 'sky', Icon: Clock },
    { label: '31–60 Days Overdue', val: b.days_31_60 ?? b['31_60'] ?? 0, color: 'amber', Icon: TrendingUp },
    { label: '61–90 Days Overdue', val: b.days_61_90 ?? b['61_90'] ?? 0, color: 'orange', Icon: TrendingDown },
    { label: 'Over 90 Days', val: b.days_90_plus ?? b['90_plus'] ?? b.over_90 ?? 0, color: 'rose', Icon: AlertCircle },
  ];
};

const COLOR = {
  emerald: { wrap: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500' },
  sky:     { wrap: 'bg-sky-50 border-sky-200',         text: 'text-sky-700',     icon: 'text-sky-500' },
  amber:   { wrap: 'bg-amber-50 border-amber-200',     text: 'text-amber-700',   icon: 'text-amber-500' },
  orange:  { wrap: 'bg-orange-50 border-orange-200',   text: 'text-orange-700',  icon: 'text-orange-500' },
  rose:    { wrap: 'bg-rose-50 border-rose-200',       text: 'text-rose-700',    icon: 'text-rose-500' },
};

export default function CustomerAgingTab() {
  const { id } = useOutletContext();
  const [aging, setAging] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchAging = useCallback(async () => {
    setLoading(true);
    hasFetched.current = true;
    try {
      const res = await fetch(`/accounting/customers/${id}/aging`, { headers: authHdr() });
      const json = res.ok ? await res.json() : {};
      setAging(json.data || json);
    } catch {
      setAging(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!hasFetched.current) fetchAging();
  }, [fetchAging]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" /> Customer Aging Analysis
        </h2>
        <button
          onClick={() => { hasFetched.current = false; fetchAging(); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors border border-slate-200 bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : !aging || Object.keys(aging).length === 0 ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="font-bold text-sm">No aging data available.</p>
        </div>
      ) : (
        <>
          {/* Bucket cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {BUCKETS(aging).map(({ label, val, color, Icon }) => {
              const c = COLOR[color];
              return (
                <div key={label} className={`p-5 rounded-2xl border ${c.wrap}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white/60">
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-xl font-black ${c.text}`}>{fmtMoney(val)}</p>
                </div>
              );
            })}
          </div>

          {/* Full summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Full Aging Summary</h3>
            <div className="space-y-1">
              {Object.entries(aging)
                .filter(([, v]) => typeof v === 'number')
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-semibold text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className={`text-xs font-black ${parseFloat(v) > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                      {fmtMoney(v)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
