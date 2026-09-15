import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Calendar, Receipt, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { fmtMoney, fmt } from '../utils/customerHelpers';
import ViewVoucherModal from '../components/ViewVoucherModal';

export default function AccountingVouchersPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVoucherId, setSelectedVoucherId] = useState(null);
  
  const [filterType, setFilterType] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      let url = '/accounting/vouchers/?';
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('voucher_type', filterType);
      if (filterMode !== 'all') params.append('voucher_mode', filterMode);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);

      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setVouchers(Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
      } else {
        setVouchers([]);
      }
    } catch (err) {
      console.error("Failed to fetch vouchers", err);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filterType, filterMode, fromDate, toDate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      const res = await fetch(`/accounting/vouchers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        showToast("Voucher deleted successfully");
        fetchVouchers();
      } else {
        const err = await res.json();
        showToast(err.message || err.detail || "Failed to delete voucher");
      }
    } catch (err) {
      showToast("Network error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-600" />
              Accounting Vouchers
            </h1>
            <p className="text-xs text-slate-500">Manage all accounting entries (Payments, Receipts, Journals)</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Receipt">Receipt</option>
            <option value="Journal">Journal</option>
            <option value="Contra">Contra</option>
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Voucher Info</th>
                <th className="p-4">Type & Mode</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-500 mt-2">Loading vouchers...</p>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-500 font-bold">
                    No vouchers found.
                  </td>
                </tr>
              ) : (
                vouchers.map(v => (
                  <tr key={v._id || v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900">{v.voucher_no || v.id?.slice(-6)}</div>
                      <div className="text-xs text-slate-500">{fmt(v.date || v.created_at)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.voucher_type === 'Payment' ? 'bg-rose-100 text-rose-700' :
                          v.voucher_type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' :
                          v.voucher_type === 'Journal' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {v.voucher_type}
                        </span>
                        {v.voucher_mode && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{v.voucher_mode}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-slate-900">{fmtMoney(v.amount)}</div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => {
                          const realId = v._id || (v.id?.length === 24 ? v.id : v.voucher_id);
                          setSelectedVoucherId(realId);
                        }} className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => {
                          const realId = v._id || (v.id?.length === 24 ? v.id : v.voucher_id);
                          handleDelete(realId);
                        }} className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* View Modal */}
      <ViewVoucherModal voucherId={selectedVoucherId} onClose={() => setSelectedVoucherId(null)} />
    </div>
  );
}
