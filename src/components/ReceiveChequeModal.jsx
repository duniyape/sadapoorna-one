import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function ReceiveChequeModal({ voucher, onClose, onSuccess }) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/accounting/vouchers/${voucher._id || voucher.id}/receive-cheque`, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify({ notes })
      });
      
      if (res.ok) {
        onSuccess("Cheque marked as received in office!");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || "Failed to receive cheque");
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
            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
            Receive Cheque in Office
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm font-bold text-slate-600">
            Confirm physical custody of Cheque <span className="text-indigo-600">{voucher.cheque_no || voucher.cheque_ref}</span> from <span className="text-slate-900">{voucher.customer_name || 'Customer'}</span>?
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Verified leaf and stored in Drawer A"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 flex justify-center">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Custody'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
