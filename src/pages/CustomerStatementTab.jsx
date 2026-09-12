import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Calendar, Loader2 } from 'lucide-react';
import { authHdr, fmt, fmtMoney, Skeleton, daysAgo, todayStr } from '../utils/customerHelpers';

export default function CustomerStatementTab() {
  const { id } = useOutletContext();
  const hasFetched = useRef(false);

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded]   = useState(false);
  const [fromDate, setFromDate] = useState(daysAgo(90));
  const [toDate, setToDate]     = useState(todayStr());

  const fetchStatement = useCallback(async (from, to) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from_date', from);
      if (to)   params.set('to_date', to);
      const url = `/accounting/customers/${id}/statement${[...params].length ? `?${params}` : ''}`;
      const res = await fetch(url, { headers: authHdr() });
      const json = res.ok ? await res.json() : {};
      // Safely extract the array from various possible backend response formats
      let rows = [];
      if (Array.isArray(json.data)) rows = json.data;
      else if (json.data && Array.isArray(json.data.transactions)) rows = json.data.transactions;
      else if (Array.isArray(json.transactions)) rows = json.transactions;
      else if (Array.isArray(json)) rows = json;
      
      setTransactions(rows);
      setMeta(json.meta || json.summary || json.data?.meta || json.data?.summary || (json.data && typeof json.data === 'object' ? json.data : null));
      setLoaded(true);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Auto-fetch on first visit
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchStatement(fromDate, toDate);
    }
  }, [fetchStatement]);

  return (
    <div className="space-y-4">

      {/* Date filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date" value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-slate-50 w-full"
          />
          <span className="text-slate-400 font-bold text-xs shrink-0">–</span>
          <input
            type="date" value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-slate-50 w-full"
          />
        </div>
        <button
          onClick={() => fetchStatement(fromDate, toDate)}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all disabled:opacity-60 shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          {loading ? 'Loading...' : 'Fetch Statement'}
        </button>
      </div>

      {/* Meta summary cards */}
      {meta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(meta)
            .filter(([, v]) => typeof v === 'number')
            .map(([k, v]) => (
              <div key={k} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.replace(/_/g, ' ')}</p>
                <p className={`text-lg font-black ${v < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{fmtMoney(v)}</p>
              </div>
            ))}
        </div>
      )}

      {/* Ledger table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ledger Statement</h2>
          {loaded && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
              {transactions.length} entries
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !loaded ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm">Select a date range and click Fetch Statement.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-sm">No transactions in the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Particulars</th>
                  <th className="px-5 py-3">Ref / Invoice</th>
                  <th className="px-5 py-3 text-right">Debit</th>
                  <th className="px-5 py-3 text-right">Credit</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-600 whitespace-nowrap">{fmt(row.date || row.transaction_date)}</td>
                    <td className="px-5 py-3 text-slate-800 font-semibold">{row.particulars || row.description || row.type || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{row.reference || row.invoice_no || row.ref || '—'}</td>
                    <td className="px-5 py-3 text-right font-bold text-rose-600">{row.debit ? fmtMoney(row.debit) : '—'}</td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600">{row.credit ? fmtMoney(row.credit) : '—'}</td>
                    <td className={`px-5 py-3 text-right font-black ${parseFloat(row.balance ?? row.running_balance ?? 0) < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {fmtMoney(row.balance ?? row.running_balance ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
