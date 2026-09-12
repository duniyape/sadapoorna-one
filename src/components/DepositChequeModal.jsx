import React, { useState, useEffect } from 'react';
import { X, Landmark } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function DepositChequeModal({ voucher, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    deposit_bank_name: '',
    deposit_date: new Date().toISOString().slice(0, 16),
    deposit_slip_ref: '',
    notes: ''
  });
  const [ledgers, setLedgers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch bank ledgers for the dropdown
    const fetchLedgers = async () => {
      try {
        const res = await fetch('/accounting/ledgers?type=Bank', { headers: authHdr() });
        const json = await res.json();
        if (res.ok) {
          const arr = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          setLedgers(arr);
        }
      } catch (err) {
        console.error("Failed to fetch bank ledgers", err);
      }
    };
    fetchLedgers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        deposit_date: new Date(formData.deposit_date).toISOString()
      };
      const res = await fetch(`/accounting/vouchers/${voucher._id || voucher.id}/deposit-cheque`, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSuccess("Cheque marked as deposited to bank!");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || "Failed to deposit cheque");
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
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-500" />
            Deposit Cheque to Bank
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center text-sm">
            <span className="font-bold text-indigo-800">Cheque {voucher.cheque_no || voucher.cheque_ref}</span>
            <span className="font-black text-indigo-700">₹{voucher.amount?.toLocaleString()}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Deposit Bank Account *</label>
            <select 
              required
              value={formData.deposit_bank_name}
              onChange={(e) => setFormData({...formData, deposit_bank_name: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
            >
              <option value="">-- Select Bank Ledger --</option>
              {ledgers.map(l => (
                <option key={l._id} value={l.name}>{l.name}</option>
              ))}
              {/* Fallback option if API doesn't return any Banks */}
              <option value="Bank Account (Main)">Bank Account (Main)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Deposit Date *</label>
            <input 
              type="datetime-local" 
              required
              value={formData.deposit_date}
              onChange={(e) => setFormData({...formData, deposit_date: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Deposit Slip Ref</label>
            <input 
              type="text" 
              placeholder="e.g. SLIP-HDFC-99182"
              value={formData.deposit_slip_ref}
              onChange={(e) => setFormData({...formData, deposit_slip_ref: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="Dropped at HDFC branch"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 flex justify-center">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
