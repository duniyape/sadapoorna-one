import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, CheckCircle, Save, Eye, Edit2, Map, Globe, Hash, X, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function BranchProfilePage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    status: 'active'
  });

  const [branches, setBranches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingBranch, setViewingBranch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/branches/v1');
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          setBranches(Array.isArray(data) ? data : (data.data || data.branches || []));
        } else {
          console.warn("API returned HTML instead of JSON. Ensure your backend is running and proxy is configured.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch branches", error);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        status: formData.status
      };

      if (editingId) {
        const res = await fetch(`/branches/v1/${editingId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast(`Branch '${formData.name}' updated successfully!`);
          fetchBranches();
          setEditingId(null);
          setFormData({ name: '', address: '', city: '', state: '', country: '', pincode: '', status: 'active' });
        } else {
          showToast(`Failed to update branch.`);
        }
      } else {
        const res = await fetch('/branches/v1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast(`Branch '${formData.name}' created successfully!`);
          fetchBranches();
          setFormData({ name: '', address: '', city: '', state: '', country: '', pincode: '', status: 'active' });
        } else {
          showToast(`Failed to create branch.`);
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setFormData({
      name: branch.name || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || '',
      pincode: branch.pincode || '',
      status: branch.status || 'active'
    });
    setEditingId(branch.branch_id || branch.id || branch._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', city: '', state: '', country: '', pincode: '', status: 'active' });
  };

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Branch Management</h1>
          <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10">
            {editingId ? 'Edit Branch' : 'Add New Branch'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              {/* Branch Name */}
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Name *</label>
                <div className="relative group">
                  <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="South Hub"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address Line */}
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Address Line *</label>
                <div className="relative group">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="Street, Building No..."
                    value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">City *</label>
                <div className="relative group">
                  <Map className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="Bangalore"
                    value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">State *</label>
                <div className="relative group">
                  <Map className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="Karnataka"
                    value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Country & Pin Code */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Country *</label>
                <div className="relative group">
                  <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="India"
                    value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">PIN Code *</label>
                <div className="relative group">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="560001"
                    value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <div className="relative group">
                  <CheckCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none" />
                  <select
                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white transition-all appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-[10px] shadow-sm shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isLoading ? 'Processing...' : (editingId ? 'Update Branch' : 'Save Branch')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Branch List */}
        <div className="lg:flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Existing Branches</h2>
              <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold border border-slate-200">
                {branches.length}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider first:rounded-tl-lg">Branch Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">City</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right last:rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranches.map((branch) => {
                  const branchId = branch.branch_id || branch.id || branch._id;
                  return (
                    <tr key={branchId} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{branch.name}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{branch.city}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${branch.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                          {branch.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingBranch(branch)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(branch)}
                          className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded border border-amber-100 transition-colors"
                          title="Update"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {isLoading && branches.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs font-bold animate-pulse">
                Loading branches...
              </div>
            )}

            {!isLoading && filteredBranches.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                {searchQuery ? 'No branches match your search.' : 'No branches found. Add a new branch using the form.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Branch Details</h3>
              </div>
              <button onClick={() => setViewingBranch(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Branch Name</p>
                <p className="text-sm font-bold text-slate-900">{viewingBranch.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Full Address</p>
                <p className="text-xs text-slate-700">{viewingBranch.address}</p>
                <p className="text-xs text-slate-700">{viewingBranch.city}, {viewingBranch.state} - {viewingBranch.pincode}</p>
                <p className="text-xs text-slate-700">{viewingBranch.country}</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${viewingBranch.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                    {viewingBranch.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setViewingBranch(null)} className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
