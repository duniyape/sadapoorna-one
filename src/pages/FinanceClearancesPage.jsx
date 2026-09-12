import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Building2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { authHdr, fmt } from '../utils/customerHelpers';

const FINANCE_METHODS = ["FINANCE", "LOAN", "NBFC"];

export default function FinanceClearancesPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [activeTab, setActiveTab] = useState('PENDING');
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIds, setSelectedIds] = useState([]); // Track selected vouchers for batch

  // Modals state
  const [selectedVouchers, setSelectedVouchers] = useState([]); // Array of selected vouchers for modal
  const [actionType, setActionType] = useState(null); // 'DISBURSE', 'BOUNCE', or 'BATCH_DISBURSE'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disburse Form State
  const [bankAccountName, setBankAccountName] = useState('');
  const [clearanceDate, setClearanceDate] = useState('');
  const [utr, setUtr] = useState('');
  const [notes, setNotes] = useState('');
  
  // Subvention state
  const [applyStandardCharges, setApplyStandardCharges] = useState(true);
  const [manualSubvention, setManualSubvention] = useState('');

  // Bounce Form State
  const [bounceReason, setBounceReason] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      let url = '/accounting/vouchers?voucher_mode=Bank';
      if (activeTab !== 'ALL') {
        url += `&verification_status=${activeTab === 'DISBURSED' ? 'VERIFIED' : activeTab}`;
      }
      
      const res = await fetch(url, { headers: authHdr() });
      if (res.ok) {
        const json = await res.json();
        const dataList = json.data?.data || json.data || [];
        // Filter only Finance methods
        const financeVouchers = dataList.filter(v => 
          FINANCE_METHODS.includes((v.payment_mode || '').toUpperCase())
        );
        // Also if tab is ALL, we just use verification_status to show in UI
        setVouchers(financeVouchers);
      } else {
        showToast("Failed to fetch finance vouchers");
      }
    } catch (err) {
      showToast("Network error fetching finance vouchers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    setSelectedIds([]); // Clear selection on tab change
  }, [activeTab]);

  const handleActionClick = (vouchersArr, type) => {
    setSelectedVouchers(vouchersArr);
    setActionType(type);
    
    // Reset forms
    const today = new Date().toISOString().split('T')[0];
    setClearanceDate(today);
    setBankAccountName('');
    setUtr('');
    setNotes('');
    setApplyStandardCharges(true);
    setManualSubvention('');
    
    setBounceReason('');
    setPenaltyAmount('');
  };

  const closeModal = () => {
    setSelectedVouchers([]);
    setActionType(null);
  };

  // Calculations
  const amount = selectedVouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
  let subventionFee = 0;
  
  if (applyStandardCharges) {
    const financeCharge = amount * 0.0061;
    const gstOnFinance = financeCharge * 0.18;
    subventionFee = financeCharge + gstOnFinance;
  } else {
    subventionFee = parseFloat(manualSubvention || 0);
  }
  
  const netBankPayout = Math.max(0, amount - subventionFee);

  const submitAction = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = '';
      let payload = {};

      if (actionType === 'BATCH_DISBURSE') {
        url = `/accounting/vouchers/batch-disburse-finance`;
        payload = {
          voucher_ids: selectedVouchers.map(v => v._id || v.id),
          disbursement_bank_name: bankAccountName,
          bank_clearance_date: clearanceDate,
          total_subvention_charges: parseFloat(subventionFee.toFixed(2)),
          disbursement_utr: utr,
          notes: notes
        };
      } else {
        const voucherId = selectedVouchers[0]._id || selectedVouchers[0].id;
        url = `/accounting/vouchers/${voucherId}`;
        
        if (actionType === 'DISBURSE') {
          url += `/disburse-finance`;
          payload = {
            disbursement_bank_name: bankAccountName,
            bank_clearance_date: clearanceDate,
            subvention_charges: parseFloat(subventionFee.toFixed(2)),
            disbursement_utr: utr,
            notes: notes
          };
        } else if (actionType === 'BOUNCE') {
          url += `/bounce`;
          payload = {
            bounce_reason: bounceReason,
            penalty_amount: parseFloat(penaltyAmount || 0)
          };
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: authHdr(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`Finance ${actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? 'Disbursed' : 'Cancelled'} successfully!`);
        closeModal();
        setSelectedIds([]);
        fetchVouchers();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.detail || err.message || `Failed to process finance transaction`);
      }
    } catch (err) {
      showToast("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for date formatting
  const fmt = (iso) => {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Filter vouchers based on search
  const filteredVouchers = vouchers.filter(v => {
    const term = searchQuery.toLowerCase();
    return (
      (v.voucher_number || '').toLowerCase().includes(term) ||
      (v.payment_mode || '').toLowerCase().includes(term) ||
      (v.transaction_ref || '').toLowerCase().includes(term) ||
      (v.order?.order_no || '').toLowerCase().includes(term) ||
      (v.financier_name || '').toLowerCase().includes(term)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredVouchers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredVouchers.map(v => v._id || v.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDisburse = () => {
    const selected = vouchers.filter(v => selectedIds.includes(v._id || v.id));
    handleActionClick(selected, 'BATCH_DISBURSE');
  };

  return (
    <div className="max-w-6xl mx-auto mt-2 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Finance Clearances</h1>
            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Disburse & Reconcile NBFC</p>
          </div>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Financier or Order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 bg-slate-50 p-2 gap-2">
          {['PENDING', 'DISBURSED', 'BOUNCED', 'ALL'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? (tab === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                     tab === 'DISBURSED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                     tab === 'BOUNCED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                     'bg-slate-800 text-white border border-slate-700')
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Batch Action Bar */}
        {activeTab === 'PENDING' && selectedIds.length > 0 && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-3 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <span className="text-emerald-800 font-bold text-sm ml-2">
              {selectedIds.length} voucher{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <button 
              onClick={handleBatchDisburse}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Batch Disburse Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-wider font-black text-slate-500">
                {activeTab === 'PENDING' && (
                  <th className="p-4 pl-6 font-medium w-12">
                    <input 
                      type="checkbox" 
                      checked={filteredVouchers.length > 0 && selectedIds.length === filteredVouchers.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                )}
                <th className={`p-4 font-medium ${activeTab !== 'PENDING' ? 'pl-6' : ''}`}>Voucher Details</th>
                <th className="p-4 font-medium">Financier / Ref</th>
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
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Fetching finance transactions...
                    </div>
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-bold">
                    No finance transactions found in this category.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v._id || v.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {activeTab === 'PENDING' && (
                      <td className="p-4 pl-6">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(v._id || v.id)}
                          onChange={() => toggleSelect(v._id || v.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    )}
                    <td className={`p-4 ${activeTab !== 'PENDING' ? 'pl-6' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
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
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{v.financier_name || v.payment_mode}</span>
                      </p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Ref: {v.transaction_ref || 'N/A'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Order: {v.order?.order_no || 'Manual'}</p>
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
                        {v.verification_status === 'VERIFIED' ? 'DISBURSED' : v.verification_status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {v.verification_status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleActionClick([v], 'DISBURSE')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Disburse
                          </button>
                          <button 
                            onClick={() => handleActionClick([v], 'BOUNCE')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors"
                          >
                            Cancel
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
      {selectedVouchers.length > 0 && actionType && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full sm:w-[500px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
            
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}>
              <h2 className={`text-lg font-black flex items-center gap-2 ${
                actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? 'text-emerald-800' : 'text-rose-800'
              }`}>
                {actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {actionType === 'DISBURSE' ? 'Disburse Finance Transaction' : actionType === 'BATCH_DISBURSE' ? `Batch Disburse (${selectedVouchers.length} Vouchers)` : 'Cancel Finance'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/50 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitAction} className="p-6 space-y-4">
              
              {actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Financed Gross</p>
                      <p className="font-bold text-slate-700">₹{amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-rose-400">Subvention (-)</p>
                      <p className="font-bold text-rose-600">₹{subventionFee.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Net Bank Payout</p>
                      <p className="font-black text-emerald-700 text-lg">₹{netBankPayout.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                    <input 
                      type="checkbox" 
                      id="stdCharges"
                      checked={applyStandardCharges}
                      onChange={(e) => setApplyStandardCharges(e.target.checked)}
                      className="mt-0.5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="stdCharges" className="text-xs font-bold text-indigo-900 cursor-pointer select-none block">
                        Apply Standard Subvention Charges
                      </label>
                      <p className="text-[10px] font-semibold text-indigo-600/80 leading-snug mt-0.5">
                        Deducts 0.61% of Gross + 18% GST on charges.
                      </p>
                    </div>
                  </div>

                  {!applyStandardCharges && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Manual Subvention (₹)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0"
                        required
                        value={manualSubvention}
                        onChange={(e) => setManualSubvention(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-bold text-slate-800 bg-slate-50"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Disbursement Bank *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. HDFC Current A/c"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Clearance Date *</label>
                      <input 
                        type="date" 
                        required
                        value={clearanceDate}
                        onChange={(e) => setClearanceDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-bold text-slate-800 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Disbursement UTR *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. CMS-BAJAJ-99218201"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value)}
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
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Voucher</p>
                      <p className="font-bold text-slate-700">{selectedVouchers[0]?.voucher_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Amount</p>
                      <p className="font-bold text-slate-700">₹{selectedVouchers[0]?.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Cancellation Reason *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Finance Rejected, Customer Refused"
                      value={bounceReason}
                      onChange={(e) => setBounceReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-bold text-slate-800 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Penalty / File Charges (₹)</label>
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
                  actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}>
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : actionType === 'DISBURSE' || actionType === 'BATCH_DISBURSE' ? 'Confirm Disburse' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
