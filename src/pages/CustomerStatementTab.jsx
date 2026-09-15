import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Calendar, Loader2, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { authHdr, fmt, fmtMoney, Skeleton, daysAgo, todayStr } from '../utils/customerHelpers';

export default function CustomerStatementTab() {
  const { id } = useOutletContext();
  const hasFetched = useRef(false);

  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded]   = useState(false);
  
  // Default to 1st of current month to today
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
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
      
      const data = json.data || {};
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      setMeta({
        opening_balance: data.opening_balance || 0,
        opening_balance_type: data.opening_balance_type || 'Dr',
        total_debit: data.total_debit || 0,
        total_credit: data.total_credit || 0,
        closing_balance: data.closing_balance || 0,
        closing_balance_type: data.closing_balance_type || 'Dr'
      });
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
    <div className="space-y-4 max-w-6xl mx-auto pb-12">

      {/* Date filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <Calendar className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="date" value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border-transparent text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-transparent w-full"
          />
          <span className="text-slate-400 font-bold text-sm shrink-0">to</span>
          <input
            type="date" value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border-transparent text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-transparent w-full"
          />
        </div>
        <button
          onClick={() => fetchStatement(fromDate, toDate)}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black tracking-wide text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-900/10 transition-all disabled:opacity-50 shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {loading ? 'Fetching...' : 'Generate Statement'}
        </button>
      </div>

      {/* Meta summary cards */}
      {loaded && meta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Balance</p>
            <div className="flex items-end gap-1.5">
              <p className="text-xl font-black text-slate-800">{fmtMoney(meta.opening_balance)}</p>
              <span className={`text-[10px] font-black pb-1 ${meta.opening_balance_type === 'Cr' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {meta.opening_balance_type}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <ArrowUpRight className="w-16 h-16 text-rose-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Debit</p>
            <p className="text-xl font-black text-rose-600">{fmtMoney(meta.total_debit)}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <ArrowDownLeft className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Credit</p>
            <p className="text-xl font-black text-emerald-600">{fmtMoney(meta.total_credit)}</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl shadow-xl flex flex-col gap-1 relative overflow-hidden">
            <div className="absolute -bottom-2 -right-2 opacity-10">
              <FileText className="w-20 h-20 text-white" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closing Balance</p>
            <div className="flex items-end gap-1.5">
              <p className={`text-2xl font-black ${meta.closing_balance_type === 'Cr' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmtMoney(meta.closing_balance)}
              </p>
              <span className="text-[10px] font-black text-white/50 pb-1.5">
                {meta.closing_balance_type}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Ledger table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-wide">LEDGER STATEMENT</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Showing all transactions</p>
            </div>
          </div>
          {loaded && (
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-black shadow-sm">
              {transactions.length} RECORDS
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
        ) : !loaded ? (
          <div className="py-20 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Select a date range and click Generate Statement.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-teal-600/30" />
            <p className="font-black text-lg text-slate-600">No Transactions</p>
            <p className="font-semibold text-sm mt-1">No accounting entries found for the selected period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-white text-slate-400 font-black uppercase tracking-widest text-[9px] border-b-2 border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Particulars</th>
                  <th className="px-6 py-4">Voucher / Ref</th>
                  <th className="px-6 py-4 text-right">Debit (Dr)</th>
                  <th className="px-6 py-4 text-right">Credit (Cr)</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                
                {/* Opening Balance Row */}
                <tr className="bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-400">--</td>
                  <td className="px-6 py-4 font-black text-slate-700 tracking-wide">Opening Balance</td>
                  <td className="px-6 py-4 text-slate-400">--</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right font-black text-slate-800">
                    {fmtMoney(meta.opening_balance)} <span className="text-[10px] text-slate-400 ml-1">{meta.opening_balance_type}</span>
                  </td>
                </tr>

                {transactions.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-600 whitespace-nowrap">
                      {fmt(row.date)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 leading-snug">{row.particulars || 'No description'}</p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {row.voucher_type}
                        </span>
                        {row.payment_mode && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded border border-teal-100">
                            {row.payment_mode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-700">{row.voucher_number}</p>
                      {row.invoice_no && (
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{row.invoice_no}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.debit > 0 ? (
                        <span className="font-black text-rose-600">{fmtMoney(row.debit)}</span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {row.credit > 0 ? (
                        <span className="font-black text-emerald-600">{fmtMoney(row.credit)}</span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`font-black ${row.balance_type === 'Cr' ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {fmtMoney(row.running_balance)}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 w-4 text-left">
                          {row.balance_type}
                        </span>
                      </div>
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
