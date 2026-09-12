import React, { useState } from 'react';
import { X, ArrowUpRight, Building2, Briefcase, Landmark } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function EmployeeCashHandoverModal({ employee, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employee_id: employee.employee_id,
    amount: employee.current_cash_in_hand || 0,
    handover_to: 'SAFE',
    bank_account_name: '',
    transaction_ref: '',
    handover_date: new Date().toISOString().slice(0, 16),
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (formData.amount > employee.current_cash_in_hand) {
      setError(`Amount cannot exceed current cash in hand (₹${employee.current_cash_in_hand})`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        handover_date: new Date(formData.handover_date).toISOString()
      };
      
      const res = await fetch('/accounting/employees/cash-handover', {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(json.message || json.detail || "Failed to record handover");
      }
    } catch (err) {
      setError("Network error recording handover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-[500px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              Record Cash Handover
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              Employee: <span className="text-indigo-600">{employee.employee_name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex justify-between items-center">
            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">Current Cash in Hand</span>
            <span className="text-xl font-black text-indigo-700">₹{employee.current_cash_in_hand?.toLocaleString()}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Handover Amount (₹)</label>
            <input 
              type="number" 
              required
              min="1"
              max={employee.current_cash_in_hand}
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Handover To</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, handover_to: 'SAFE'})}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    formData.handover_to === 'SAFE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">Main Safe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, handover_to: 'BANK'})}
                  className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    formData.handover_to === 'BANK' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <Landmark className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-black uppercase">Bank CDM</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Date & Time</label>
              <input 
                type="datetime-local" 
                required
                value={formData.handover_date}
                onChange={(e) => setFormData({...formData, handover_date: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50 h-full"
              />
            </div>
          </div>

          {formData.handover_to === 'BANK' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Bank Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. SBI, HDFC"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({...formData, bank_account_name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Ref No.</label>
                <input 
                  type="text" 
                  placeholder="CDM Receipt No."
                  value={formData.transaction_ref}
                  onChange={(e) => setFormData({...formData, transaction_ref: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes / Narration</label>
            <input 
              type="text" 
              placeholder="Optional notes about this handover"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || formData.amount <= 0 || formData.amount > employee.current_cash_in_hand}
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Confirm Handover</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
