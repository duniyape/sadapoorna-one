import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Building2, User, FileText, Banknote, Landmark, CreditCard, Send, CheckCircle2, X, Wallet, ShieldCheck, Printer } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authHdr, fmt } from '../utils/customerHelpers';

// Helper to calculate Live FIFO preview
function calculateFifoPreview(openBills, amountToPay) {
  let remaining = parseFloat(amountToPay || 0);
  const preview = [];

  for (const bill of openBills) {
    const billDue = bill.pending_amount;
    if (remaining <= 0) {
      preview.push({ ...bill, allocated: 0, newStatus: bill.status, newPending: billDue });
    } else {
      const allocated = Math.min(remaining, billDue);
      const newPending = billDue - allocated;
      remaining -= allocated;
      preview.push({
        ...bill,
        allocated,
        newPending,
        newStatus: newPending <= 0.01 ? "PAID" : "PARTIALLY_PAID"
      });
    }
  }

  const remainingCustomerDue = Math.max(0, openBills.reduce((acc, b) => acc + b.pending_amount, 0) - (parseFloat(amountToPay) || 0));
  return { preview, remainingCustomerDue };
}

export default function CustomerKhataPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [customerId, setCustomerId] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [khata, setKhata] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    paymentMode: 'CASH',
    amount: '',
    transactionRef: '',
    chequeNo: '',
    chequeDate: '',
    chequeBank: '',
    bankAccountName: '',
    notes: '',
    receiptDate: new Date().toISOString().split('T')[0]
  });

  const fetchKhata = async (e) => {
    if (e) e.preventDefault();
    if (!customerId.trim()) return;

    setIsFetching(true);
    setKhata(null);
    try {
      const res = await fetch(`/accounting/customers/${customerId.trim()}/aging`, { headers: { ...authHdr(), 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        let data = json.data || json;
        
        // If backend aging returns null name (e.g. no invoices), check if customer actually exists
        if (!data.customer_name) {
          try {
            const custRes = await fetch(`/customer/${customerId.trim()}`, { headers: { ...authHdr(), 'Content-Type': 'application/json' } });
            if (custRes.ok) {
              const custJson = await custRes.json();
              const custData = custJson.data || custJson;
              if (custData && custData.name) {
                // Customer exists, just no invoices
                data = {
                  ...data,
                  customer_id: custData.id || customerId.trim(),
                  customer_name: custData.name,
                  total_outstanding: 0,
                  open_bills: [],
                  aging_buckets: {}
                };
              } else {
                showToast("Customer not found.");
                return;
              }
            } else {
              showToast("Customer not found.");
              return;
            }
          } catch (e) {
            showToast("Customer not found.");
            return;
          }
        }
        setKhata(data);
      } else {
        const err = await res.json().catch(() => ({}));
        // If FastAPI validation error array is returned, use a generic message instead of passing objects to React
        let errMsg = "Failed to fetch customer ledger";
        if (typeof err.detail === 'string') errMsg = err.detail;
        else if (typeof err.message === 'string') errMsg = err.message;
        else if (Array.isArray(err.detail) && err.detail.length > 0 && err.detail[0].msg) errMsg = err.detail[0].msg;
        
        showToast(errMsg);
      }
    } catch (error) {
      showToast("Network error fetching ledger");
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      paymentMode: 'CASH',
      amount: '',
      transactionRef: '',
      chequeNo: '',
      chequeDate: '',
      chequeBank: '',
      bankAccountName: '',
      notes: '',
      receiptDate: new Date().toISOString().split('T')[0]
    });
    setSuccessData(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSuccessData(null);
  };

  const submitReceipt = async (e) => {
    e.preventDefault();
    const payAmount = parseFloat(formData.amount);
    
    if (!payAmount || payAmount <= 0) {
      return showToast("Please enter a valid amount");
    }
    
    if (payAmount > (khata?.total_outstanding || 0)) {
      return showToast("Cannot collect more than total outstanding amount");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        payment_mode: formData.paymentMode,
        amount: payAmount,
        transaction_ref: formData.transactionRef || undefined,
        cheque_no: formData.chequeNo || undefined,
        cheque_date: formData.chequeDate || undefined,
        cheque_bank: formData.chequeBank || undefined,
        bank_account_name: formData.bankAccountName || undefined,
        notes: formData.notes || undefined,
        receipt_date: formData.receiptDate ? new Date(formData.receiptDate).toISOString() : undefined,
      };

      const res = await fetch(`/accounting/customers/${khata.customer_id || customerId.trim()}/receipt`, {
        method: 'POST',
        headers: { ...authHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        setSuccessData(json);
        showToast(json.message || "Receipt generated successfully");
        // We do not close modal, instead show success screen in modal
        fetchKhata(); // Refresh background data
      } else {
        const err = await res.json().catch(() => ({}));
        let errMsg = "Payment receipt submission failed";
        if (typeof err.detail === 'string') errMsg = err.detail;
        else if (typeof err.message === 'string') errMsg = err.message;
        else if (Array.isArray(err.detail) && err.detail.length > 0 && err.detail[0].msg) errMsg = err.detail[0].msg;
        showToast(errMsg);
      }
    } catch (err) {
      showToast("Network error during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { preview, remainingCustomerDue } = khata ? calculateFifoPreview(khata.open_bills || [], formData.amount) : { preview: [], remainingCustomerDue: 0 };

  return (
    <div className="max-w-6xl mx-auto mt-2 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Customer Payment</h1>
            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Accounting & Finance</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-6">
        <form onSubmit={fetchKhata} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              required
              placeholder="Enter Customer ID..."
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
          <button type="submit" disabled={isFetching} className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50">
            {isFetching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
            Fetch Details
          </button>
        </form>
      </div>

      {khata && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 border border-teal-100">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{khata.customer_name}</h2>
              <p className="text-sm font-semibold text-slate-500 mb-6">ID: {khata.customer_id}</p>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Banknote className="w-24 h-24" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total Outstanding</p>
                <p className="text-3xl font-black text-rose-600">₹{(khata.total_outstanding || 0).toLocaleString()}</p>
              </div>

              <button onClick={handleOpenModal} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                + Collect Payment
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-black uppercase text-slate-800 mb-4 tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Aging Buckets
              </h3>
              <div className="space-y-3">
                {Object.entries(khata.aging_buckets || {}).map(([bucket, amt]) => (
                  <div key={bucket} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-sm font-bold text-slate-600">{bucket} Days</span>
                    <span className="font-black text-slate-900">₹{amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Open Bills ({khata.open_bills?.length || 0})
                </h3>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-[10px] uppercase tracking-wider font-black text-slate-400">
                      <th className="p-4 pl-6">Invoice No</th>
                      <th className="p-4">Billed At</th>
                      <th className="p-4 text-right">Pending Amount</th>
                      <th className="p-4 pr-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khata.open_bills?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-400 font-bold">No open bills</td>
                      </tr>
                    ) : (
                      khata.open_bills?.map((b) => (
                        <tr key={b.invoice_no} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="p-4 pl-6 font-bold text-slate-800">{b.invoice_no}</td>
                          <td className="p-4 text-sm font-semibold text-slate-500">{fmt(b.billed_at)}</td>
                          <td className="p-4 text-right font-black text-rose-600">₹{(b.pending_amount || 0).toLocaleString()}</td>
                          <td className="p-4 pr-6 text-right">
                            <span className="inline-flex px-2 py-1 bg-rose-50 text-rose-600 rounded text-[10px] font-black uppercase tracking-widest">
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
            
            {successData ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{successData.message}</h2>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-3">
                  <p className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Voucher No:</span>
                    <span className="text-slate-900">{successData.voucher?.voucher_number}</span>
                  </p>
                  <p className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Total Received:</span>
                    <span className="text-emerald-600">₹{successData.summary?.total_received?.toLocaleString()}</span>
                  </p>
                  <p className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Bills Affected:</span>
                    <span className="text-slate-900">{successData.summary?.bills_affected_count}</span>
                  </p>
                  <p className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Remaining Due:</span>
                    <span className="text-rose-600">₹{successData.summary?.remaining_customer_due?.toLocaleString()}</span>
                  </p>
                </div>
                <div className="flex gap-4 mt-4 w-full max-w-md">
                  <button onClick={handleCloseModal} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                    Done
                  </button>
                  <button className="flex-1 py-3 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl font-bold flex justify-center items-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-teal-600" />
                    Collect Payment — {khata?.customer_name}
                  </h2>
                  <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-slate-200 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                  
                  {/* Left Column: Form */}
                  <form id="receiptForm" onSubmit={submitReceipt} className="flex-1 space-y-6">
                    <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl">
                      <div>
                        <p className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Total Outstanding</p>
                        <p className="text-2xl font-black text-rose-700">₹{(khata?.total_outstanding || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Payment Mode *</label>
                      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-2">
                        {['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER'].map(mode => (
                          <label key={mode} className={`
                            cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center transition-all
                            ${formData.paymentMode === mode ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}
                          `}>
                            <input 
                              type="radio" 
                              name="paymentMode" 
                              value={mode} 
                              className="hidden"
                              checked={formData.paymentMode === mode}
                              onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                            />
                            {mode === 'CASH' && <Banknote className="w-5 h-5" />}
                            {mode === 'UPI' && <Send className="w-5 h-5" />}
                            {mode === 'CHEQUE' && <FileText className="w-5 h-5" />}
                            {mode === 'BANK_TRANSFER' && <Landmark className="w-5 h-5" />}
                            <span className="text-[10px] font-black">{mode.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Collection Amount (₹) *</label>
                      <input 
                        type="number" 
                        required
                        step="0.01"
                        min="1"
                        max={khata?.total_outstanding || 0}
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-lg font-black text-slate-800 bg-slate-50"
                      />
                      <p className="text-[10px] font-bold text-slate-400">Max allowed: ₹{(khata?.total_outstanding || 0).toLocaleString()} — Excess collection is prevented</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest flex items-center gap-2">
                        Mode-Specific Details
                      </h4>
                      
                      {formData.paymentMode === 'CASH' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Receipt Date *</label>
                            <input 
                              type="date" 
                              required
                              value={formData.receiptDate}
                              onChange={(e) => setFormData({...formData, receiptDate: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      )}

                      {formData.paymentMode === 'UPI' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">UPI UTR / Ref *</label>
                            <input 
                              type="text" 
                              required
                              minLength={6}
                              placeholder="e.g. 320188..."
                              value={formData.transactionRef}
                              onChange={(e) => setFormData({...formData, transactionRef: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      )}

                      {formData.paymentMode === 'CHEQUE' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Cheque No *</label>
                            <input 
                              type="text" 
                              required
                              minLength={6}
                              placeholder="000452"
                              value={formData.chequeNo}
                              onChange={(e) => setFormData({...formData, chequeNo: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Cheque Date *</label>
                            <input 
                              type="date" 
                              required
                              value={formData.chequeDate}
                              onChange={(e) => setFormData({...formData, chequeDate: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Drawee Bank Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. HDFC Bank"
                              value={formData.chequeBank}
                              onChange={(e) => setFormData({...formData, chequeBank: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      )}

                      {formData.paymentMode === 'BANK_TRANSFER' && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">NEFT/RTGS Ref *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ref Number"
                              value={formData.transactionRef}
                              onChange={(e) => setFormData({...formData, transactionRef: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Receiving Bank *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Bank Name"
                              value={formData.bankAccountName}
                              onChange={(e) => setFormData({...formData, bankAccountName: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes / Remarks</label>
                      <input 
                        type="text" 
                        placeholder="Optional details"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 text-sm font-bold bg-slate-50"
                      />
                    </div>
                  </form>

                  {/* Right Column: Preview */}
                  <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit">
                    <h3 className="font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-teal-600" />
                      Live FIFO Settlement Preview
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      {preview.length === 0 ? (
                        <p className="text-sm font-bold text-slate-400">No open bills to settle.</p>
                      ) : (
                        preview.map(b => (
                          <div key={b.invoice_no} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                            <div>
                              <p className="font-black text-slate-800 text-sm">{b.invoice_no}</p>
                              <p className="text-[10px] font-bold text-slate-400">Due: ₹{b.pending_amount?.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-600">Allocated: ₹{b.allocated?.toLocaleString()}</p>
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${
                                b.newStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                b.newStatus === 'PARTIALLY_PAID' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {b.newStatus}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500">Remaining Due</p>
                      <p className="text-lg font-black text-rose-600">₹{remainingCustomerDue.toLocaleString()}</p>
                    </div>
                  </div>

                </div>

                <div className="px-6 py-4 border-t bg-slate-50 flex gap-4 shrink-0">
                  <button onClick={handleCloseModal} type="button" className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">
                    Cancel
                  </button>
                  <button 
                    form="receiptForm"
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm & Issue Receipt'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

