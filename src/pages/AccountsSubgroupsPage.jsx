import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, ShieldCheck, CheckCircle2, XCircle, X } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AccountsSubgroupsPage({ isComponent = false }) {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [subgroups, setSubgroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubgroup, setEditingSubgroup] = useState(null);
  
  const [formData, setFormData] = useState({
    subgroup_name: '',
    group_id: '',
    description: '',
    status: 'ACTIVE'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/accounting/groups', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setGroups(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const fetchSubgroups = async () => {
    setIsLoading(true);
    try {
      let url = '/accounting/subgroups?';
      const params = new URLSearchParams();
      if (selectedGroupFilter !== 'all') params.append('group_id', selectedGroupFilter);
      if (selectedStatusFilter !== 'all') params.append('status', selectedStatusFilter);

      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSubgroups(json.data || []);
      } else {
        setSubgroups([]);
      }
    } catch (err) {
      console.error("Failed to fetch subgroups", err);
      showToast("Failed to fetch subgroups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchSubgroups();
  }, [selectedGroupFilter, selectedStatusFilter]);

  const handleOpenModal = (subgroup = null) => {
    if (subgroup) {
      setEditingSubgroup(subgroup);
      setFormData({
        subgroup_name: subgroup.subgroup_name || '',
        group_id: subgroup.group_id || '',
        description: subgroup.description || '',
        status: subgroup.status || 'ACTIVE'
      });
    } else {
      setEditingSubgroup(null);
      setFormData({
        subgroup_name: '',
        group_id: '',
        description: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subgroup_name.trim()) {
      showToast("Subgroup Name is required");
      return;
    }
    if (!formData.group_id) {
      showToast("Please select a parent Group");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingSubgroup ? `/accounting/subgroups/${editingSubgroup._id}` : '/accounting/subgroups';
      const method = editingSubgroup ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(editingSubgroup ? "Subgroup updated successfully" : "Subgroup created successfully");
        setIsModalOpen(false);
        fetchSubgroups();
      } else {
        let errMsg = json.detail || "Failed to save subgroup";
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
    if (!window.confirm("Are you sure you want to delete this subgroup?")) return;
    
    try {
      const res = await fetch(`/accounting/subgroups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast("Subgroup deleted successfully");
        fetchSubgroups();
      } else {
        showToast(json.detail || "Failed to delete subgroup");
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
              <h1 className="text-2xl font-bold text-slate-900">Account Subgroups</h1>
              <p className="text-xs text-slate-500">Manage secondary accounting classifications</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Subgroup
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
            <Plus className="w-4 h-4" /> Add Subgroup
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subgroup Name</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Group</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">Loading subgroups...</td>
                </tr>
              ) : subgroups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 text-sm font-medium">No subgroups found</td>
                </tr>
              ) : (
                subgroups.map((subgroup) => (
                  <tr key={subgroup._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{subgroup.subgroup_name}</td>
                    <td className="p-4 font-semibold text-slate-600">{subgroup.group_name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getTypeColor(subgroup.group_type)}`}>
                        {subgroup.group_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-xs truncate max-w-[200px]">{subgroup.description || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(subgroup.status)} flex items-center gap-1 w-fit`}>
                        {subgroup.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {subgroup.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(subgroup)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Subgroup"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subgroup._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Subgroup"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                {editingSubgroup ? 'Edit Account Subgroup' : 'Create Account Subgroup'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subgroup Name *</label>
                <input
                  type="text"
                  required
                  value={formData.subgroup_name}
                  onChange={e => setFormData({ ...formData, subgroup_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors"
                  placeholder="e.g. Bank Accounts"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Parent Group *</label>
                <select
                  required
                  value={formData.group_id}
                  onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white"
                >
                  <option value="" disabled>Select Parent Group</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.group_name} ({g.group_type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
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
                  {isSaving ? 'Saving...' : 'Save Subgroup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
