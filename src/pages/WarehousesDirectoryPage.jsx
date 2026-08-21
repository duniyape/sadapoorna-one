import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Plus, Edit2, MapPin, Phone, Box, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

export default function WarehousesDirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/branches/v1', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBranches(data.data || data || []);
        }
      } catch (e) {
        console.error("Failed to fetch branches", e);
      }
    };
    fetchBranches();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      let url = '/warehouses/get?';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedBranchFilter !== 'all') params.append('branch', selectedBranchFilter);
      if (selectedStatusFilter !== 'all') params.append('status', selectedStatusFilter);

      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data) {
          setWarehouses(json.data);
        } else {
          setWarehouses([]);
        }
      } else {
        setWarehouses([]);
      }
    } catch (err) {
      console.error("Failed to fetch warehouses", err);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, [searchTerm, selectedBranchFilter, selectedStatusFilter]);

  const handleToggleStatus = async (warehouse) => {
    const newStatus = warehouse.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/warehouses/status/${warehouse.id}?status=${newStatus}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        showToast(`Warehouse status updated to ${newStatus}`);
        fetchWarehouses();
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error("Status update error", error);
      showToast("Network error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
            <p className="text-xs text-slate-500">Manage storage locations and capacities</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-warehouse')}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Warehouse
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name, code, or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {branches.length > 0 && (
          <div className="relative w-full sm:w-auto min-w-[180px]">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="relative w-full sm:w-auto min-w-[140px]">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading warehouses...</p>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No warehouses found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0"></div>
              <div className="w-48 shrink-0">Warehouse</div>
              <div className="w-32 shrink-0">Code</div>
              <div className="w-24 shrink-0">Status</div>
              <div className="w-32 shrink-0">Type</div>
              <div className="flex-1 min-w-[150px]">Location</div>
              <div className="w-28 shrink-0 text-right">Actions</div>
            </div>
            
            {warehouses.map((w, i) => (
              <div key={w.id || i} className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-xs">
                
                {/* Mobile Top Row / Desktop Left side */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Icon */}
                  <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">
                    <Building2 className="w-5 h-5 lg:w-4 lg:h-4" />
                  </div>
                  
                  {/* Name & Mobile Code */}
                  <div className="flex-1 min-w-0 lg:w-48 lg:shrink-0 lg:flex-none">
                    <div className="font-bold text-slate-900 truncate text-sm lg:text-xs flex items-center gap-1.5" title={w.name}>
                      {w.name}
                    </div>
                    <div className="lg:hidden text-slate-500 font-medium truncate mt-0.5 text-[10px]">
                      Code: {w.code}
                    </div>
                  </div>

                  {/* Mobile Status */}
                  <div className="lg:hidden shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>

                {/* Desktop Only Code & Status */}
                <div className="hidden lg:block w-32 shrink-0 text-slate-500 font-medium truncate" title={w.code}>
                  {w.code}
                </div>

                <div className="hidden lg:block w-24 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    w.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {w.status}
                  </span>
                </div>
                
                {/* Mobile Details Row / Desktop Middle */}
                <div className="flex items-center justify-between lg:justify-start lg:contents w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <div className="flex items-center gap-4 lg:gap-3 lg:contents w-full">
                    {/* Type */}
                    <div className="w-auto lg:w-32 shrink-0 text-slate-600 capitalize font-medium truncate text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Type:</span>{w.warehouse_type || 'General'}
                    </div>
                    
                    {/* Location */}
                    <div className="flex-1 lg:min-w-[150px] truncate text-slate-500 text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Location:</span>{w.city ? `${w.city}, ${w.state}` : 'Not set'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-auto lg:w-28 shrink-0 flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleToggleStatus(w)}
                      className={`p-1.5 rounded-md border transition-colors ${w.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}
                      title={w.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {w.status === 'active' ? <CheckCircle2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" /> : <XCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5" />}
                    </button>
                    <button 
                      onClick={() => navigate(`/edit-warehouse/${w.id}`)}
                      className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      title="Edit Warehouse"
                    >
                      <Edit2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
