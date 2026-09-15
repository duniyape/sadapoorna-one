import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function VerifyChequeModal({ voucher, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bank_clearance_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        bank_clearance_date: new Date(formData.bank_clearance_date).toISOString()
      };
      const res = await fetch(`/accounting/vouchers/${voucher._id || voucher.id}/verify`, {
        method: 'POST',
        headers: { ...authHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSuccess("Cheque cleared successfully!");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || "Failed to verify cheque");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-[450px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Verify Cheque Clearance
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-800">Cheque {voucher.cheque_no || voucher.cheque_ref}</span>
              <span className="font-black text-emerald-700">₹{voucher.amount?.toLocaleString()}</span>
            </div>
            <span className="text-xs text-emerald-600">from {voucher.customer_name || 'Customer'}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Bank Clearance Date *</label>
            <input 
              type="datetime-local" 
              required
              value={formData.bank_clearance_date}
              onChange={(e) => setFormData({...formData, bank_clearance_date: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="Cleared in CTS clearinghouse"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 flex justify-center">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Clearance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

