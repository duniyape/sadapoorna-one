import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, ShieldCheck, CheckCircle2, XCircle, X } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AccountsLedgersPage({ isComponent = false }) {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [ledgers, setLedgers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  
  const [formData, setFormData] = useState({
    ledger_name: '',
    group_id: '',
    subgroup_id: '',
    opening_balance: 0,
    opening_balance_type: 'DEBIT',
    description: '',
    status: 'ACTIVE'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchGroupsAndSubgroups = async () => {
    try {
      const [gRes, sgRes] = await Promise.all([
        fetch('/accounting/groups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/accounting/subgroups', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      ]);
      
      if (gRes.ok) {
        const json = await gRes.json();
        setGroups(json.data || []);
      }
      if (sgRes.ok) {
        const json = await sgRes.json();
        setSubgroups(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch groups/subgroups", err);
    }
  };

  const fetchLedgers = async () => {
    setIsLoading(true);
    try {
      let url = '/accounting/ledgers?';
      const params = new URLSearchParams();
      if (selectedGroupFilter !== 'all') params.append('group_id', selectedGroupFilter);
      if (selectedStatusFilter !== 'all') params.append('status', selectedStatusFilter);

      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setLedgers(json.data || []);
      } else {
        setLedgers([]);
      }
    } catch (err) {
      console.error("Failed to fetch ledgers", err);
      showToast("Failed to fetch ledgers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndSubgroups();
  }, []);

  useEffect(() => {
    fetchLedgers();
  }, [selectedGroupFilter, selectedStatusFilter]);

  const handleOpenModal = (ledger = null) => {
    if (ledger) {
      setEditingLedger(ledger);
      setFormData({
        ledger_name: ledger.ledger_name || '',
        group_id: ledger.group_id || '',
        subgroup_id: ledger.subgroup_id || '',
        opening_balance: ledger.opening_balance || 0,
        opening_balance_type: ledger.opening_balance_type || 'DEBIT',
        description: ledger.description || '',
        status: ledger.status || 'ACTIVE'
      });
    } else {
      setEditingLedger(null);
      setFormData({
        ledger_name: '',
        group_id: '',
        subgroup_id: '',
        opening_balance: 0,
        opening_balance_type: 'DEBIT',
        description: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ledger_name.trim()) {
      showToast("Ledger Name is required");
      return;
    }
    if (!formData.group_id) {
      showToast("Please select a parent Group");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingLedger ? `/accounting/ledgers/${editingLedger._id}` : '/accounting/ledgers';
      const method = editingLedger ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        opening_balance: parseFloat(formData.opening_balance) || 0,
        subgroup_id: formData.subgroup_id === '' ? null : formData.subgroup_id
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(editingLedger ? "Ledger updated successfully" : "Ledger created successfully");
        setIsModalOpen(false);
        fetchLedgers();
      } else {
        let errMsg = json.detail || "Failed to save ledger";
        if (Array.isArray(json.detail)) {
          errMsg = json.detail.map(e => `${e.loc?.join(".") || "Field"}: ${e.msg}`).join(" | ");
        }
        showToast(errMsg);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ledger?")) return;
    
    try {
      const res = await fetch(`/accounting/ledgers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast("Ledger deleted successfully");
        fetchLedgers();
      } else {
        showToast(json.detail || "Failed to delete ledger");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error occurred");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'INACTIVE': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'ASSETS': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'LIABILITIES': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'INCOME': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'EXPENSES': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={isComponent ? "space-y-4" : "space-y-6"}>
      {!isComponent && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Account Ledgers</h1>
              <p className="text-xs text-slate-500">Manage individual accounting ledgers</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Ledger
          </button>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Groups</option>
            {groups.map(g => (
              <option key={g._id} value={g._id}>{g.group_name}</option>
            ))}
          </select>
          
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        {isComponent && (
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Ledger
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ledger Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Group / Subgroup</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">Loading ledgers...</td>
                </tr>
              ) : ledgers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">No ledgers found</td>
                </tr>
              ) : (
                ledgers.map((ledger) => (
                  <tr key={ledger._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{ledger.ledger_name}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-600">{ledger.group_name}</div>
                      {ledger.subgroup_name && <div className="text-[10px] text-slate-400 mt-0.5">↳ {ledger.subgroup_name}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getTypeColor(ledger.group_type)}`}>
                        {ledger.group_type}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-700">
                      ₹{ledger.opening_balance?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">{ledger.opening_balance_type}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(ledger.status)} flex items-center gap-1 w-fit`}>
                        {ledger.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {ledger.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(ledger)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Ledger"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ledger._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Ledger"
                        >
                          <X className="w-4 h-4" />
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                {editingLedger ? 'Edit Account Ledger' : 'Create Account Ledger'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ledger Name *</label>
                <input
                  type="text"
                  required
                  value={formData.ledger_name}
                  onChange={e => setFormData({ ...formData, ledger_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Cash Account"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Parent Group *</label>
                  <select
                    required
                    value={formData.group_id}
                    onChange={e => setFormData({ ...formData, group_id: e.target.value, subgroup_id: '' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white"
                  >
                    <option value="" disabled>Select Group</option>
                    {groups.map(g => (
                      <option key={g._id} value={g._id}>{g.group_name} ({g.group_type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subgroup (Optional)</label>
                  <select
                    value={formData.subgroup_id}
                    onChange={e => setFormData({ ...formData, subgroup_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white"
                    disabled={!formData.group_id}
                  >
                    <option value="">No Subgroup</option>
                    {subgroups.filter(sg => sg.group_id === formData.group_id).map(sg => (
                      <option key={sg._id} value={sg._id}>{sg.subgroup_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.opening_balance}
                    onChange={e => setFormData({ ...formData, opening_balance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Balance Type</label>
                  <select
                    value={formData.opening_balance_type}
                    onChange={e => setFormData({ ...formData, opening_balance_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white"
                  >
                    <option value="DEBIT">Debit (Dr)</option>
                    <option value="CREDIT">Credit (Cr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
