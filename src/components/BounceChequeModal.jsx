import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function BounceChequeModal({ voucher, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bounce_reason: 'Insufficient Funds',
    penalty_amount: 500.0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const BOUNCE_REASONS = [
    "Insufficient Funds",
    "Signature Mismatch",
    "Post-Dated / Stale",
    "Account Closed",
    "Stop Payment",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/accounting/vouchers/${voucher._id || voucher.id}/bounce`, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify({
          bounce_reason: formData.bounce_reason,
          penalty_amount: Number(formData.penalty_amount)
        })
      });
      
      if (res.ok) {
        onSuccess("Cheque marked as bounced and penalty applied!");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || "Failed to bounce cheque");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-[500px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Record Cheque Dishonor / Bounce
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-200 text-rose-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">⚠️ Cheque {voucher.cheque_no || voucher.cheque_ref}</span>
              <span className="font-black text-rose-600">₹{voucher.amount?.toLocaleString()}</span>
            </div>
            <span className="text-xs font-bold text-slate-600">from {voucher.customer_name || 'Customer'}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Reason for Bounce *</label>
            <select 
              required
              value={formData.bounce_reason}
              onChange={(e) => setFormData({...formData, bounce_reason: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-bold text-slate-800 bg-slate-50"
            >
              {BOUNCE_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Penalty / Bank Charges (₹)</label>
            <input 
              type="number" 
              required
              min="0"
              step="0.01"
              value={formData.penalty_amount}
              onChange={(e) => setFormData({...formData, penalty_amount: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
            <p className="text-[10px] text-slate-500 font-bold">This penalty will be automatically debited to the customer's ledger.</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all disabled:opacity-50 flex justify-center">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Bounce & Re-Open Bills'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
