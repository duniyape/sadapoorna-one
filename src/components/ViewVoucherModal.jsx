import React, { useState, useEffect } from 'react';
import { X, Receipt, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import { authHdr, fmt, fmtMoney } from '../utils/customerHelpers';

export default function ViewVoucherModal({ voucherId, onClose }) {
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!voucherId) return;
    const fetchVoucher = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/accounting/vouchers/${voucherId}`, { headers: authHdr() });
        const json = await res.json();
        if (res.ok && (json.data || json.success)) {
          setVoucher(json.data || json);
        } else {
          setError(json.message || json.detail || "Failed to load voucher details");
        }
      } catch (err) {
        setError("Network error fetching voucher details");
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [voucherId]);

  if (!voucherId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:w-[800px] bg-slate-50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-500" />
              Voucher {voucher?.voucher_no || voucher?.id?.slice(-6) || voucherId.slice(-6)}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {voucher?.voucher_no && `Ref: ${voucher.voucher_no} • `} 
              {voucher ? fmt(voucher.date || voucher.created_at) : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-500 mt-4">Loading voucher details...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold">
              {error}
            </div>
          ) : (
            <>
              {/* Voucher Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Type</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                    voucher.voucher_type === 'Payment' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    voucher.voucher_type === 'Receipt' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    voucher.voucher_type === 'Journal' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {voucher.voucher_type || 'Unknown'}
                  </span>
                </div>
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Mode
                  </span>
                  <span className="text-sm font-bold text-slate-800">{voucher.voucher_mode || 'N/A'}</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start gap-1 md:col-span-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Amount</span>
                  <span className="text-xl font-black text-slate-900">{fmtMoney(voucher.amount)}</span>
                </div>
              </div>

              {/* Reference & Narration */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                {(voucher.order_no || voucher.invoice_no || voucher.customer_name) && (
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                    {voucher.customer_name && (
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Customer</p>
                        <p className="text-sm font-semibold text-slate-800">{voucher.customer_name}</p>
                      </div>
                    )}
                    {voucher.order_no && (
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Order Ref</p>
                        <p className="text-sm font-semibold text-slate-800">{voucher.order_no}</p>
                      </div>
                    )}
                    {voucher.invoice_no && (
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Invoice Ref</p>
                        <p className="text-sm font-semibold text-slate-800">{voucher.invoice_no}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-1">
                    <FileText className="w-3 h-3" /> Narration
                  </h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {voucher.narration || 'No narration provided.'}
                  </p>
                </div>
              </div>

              {/* Entries Table */}
              {voucher.entries && voucher.entries.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                      Ledger Entries ({voucher.entries.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-2 w-[10%] text-center">Dr/Cr</th>
                          <th className="px-4 py-2 w-[40%]">Ledger</th>
                          <th className="px-4 py-2 w-[25%] text-right text-rose-600">Debit (₹)</th>
                          <th className="px-4 py-2 w-[25%] text-right text-emerald-600">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {voucher.entries.map((entry, i) => {
                          const isDebit = entry.debit > 0;
                          const isCredit = entry.credit > 0;
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isDebit ? 'bg-rose-100 text-rose-700' : isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                  {isDebit ? 'Dr' : isCredit ? 'Cr' : '--'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">{entry.ledger_name || entry.ledger_id}</p>
                                {entry.narration && <p className="text-[10px] text-slate-500 mt-0.5">{entry.narration}</p>}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-rose-600">
                                {entry.debit > 0 ? entry.debit.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-black text-emerald-600">
                                {entry.credit > 0 ? entry.credit.toLocaleString(undefined, {minimumFractionDigits:2}) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td colSpan="2" className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-wider">
                            Total
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-black text-slate-800">
                            {voucher.amount?.toLocaleString(undefined, {minimumFractionDigits:2})}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-black text-slate-800">
                            {voucher.amount?.toLocaleString(undefined, {minimumFractionDigits:2})}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
