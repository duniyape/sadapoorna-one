import React, { useState } from 'react';
import { ArrowLeft, Search, IndianRupee, Landmark, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authHdr } from '../utils/customerHelpers';

export default function FinanceCollectionsPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Payment Form State
  const [formData, setFormData] = useState({
    payment_mode: 'FINANCE',
    amount: '',
    financier_name: '',
    transaction_ref: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handleFetchOrder = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsFetching(true);
    setFetchError('');
    setOrderDetails(null);
    setSuccessReceipt(null);
    
    try {
      const query = searchQuery.trim();
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(query);
      const url = isMongoId ? `/orders/v1/${query}` : `/orders/v1?search=${encodeURIComponent(query)}`;
      
      const res = await fetch(url, { headers: authHdr() });
      if (res.ok) {
        const json = await res.json();
        let data = null;
        
        if (!isMongoId && json.data && Array.isArray(json.data)) {
          if (json.data.length > 0) {
            data = json.data[0];
          } else {
            setFetchError("Order not found with that number");
            setIsFetching(false);
            return;
          }
        } else {
          data = json.data || json;
        }

        setOrderDetails(data);
        setFormData(prev => ({ 
          ...prev, 
          amount: data.pending_amount || 0,
          financier_name: '',
          transaction_ref: '',
          notes: ''
        }));
      } else {
        const errData = await res.json().catch(() => ({}));
        setFetchError(errData.detail || errData.message || "Order not found or Invalid ID");
      }
    } catch (err) {
      setFetchError("Network error fetching order");
    } finally {
      setIsFetching(false);
    }
  };

  const handleCollectPayment = async (e) => {
    e.preventDefault();
    if (!orderDetails) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    const orderId = orderDetails.mongo_id || orderDetails._id || orderDetails.id;
    
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
        setSuccessReceipt(json.voucher?.voucher_number || json.message || "Payment Collected!");
        showToast("Payment collected successfully!");
        // Clear order to prevent double submission
        setOrderDetails(null); 
        setSearchQuery('');
      } else {
        const errData = await res.json().catch(() => ({}));
        setSubmitError(errData.detail || errData.message || "Failed to process payment");
      }
    } catch (err) {
      setSubmitError("Network error during payment collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-2 pb-12">
      <div className="flex items-center gap-2.5 mb-6">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Order Receipts & Finance</h1>
          <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Accounting & Finance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Search & Fetch */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-black text-indigo-900">Find Order</h2>
            </div>
            
            <form onSubmit={handleFetchOrder} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Order ID / No.</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ORD-2026-001 or Mongo ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
                />
              </div>

              {fetchError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p>{fetchError}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isFetching || !searchQuery.trim()} 
                className="w-full px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isFetching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Fetch Details"
                )}
              </button>
            </form>
          </div>

          {successReceipt && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex flex-col items-center justify-center text-center space-y-2 animate-in slide-in-from-bottom-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
              <h3 className="text-sm font-black text-emerald-900">Payment Successful</h3>
              <p className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-3 py-1 rounded-lg">
                Receipt: {successReceipt}
              </p>
              <button 
                onClick={() => setSuccessReceipt(null)}
                className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-800 underline"
              >
                Collect another payment
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Details & Payment Form */}
        <div className="md:col-span-7">
          {orderDetails ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-8">
              
              <div className="bg-slate-50 p-5 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{orderDetails.order_no || 'Order'}</h2>
                    <p className="text-xs font-bold text-slate-500">Invoice: {orderDetails.invoice_no || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-indigo-500 tracking-wider mb-0.5">Status</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                      {orderDetails.payment_status || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Bill Amount</p>
                    <p className="font-black text-slate-700">₹{orderDetails.bill_amount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-emerald-500 tracking-wider mb-1">Paid</p>
                    <p className="font-black text-emerald-700">₹{orderDetails.paid_amount?.toLocaleString() || 0}</p>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider mb-1">Pending</p>
                    <p className="font-black text-rose-700">₹{orderDetails.pending_amount?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCollectPayment} className="p-6 space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Landmark className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm font-black text-slate-800">Process Receipt</h3>
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200">
                    {typeof submitError === 'string' ? submitError : JSON.stringify(submitError)}
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
                      <option value="LOAN">LOAN</option>
                      <option value="NBFC">NBFC</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Receipt Amount (₹) *</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      min="1"
                      max={orderDetails.pending_amount || undefined}
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-black text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                {formData.payment_mode === 'FINANCE' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
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

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || orderDetails.pending_amount <= 0} 
                    className="w-full px-4 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5" />
                        Record Receipt
                      </>
                    )}
                  </button>
                  {orderDetails.pending_amount <= 0 && (
                    <p className="text-center text-xs font-bold text-emerald-600 mt-3">This order is already fully paid.</p>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400">
              <FileText className="w-16 h-16 mb-4 text-slate-300" />
              <h3 className="text-sm font-black text-slate-500">No Order Selected</h3>
              <p className="text-xs font-bold mt-1 text-center max-w-xs">Enter an Order ID or Number in the search box to fetch billing details and record a payment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
