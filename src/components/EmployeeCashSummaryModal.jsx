import React, { useState, useEffect } from 'react';
import { X, Wallet, History, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { authHdr, fmt, fmtMoney } from '../utils/customerHelpers';

export default function EmployeeCashSummaryModal({ employeeId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/accounting/employees/${employeeId}/cash-summary`, { headers: authHdr() });
        const json = await res.json();
        if (res.ok && (json.data || json.success)) {
          setData(json.data || json);
        } else {
          setError(json.message || json.detail || "Failed to load summary");
        }
      } catch (err) {
        setError("Network error fetching employee summary");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [employeeId]);

  if (!employeeId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:w-[800px] bg-slate-50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" />
              {data ? data.employee_name : 'Employee Cash Summary'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              ID: {employeeId} {data?.role && `• Role: ${data.role}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-500 mt-4">Loading cash summary...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold">
              {error}
            </div>
          ) : (
            <>
              {/* Financial Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1 mb-1">
                    <ArrowDownLeft className="w-3 h-3" /> Total Collected
                  </h3>
                  <p className="text-xl font-black text-emerald-700">{fmtMoney(data.total_cash_collected)}</p>
                </div>
                
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1 mb-1">
                    <ArrowUpRight className="w-3 h-3" /> Total Handed Over
                  </h3>
                  <p className="text-xl font-black text-rose-700">{fmtMoney(data.total_cash_handed_over)}</p>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-indigo-600 tracking-wider mb-1">
                    Current Cash in Hand
                  </h3>
                  <p className="text-xl font-black text-indigo-700">{fmtMoney(data.current_cash_in_hand)}</p>
                </div>
              </div>

              {/* Transactions History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-500" />
                  <h3 className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Recent Transactions
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2">Date & Ref</th>
                        <th className="px-4 py-2">Narration</th>
                        <th className="px-4 py-2 text-right text-emerald-600">Collected (Dr)</th>
                        <th className="px-4 py-2 text-right text-rose-600">Handed Over (Cr)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.recent_transactions && data.recent_transactions.length > 0 ? (
                        data.recent_transactions.map((txn, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-800">{fmt(txn.date || txn.created_at)}</p>
                              {txn.voucher_no && <p className="text-[10px] text-slate-500">{txn.voucher_no}</p>}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{txn.narration || '-'}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600">
                              {txn.debit > 0 ? fmtMoney(txn.debit) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-rose-600">
                              {txn.credit > 0 ? fmtMoney(txn.credit) : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-400 font-medium">
                            No recent transactions found for this employee.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
