import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, MapPin, Phone, CheckCircle2, XCircle, Search, Filter, Eye, X, FileText, Hash, UserCircle, Mail, Handshake, Building, CreditCard } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function VendorsDirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      let url = '/vendors/v1?';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatusFilter !== 'all') params.append('status', selectedStatusFilter);

      const res = await fetch(url + params.toString(), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setVendors(json.data);
        } else {
          setVendors([]);
        }
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error("Failed to fetch vendors", err);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedStatusFilter]);

  const handleToggleStatus = async (vendor) => {
    const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/vendors/update/v1/${vendor.id || vendor._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Vendor status updated to ${newStatus}`);
        fetchVendors();
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
            <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
            <p className="text-xs text-slate-500">Manage suppliers and vendor relationships</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-vendor')}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by business name, code, contact or GST..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

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
          <p className="mt-4 text-sm font-bold text-slate-500">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Handshake className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No vendors found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0"></div>
              <div className="w-48 shrink-0">Business Name</div>
              <div className="w-32 shrink-0">Code / GST</div>
              <div className="w-24 shrink-0">Status</div>
              <div className="w-32 shrink-0">Contact</div>
              <div className="flex-1 min-w-[150px]">Location</div>
              <div className="w-28 shrink-0 text-right">Actions</div>
            </div>
            
            {vendors.map((v, i) => (
              <div key={v.id || v._id || i} className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-xs">
                
                {/* Mobile Top Row / Desktop Left side */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Icon */}
                  <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">
                    <Handshake className="w-5 h-5 lg:w-4 lg:h-4" />
                  </div>
                  
                  {/* Name & Mobile Code */}
                  <div className="flex-1 min-w-0 lg:w-48 lg:shrink-0 lg:flex-none">
                    <div className="font-bold text-slate-900 truncate text-sm lg:text-xs flex items-center gap-1.5" title={v.business_name}>
                      {v.business_name}
                    </div>
                    <div className="lg:hidden text-slate-500 font-medium truncate mt-0.5 text-[10px]">
                      {v.vendor_code}
                    </div>
                  </div>

                  {/* Mobile Status */}
                  <div className="lg:hidden shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>

                {/* Desktop Only Code & Status */}
                <div className="hidden lg:block w-32 shrink-0 text-slate-500 font-medium truncate">
                  <div title={v.vendor_code}>{v.vendor_code}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5" title={v.gst_number || 'No GST'}>{v.gst_number || 'No GST'}</div>
                </div>

                <div className="hidden lg:block w-24 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {v.status}
                  </span>
                </div>
                
                {/* Mobile Details Row / Desktop Middle */}
                <div className="flex items-center justify-between lg:justify-start lg:contents w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <div className="flex items-center gap-4 lg:gap-3 lg:contents w-full">
                    {/* Contact */}
                    <div className="w-auto lg:w-32 shrink-0 text-slate-600 font-medium truncate text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Contact:</span>{v.mobile || v.contact_person || 'N/A'}
                    </div>
                    
                    {/* Location */}
                    <div className="flex-1 lg:min-w-[150px] truncate text-slate-500 text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Location:</span>{v.city ? `${v.city}, ${v.state}` : 'Not set'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-auto lg:w-32 shrink-0 flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setSelectedVendor(v)}
                      className="p-1.5 rounded-md bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-100 transition-colors"
                      title="View Vendor"
                    >
                      <Eye className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(v)}
                      className={`p-1.5 rounded-md border transition-colors ${v.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}
                      title={v.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {v.status === 'active' ? <CheckCircle2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" /> : <XCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5" />}
                    </button>
                    <button 
                      onClick={() => navigate(`/edit-vendor/${v.id || v._id}`)}
                      className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      title="Edit Vendor"
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
      {selectedVendor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100/50 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-200/50">
                  <Handshake className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    {selectedVendor.business_name}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm border ${
                      selectedVendor.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {selectedVendor.status}
                    </span>
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 mt-1 tracking-tight flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> {selectedVendor.vendor_code || 'No Code'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all hover:rotate-90 relative z-10 bg-white shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Contact Information */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-indigo-50/80 text-indigo-600 rounded-xl border border-indigo-100/50"><UserCircle className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Contact Info</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors flex items-center gap-1"><UserCircle className="w-3 h-3"/> Name</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVendor.contact_person || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors flex items-center gap-1"><Phone className="w-3 h-3"/> Mobile</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVendor.mobile || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-indigo-500 transition-colors flex items-center gap-1"><Mail className="w-3 h-3"/> Email</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5 break-all">{selectedVendor.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-amber-50/80 text-amber-600 rounded-xl border border-amber-100/50"><MapPin className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Location Info</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">Address</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVendor.address || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">City & State</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVendor.city || 'N/A'}, {selectedVendor.state || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-amber-500 transition-colors">Pincode</span>
                      <span className="text-sm font-bold text-slate-700 mt-0.5">{selectedVendor.pincode || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Taxation Info */}
                <div className="bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-rose-50/80 text-rose-600 rounded-xl border border-rose-100/50"><FileText className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Taxation Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-rose-500 transition-colors">GST Number</span>
                      <span className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedVendor.gst_number || 'N/A'}</span>
                    </div>
                    <div className="w-full h-px bg-slate-50"></div>
                    <div className="flex flex-col group">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider group-hover:text-rose-500 transition-colors">PAN Number</span>
                      <span className="text-sm font-bold text-slate-700 font-mono mt-0.5">{selectedVendor.pan_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Bank Details & Payment Terms (Spans full width) */}
                <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[1.5rem] p-6 border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50/80 text-emerald-600 rounded-xl border border-emerald-100/50"><Building className="w-4 h-4" /></div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Financial Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors"><Building className="w-3.5 h-3.5"/> Bank Name</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVendor.bank_name || 'N/A'}>{selectedVendor.bank_name || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors"><CreditCard className="w-3.5 h-3.5"/> Account Number</div>
                      <div className="text-sm font-bold text-slate-800 font-mono w-full truncate" title={selectedVendor.account_number || 'N/A'}>{selectedVendor.account_number || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors"><Hash className="w-3.5 h-3.5"/> IFSC Code</div>
                      <div className="text-sm font-bold text-slate-800 font-mono truncate w-full" title={selectedVendor.ifsc_code || 'N/A'}>{selectedVendor.ifsc_code || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-100 flex flex-col items-start gap-1.5 hover:shadow-md hover:border-slate-200 transition-all group">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors"><FileText className="w-3.5 h-3.5"/> Payment Terms</div>
                      <div className="text-sm font-bold text-slate-800 truncate w-full" title={selectedVendor.payment_terms || 'N/A'}>{selectedVendor.payment_terms || 'N/A'}</div>
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
