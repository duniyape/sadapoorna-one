import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AddVoucherPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [ledgers, setLedgers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    voucher_type: 'Payment',
    voucher_mode: 'CASH',
    order_id: '',
    invoice_no: '',
    customer_id: '',
    date: new Date().toISOString().split('T')[0],
    narration: '',
  });

  const [entries, setEntries] = useState([
    { ledger_id: '', narration: '', debit: 0, credit: 0 },
    { ledger_id: '', narration: '', debit: 0, credit: 0 }
  ]);

  useEffect(() => {
    const fetchLedgers = async () => {
      try {
        const res = await fetch('/accounting/ledgers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          setLedgers(Array.isArray(json.data) ? json.data : []);
        }
      } catch (e) {
        console.error("Failed to fetch ledgers", e);
      }
    };
    fetchLedgers();
  }, []);

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = field === 'debit' || field === 'credit' ? (parseFloat(value) || 0) : value;
    
    // Automatically zero out the opposite side if one is filled
    if (field === 'debit' && value > 0) newEntries[index].credit = 0;
    if (field === 'credit' && value > 0) newEntries[index].debit = 0;
    
    setEntries(newEntries);
  };

  const addRow = () => {
    setEntries([...entries, { ledger_id: '', narration: '', debit: 0, credit: 0 }]);
  };

  const removeRow = (index) => {
    if (entries.length <= 2) {
      showToast("Minimum 2 entries required for a voucher");
      return;
    }
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const totalDebit = entries.reduce((acc, curr) => acc + (parseFloat(curr.debit) || 0), 0);
  const totalCredit = entries.reduce((acc, curr) => acc + (parseFloat(curr.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      showToast("Debit and Credit totals must be equal and greater than 0");
      return;
    }
    
    // Validate rows
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i].ledger_id) {
        showToast(`Please select a ledger for row ${i + 1}`);
        return;
      }
      if (entries[i].debit === 0 && entries[i].credit === 0) {
        showToast(`Row ${i + 1} must have either debit or credit amount`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        amount: totalDebit,
        entries: entries
      };

      // Remove empty optional fields
      if (!payload.order_id) delete payload.order_id;
      if (!payload.invoice_no) delete payload.invoice_no;
      if (!payload.customer_id) delete payload.customer_id;

      const res = await fetch('/accounting/vouchers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Voucher created successfully!");
        navigate('/accounting-vouchers');
      } else {
        const err = await res.json();
        let errorMsg = err.message || err.detail || "Failed to create voucher";
        if (Array.isArray(err.detail)) {
          errorMsg = err.detail.map(e => `${e.loc?.join(".")}: ${e.msg}`).join(" | ");
        }
        showToast(errorMsg);
      }
    } catch (err) {
      showToast("Network error while creating voucher");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/accounting-vouchers')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-600" />
              Create Accounting Voucher
            </h1>
            <p className="text-xs text-slate-500">Double-entry accounting journal</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Details Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Voucher Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Voucher Type</label>
              <select
                value={formData.voucher_type}
                onChange={(e) => setFormData({ ...formData, voucher_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
              >
                <option value="Payment">Payment</option>
                <option value="Receipt">Receipt</option>
                <option value="Journal">Journal</option>
                <option value="Contra">Contra</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Voucher Mode</label>
              <select
                value={formData.voucher_mode}
                onChange={(e) => setFormData({ ...formData, voucher_mode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
                <option value="UPI">UPI</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Order/Invoice Ref (Opt)</label>
              <input
                type="text"
                placeholder="INV-..."
                value={formData.invoice_no}
                onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Narration (Global)</label>
            <textarea
              rows="2"
              required
              placeholder="Being payment made for..."
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 resize-none"
            ></textarea>
          </div>
        </div>

        {/* Entries (Double Entry Grid) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              Ledger Entries
              {!isBalanced && <AlertCircle className="w-4 h-4 text-rose-500" />}
            </h2>
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 w-[10%] text-center">Dr/Cr</th>
                  <th className="px-4 py-3 w-[30%]">Ledger Account</th>
                  <th className="px-4 py-3 w-[25%]">Line Narration</th>
                  <th className="px-4 py-3 w-[15%] text-right text-rose-600">Debit (₹)</th>
                  <th className="px-4 py-3 w-[15%] text-right text-emerald-600">Credit (₹)</th>
                  <th className="px-4 py-3 w-[5%] text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry, idx) => {
                  const isDebit = entry.debit > 0;
                  const isCredit = entry.credit > 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black ${isDebit ? 'bg-rose-100 text-rose-700' : isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {isDebit ? 'Dr' : isCredit ? 'Cr' : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          required
                          value={entry.ledger_id}
                          onChange={(e) => handleEntryChange(idx, 'ledger_id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select Ledger...</option>
                          {ledgers.map(l => (
                            <option key={l._id || l.id} value={l._id || l.id}>{l.ledger_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="Optional line narration"
                          value={entry.narration}
                          onChange={(e) => handleEntryChange(idx, 'narration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.debit === 0 ? '' : entry.debit}
                          onChange={(e) => handleEntryChange(idx, 'debit', e.target.value)}
                          disabled={entry.credit > 0}
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-rose-700 text-right focus:outline-none focus:border-rose-500 disabled:opacity-30 disabled:bg-slate-50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.credit === 0 ? '' : entry.credit}
                          onChange={(e) => handleEntryChange(idx, 'credit', e.target.value)}
                          disabled={entry.debit > 0}
                          placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-emerald-700 text-right focus:outline-none focus:border-emerald-500 disabled:opacity-30 disabled:bg-slate-50"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">
                    Total
                  </td>
                  <td className={`px-4 py-4 text-right text-sm font-black ${totalDebit === totalCredit ? 'text-slate-800' : 'text-rose-600'}`}>
                    ₹{totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td className={`px-4 py-4 text-right text-sm font-black ${totalDebit === totalCredit ? 'text-slate-800' : 'text-rose-600'}`}>
                    ₹{totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Validation Banner */}
          {!isBalanced && (
            <div className="bg-rose-50/50 p-3 text-center border-t border-rose-100">
              <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Debit and Credit totals must match and be greater than zero! Difference: ₹{Math.abs(totalDebit - totalCredit).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </p>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isBalanced || isSaving}
            className="px-8 py-3 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isSaving ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Voucher</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
