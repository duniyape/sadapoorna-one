import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Receipt, IndianRupee, Calendar, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { authHdr, todayStr } from '../utils/customerHelpers';

export default function CustomerReceiptTab() {
  const { id, customer, showToast, displayName } = useOutletContext();

  const [rcAmt,    setRcAmt]    = useState('');
  const [rcMode,   setRcMode]   = useState('Cash');
  const [rcNote,   setRcNote]   = useState('');
  const [rcDate,   setRcDate]   = useState(todayStr());
  const [settling, setSettling] = useState(false);
  const [rcResult, setRcResult] = useState(null);

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!rcAmt || parseFloat(rcAmt) <= 0) { showToast('Enter a valid amount'); return; }
    setSettling(true);
    setRcResult(null);
    try {
      const res = await fetch(`/accounting/customers/${id}/receipt`, {
        method: 'POST',
        headers: { ...authHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(rcAmt),
          payment_mode: rcMode.toUpperCase(),
          receipt_date: new Date(rcDate).toISOString(),
          notes: rcNote,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setRcResult({ ok: true, msg: json.message || 'Receipt settled successfully!' });
        setRcAmt('');
        setRcNote('');
        showToast('Receipt settled!');
      } else {
        const msg = json.message || json.detail || 'Failed to settle';
        setRcResult({ ok: false, msg: Array.isArray(msg) ? msg.map(m => m.msg).join(', ') : msg });
        showToast(typeof msg === 'string' ? msg : 'Failed to settle receipt');
      }
    } catch {
      showToast('Network error');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Settlement Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Settle Customer FIFO Receipt</h2>
        </div>
        <form onSubmit={handleSettle} className="p-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹) *</label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="number" min="0.01" step="0.01" required
                value={rcAmt} onChange={e => setRcAmt(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
              />
            </div>
          </div>

          {/* Payment mode */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Mode *</label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'Card'].map(m => (
                <button
                  key={m} type="button" onClick={() => setRcMode(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${rcMode === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Receipt Date *</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date" required
                value={rcDate} onChange={e => setRcDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes / Reference</label>
            <textarea
              rows={3} value={rcNote} onChange={e => setRcNote(e.target.value)}
              placeholder="Cheque no., UTR, reference..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white resize-none"
            />
          </div>

          {/* Result banner */}
          {rcResult && (
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-semibold ${rcResult.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {rcResult.ok
                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />}
              <span>{rcResult.msg}</span>
              <button type="button" onClick={() => setRcResult(null)} className="ml-auto shrink-0 opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={settling}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60"
            style={{ background: settling ? '#6b7280' : 'linear-gradient(135deg,#059669,#047857)' }}
          >
            {settling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {settling ? 'Settling...' : 'Settle Receipt (FIFO)'}
          </button>
        </form>
      </div>

      {/* Info panel */}
      <div className="space-y-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-indigo-900 mb-2">How FIFO Settlement Works</h3>
          <p className="text-[11px] text-indigo-700 leading-relaxed">
            Payments are applied to the <span className="font-bold text-indigo-900">oldest unpaid invoices first</span> (First In, First Out).
            This ensures the longest-outstanding balances are cleared before newer ones.
          </p>
          <div className="mt-4 space-y-2">
            {['Oldest invoice cleared first', 'Partial payments supported', 'Auto-reconciliation', 'Ledger updated instantly'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[11px] text-indigo-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800 mb-1">Important</p>
              <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                Settlement actions are <span className="font-black">irreversible</span>. Verify the amount and payment mode before submitting.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 text-indigo-600" /> Customer
          </h3>
          <p className="font-black text-slate-900 text-sm">{displayName}</p>
          {customer?.mobile && <p className="text-[11px] text-slate-500 mt-1">{customer.mobile}</p>}
          {customer?.gst_number && <p className="text-[11px] text-slate-500 font-mono mt-0.5">GST: {customer.gst_number}</p>}
        </div>
      </div>
    </div>
  );
}
