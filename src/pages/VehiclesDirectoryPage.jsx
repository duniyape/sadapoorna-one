import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, MapPin, Truck, CheckCircle2, AlertTriangle, XCircle, Search, Filter, Eye, X, Calendar, ShieldCheck, FileText, Activity, Hash, Box, CreditCard } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function VehiclesDirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      let url = '/vehicles/get?';
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
          setVehicles(json.data);
        } else {
          setVehicles([]);
        }
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchTerm, selectedBranchFilter, selectedStatusFilter]);

  const handleToggleStatus = async (vehicle) => {
    // Cycle through active -> maintenance -> inactive -> active
    let newStatus = 'active';
    if (vehicle.status === 'active') newStatus = 'maintenance';
    else if (vehicle.status === 'maintenance') newStatus = 'inactive';
    
    try {
      const res = await fetch(`/vehicles/status/${vehicle.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Vehicle status updated to ${newStatus}`);
        fetchVehicles();
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error("Status update error", error);
      showToast("Network error occurred");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'maintenance': return <AlertTriangle className="w-3.5 h-3.5" />;
      default: return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100';
      case 'maintenance': return 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100';
      default: return 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100';
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
            <h1 className="text-2xl font-bold text-slate-900">Vehicles & Fleet</h1>
            <p className="text-xs text-slate-500">Manage company vehicles and transportation</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-vehicle')}
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by number, make, model..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {branches.length > 0 && (
          <div className="relative w-full sm:w-auto min-w-[180px]">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer relative"
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
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer relative"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading vehicles...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No vehicles found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0"></div>
              <div className="w-48 shrink-0">Vehicle</div>
              <div className="w-32 shrink-0">Make/Model</div>
              <div className="w-24 shrink-0">Status</div>
              <div className="w-24 shrink-0">Type</div>
              <div className="flex-1 min-w-[150px]">Owner / Details</div>
              <div className="w-28 shrink-0 text-right">Actions</div>
            </div>
            
            {vehicles.map((v, i) => (
              <div key={v.id || i} className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-xs">
                
                {/* Mobile Top Row / Desktop Left side */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Icon */}
                  <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-sm shrink-0">
                    <Truck className="w-5 h-5 lg:w-4 lg:h-4" />
                  </div>
                  
                  {/* Name & Mobile Make/Model */}
                  <div className="flex-1 min-w-0 lg:w-48 lg:shrink-0 lg:flex-none">
                    <div className="font-bold text-slate-900 truncate text-sm lg:text-xs flex items-center gap-1.5" title={v.vehicle_number}>
                      {v.vehicle_number}
                    </div>
                    <div className="lg:hidden text-slate-500 font-medium truncate mt-0.5 text-[10px]">
                      {v.make} {v.model}
                    </div>
                  </div>

                  {/* Mobile Status */}
                  <div className="lg:hidden shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : v.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>

                {/* Desktop Only Make/Model & Status */}
                <div className="hidden lg:block w-32 shrink-0 text-slate-500 font-medium truncate" title={`${v.make} ${v.model}`}>
                  {v.make} {v.model}
                </div>

                <div className="hidden lg:block w-24 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : v.status === 'maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {v.status}
                  </span>
                </div>
                
                {/* Mobile Details Row / Desktop Middle */}
                <div className="flex items-center justify-between lg:justify-start lg:contents w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <div className="flex items-center gap-4 lg:gap-3 lg:contents w-full">
                    {/* Type */}
                    <div className="w-auto lg:w-24 shrink-0 text-slate-600 capitalize font-medium truncate text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Type:</span>{v.vehicle_type || 'N/A'}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 lg:min-w-[150px] truncate text-slate-500 text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Owner:</span>
                      {v.owner_name || (v.ownership_type === 'company' ? 'Company Owned' : 'N/A')} 
                      <span className="mx-1 text-slate-300">|</span> 
                      {v.capacity ? `${v.capacity} ${v.capacity_unit}` : 'Capacity N/A'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-auto lg:w-32 shrink-0 flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setSelectedVehicle(v)}
                      className="p-1.5 rounded-md bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-100 transition-colors"
                      title="View Vehicle"
                    >
                      <Eye className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(v)}
                      className={`p-1.5 rounded-md border transition-colors ${getStatusColor(v.status)}`}
                      title={`Current Status: ${v.status}. Click to cycle.`}
                    >
                      {getStatusIcon(v.status)}
                    </button>
                    <button 
                      onClick={() => navigate(`/edit-vehicle/${v.id}`)}
                      className="p-1.5 rounded-md bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-colors"
                      title="Edit Vehicle"
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

      {/* View Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/50 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 flex items-center justify-center shadow-inner border border-amber-200/50">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    {selectedVehicle.vehicle_number}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm border ${
                      selectedVehicle.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : selectedVehicle.status === 'maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {selectedVehicle.status}
                    </span>
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1 tracking-tight">
                    {selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.variant ? `- ${selectedVehicle.variant}` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all hover:rotate-90 relative z-10 bg-white shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* General Info */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-50/80 text-blue-600 rounded-xl border border-blue-100/50"><Hash className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">General Info</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">Vehicle Type</span>
                      <span className="text-sm font-bold text-slate-700 capitalize mt-0.5">{selectedVehicle.vehicle_type || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">Fuel Type</span>
                      <span className="text-sm font-bold text-slate-700 capitalize mt-0.5">{selectedVehicle.fuel_type || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">Color</span>
                      <span className="text-sm font-bold text-slate-700 capitalize mt-0.5">{selectedVehicle.color || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Ownership & Registration */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-indigo-50/80 text-indigo-600 rounded-xl border border-indigo-100/50"><CreditCard className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Registration</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Chassis No.</span>
                      <span className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedVehicle.chassis_number || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Engine No.</span>
                      <span className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedVehicle.engine_number || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Reg. Date</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVehicle.registration_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Branch */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-emerald-50/80 text-emerald-600 rounded-xl border border-emerald-100/50"><Box className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Capacity & Owner</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Ownership</span>
                      <span className="text-sm font-bold text-slate-700 capitalize mt-0.5">{selectedVehicle.ownership_type} {selectedVehicle.ownership_type !== 'company' && selectedVehicle.owner_name ? `(${selectedVehicle.owner_name})` : ''}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Payload Capacity</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVehicle.capacity ? `${selectedVehicle.capacity} ${selectedVehicle.capacity_unit}` : 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-emerald-500 transition-colors">Branch</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">
                        {branches.find(b => (b.id || b._id) === selectedVehicle.branch)?.name || selectedVehicle.branch || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Documents & Expiries (Spans full width) */}
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-50/80 text-rose-600 rounded-xl border border-rose-100/50"><ShieldCheck className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Documents & Expiry</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-slate-800 transition-colors"><FileText className="w-3.5 h-3.5"/> RC / Reg.</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVehicle.rc_document || 'N/A'}>{selectedVehicle.rc_document || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-slate-800 transition-colors"><ShieldCheck className="w-3.5 h-3.5"/> Insurance</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVehicle.insurance_document || 'N/A'}>{selectedVehicle.insurance_document || 'N/A'}</div>
                      <div className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> Exp: {selectedVehicle.insurance_expiry || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-slate-800 transition-colors"><Activity className="w-3.5 h-3.5"/> Pollution (PUC)</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVehicle.pollution_document || 'N/A'}>{selectedVehicle.pollution_document || 'N/A'}</div>
                      <div className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> Exp: {selectedVehicle.pollution_expiry || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-slate-800 transition-colors"><ShieldCheck className="w-3.5 h-3.5"/> Fitness / Permit</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVehicle.fitness_document || 'N/A'}>{selectedVehicle.fitness_document || 'N/A'}</div>
                      <div className="text-[10px] font-bold text-rose-500 mt-1 flex flex-col gap-1 w-full">
                        <span className="flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> Fit: {selectedVehicle.fitness_expiry || 'N/A'}</span>
                        <span className="flex items-center gap-1.5 bg-rose-50 px-2 py-0.5 rounded-md"><Calendar className="w-3 h-3"/> Per: {selectedVehicle.permit_expiry || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
