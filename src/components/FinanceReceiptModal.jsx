import React, { useState, useEffect } from 'react';
import { X, Landmark, RefreshCcw, IndianRupee } from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

export default function FinanceReceiptModal({ order, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [orderDetails, setOrderDetails] = useState(null);

  const [formData, setFormData] = useState({
    payment_mode: 'FINANCE',
    amount: '',
    financier_name: '',
    transaction_ref: '',
    notes: ''
  });

  const orderId = order?.mongo_id || order?._id || order?.id;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/orders/v1/${orderId}`, { headers: authHdr() });
        if (res.ok) {
          const json = await res.json();
          // Adjust based on typical FastAPI response structure
          const data = json.data || json;
          setOrderDetails(data);
          setFormData(prev => ({ ...prev, amount: data.pending_amount || 0 }));
        } else {
          setError("Failed to fetch order details");
        }
      } catch (err) {
        setError("Network error fetching order details");
      } finally {
        setIsLoading(false);
      }
    };
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        payment_mode: formData.payment_mode,
        amount: Number(formData.amount),
        financier_name: formData.financier_name,
        transaction_ref: formData.transaction_ref,
        notes: formData.notes
      };

      const res = await fetch(`/accounting/orders/${orderId}/receipt`, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const json = await res.json();
        onSuccess(`Finance receipt generated: ${json.voucher?.voucher_number || 'Success'}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || errData.message || "Failed to generate receipt");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-[500px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-indigo-800 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            Collect Finance Payment
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-indigo-200 text-indigo-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCcw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500">Fetching live pending amount...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Bill Amount</p>
                <p className="font-bold text-slate-700">₹{orderDetails?.bill_amount?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Paid Amount</p>
                <p className="font-bold text-emerald-600">₹{orderDetails?.paid_amount?.toLocaleString() || 0}</p>
              </div>
              <div className="col-span-2 bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center justify-between">
                <p className="text-xs font-black uppercase text-rose-500 tracking-wider">Pending Amount</p>
                <p className="font-black text-rose-700 text-lg">₹{orderDetails?.pending_amount?.toLocaleString() || 0}</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Payment Mode *</label>
                <select 
                  required
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
                >
                  <option value="FINANCE">FINANCE</option>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Receipt Amount (₹) *</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
                />
              </div>
            </div>

            {formData.payment_mode === 'FINANCE' && (
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Financier Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Bajaj Finserv, HDFC Bank"
                  value={formData.financier_name}
                  onChange={(e) => setFormData({...formData, financier_name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Reference / DO No.</label>
              <input 
                type="text" 
                placeholder="e.g. DO-BAJAJ-89101"
                value={formData.transaction_ref}
                onChange={(e) => setFormData({...formData, transaction_ref: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. 8/0 Scheme, 0% Interest Promo"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || orderDetails?.pending_amount === 0} className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Collect Payment
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
