import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Building2, CheckCircle2, AlertTriangle, IndianRupee, Eye, Download, X } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authHdr, fmt } from '../utils/customerHelpers';

const ONLINE_METHODS = ["UPI", "BANK", "BANK_TRANSFER", "ONLINE", "NEFT", "RTGS"];

export default function BankVerificationPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [activeTab, setActiveTab] = useState('PENDING');
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [actionType, setActionType] = useState(null); // 'VERIFY' or 'BOUNCE'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [clearanceDate, setClearanceDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bounceReason, setBounceReason] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      let url = '/accounting/vouchers?voucher_mode=Bank';
      if (activeTab !== 'ALL') {
        url += `&verification_status=${activeTab}`;
      }
      
      const res = await fetch(url, { headers: { ...authHdr(), 'Content-Type': 'application/json' } });
      if (res.ok) {
        const json = await res.json();
        const dataList = json.data?.data || json.data || [];
        // Filter only online methods
        const onlineVouchers = dataList.filter(v => 
          ONLINE_METHODS.includes((v.payment_mode || '').toUpperCase())
        );
        setVouchers(onlineVouchers);
      } else {
        showToast("Failed to fetch bank vouchers", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [activeTab]);

  const handleActionClick = (voucher, type) => {
    setSelectedVoucher(voucher);
    setActionType(type);
    // Reset forms
    const today = new Date().toISOString().split('T')[0];
    setClearanceDate(today);
    setNotes('');
    setBounceReason('');
    setPenaltyAmount('');
  };

  const closeModal = () => {
    setSelectedVoucher(null);
    setActionType(null);
  };

  const submitAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const voucherId = selectedVoucher._id || selectedVoucher.id;
      let url = `/accounting/vouchers/${voucherId}`;
      let payload = {};

      if (actionType === 'VERIFY') {
        url += `/verify`;
        payload = {
          bank_clearance_date: clearanceDate,
          notes: notes
        };
      } else if (actionType === 'BOUNCE') {
        url += `/bounce`;
        payload = {
          bounce_reason: bounceReason,
          penalty_amount: parseFloat(penaltyAmount || 0)
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { ...authHdr(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`Transaction marked as ${actionType === 'VERIFY' ? 'VERIFIED' : 'BOUNCED'}`);
        closeModal();
        fetchVouchers();
      } else {
        const err = await res.json().catch(() => ({}));
        let errMsg = `Failed to ${actionType.toLowerCase()} transaction`;
        if (typeof err.detail === 'string') errMsg = err.detail;
        else if (typeof err.message === 'string') errMsg = err.message;
        else if (Array.isArray(err.detail) && err.detail.length > 0 && err.detail[0].msg) errMsg = err.detail[0].msg;
        showToast(errMsg);
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter vouchers based on search
  const filteredVouchers = vouchers.filter(v => {
    const term = searchQuery.toLowerCase();
    return (
      (v.voucher_number || '').toLowerCase().includes(term) ||
      (v.payment_mode || '').toLowerCase().includes(term) ||
      (v.transaction_ref || '').toLowerCase().includes(term) ||
      (v.order?.order_no || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto mt-2 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Bank Verification</h1>
            <p className="text-[9px] text-teal-600 font-bold uppercase tracking-widest">Reconcile Online Payments</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Txn Ref or Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 bg-slate-50 p-2 gap-2">
          {['PENDING', 'VERIFIED', 'BOUNCED', 'ALL'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? (tab === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                     tab === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                     tab === 'BOUNCED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                     'bg-slate-800 text-white border border-slate-700')
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-black text-slate-500">
                <th className="p-4 pl-6 font-medium">Voucher Details</th>
                <th className="p-4 font-medium">Reference Info</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Fetching transactions...
                    </div>
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                    No transactions found in this category.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v._id || v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{v.voucher_number}</p>
                          <p className="text-xs text-slate-500">{fmt(v.created_at || v.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{v.payment_mode}</span>
                        {v.transaction_ref || 'N/A'}
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Order: {v.order?.order_no || 'Manual'}</p>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ₹{(v.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        v.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' :
                        v.verification_status === 'BOUNCED' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {v.verification_status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {v.verification_status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleActionClick(v, 'VERIFY')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Clear
                          </button>
                          <button 
                            onClick={() => handleActionClick(v, 'BOUNCE')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Bounce
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Actioned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {selectedVoucher && actionType && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full sm:w-[450px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
            
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              actionType === 'VERIFY' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <h2 className={`text-lg font-black flex items-center gap-2 ${
                actionType === 'VERIFY' ? 'text-emerald-800' : 'text-rose-800'
              }`}>
                {actionType === 'VERIFY' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {actionType === 'VERIFY' ? 'Verify Bank Transaction' : 'Mark as Bounced/Failed'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/50 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAction} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Voucher</p>
                  <p className="font-bold text-slate-700">{selectedVoucher.voucher_number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Amount</p>
                  <p className="font-bold text-slate-700">₹{selectedVoucher.amount?.toLocaleString()}</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200 mt-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Mode & Reference</p>
                  <p className="font-bold text-slate-700">{selectedVoucher.payment_mode} - {selectedVoucher.transaction_ref || 'N/A'}</p>
                </div>
              </div>

              {actionType === 'VERIFY' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Bank Clearance Date *</label>
                    <input 
                      type="date" 
                      required
                      value={clearanceDate}
                      onChange={(e) => setClearanceDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Notes / Remarks</label>
                    <input 
                      type="text" 
                      placeholder="Optional remarks"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Failure/Bounce Reason *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Insufficient funds, Invalid UPI, Reversed"
                      value={bounceReason}
                      onChange={(e) => setBounceReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Penalty Charges (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={penaltyAmount}
                      onChange={(e) => setPenaltyAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`flex-1 px-4 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2 ${
                  actionType === 'VERIFY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}>
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : actionType === 'VERIFY' ? 'Confirm Verify' : 'Confirm Bounce'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

