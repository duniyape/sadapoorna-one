import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Edit2, Search, Trash2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AddressesMasterPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/addresses?limit=100');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAddresses = addresses.filter(addr => 
    addr.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0
      };

      if (editingId) {
        const res = await fetch(`/addresses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          showToast(`Address '${formData.name}' updated successfully!`);
          fetchAddresses();
          setEditingId(null);
          setFormData({ name: '', address: '', latitude: '', longitude: '' });
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.detail || `Failed to update address.`);
        }
      } else {
        const res = await fetch('/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          showToast(`Address '${formData.name}' created successfully!`);
          fetchAddresses();
          setFormData({ name: '', address: '', latitude: '', longitude: '' });
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.detail || `Failed to create address.`);
        }
      }
    } catch (error) {
       console.error("API Error:", error);
       showToast("Network error occurred.");
    } finally {
       setIsLoading(false);
    }
  };

  const handleDelete = async (unitId, unitName) => {
    if (!window.confirm(`Are you sure you want to delete Address '${unitName}'?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/addresses/${unitId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        showToast(`Address deleted successfully!`);
        fetchAddresses();
      } else {
        showToast(`Failed to delete address.`);
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setFormData({ 
      name: addr.name || '', 
      address: addr.address || '',
      latitude: addr.latitude || '',
      longitude: addr.longitude || ''
    });
    setEditingId(addr.id || addr._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', address: '', latitude: '', longitude: '' });
  };

  return (
    <div className="max-w-7xl mx-auto mt-2 pb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Addresses</h1>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Name *</label>
                <div className="relative group">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. Main Hub, Branch Office"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Full Address *</label>
                <textarea
                  required placeholder="Enter complete address..."
                  value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              {/* Lat/Lng */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Latitude *</label>
                  <input
                    type="number" step="any" required placeholder="0.0000"
                    value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Longitude *</label>
                  <input
                    type="number" step="any" required placeholder="0.0000"
                    value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.address.trim() || formData.latitude === '' || formData.longitude === ''}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? 'Saving...' : (editingId ? 'Update Address' : 'Create Address')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: List View */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Existing Addresses
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px] ml-1">
                {addresses.length}
              </span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table List */}
          <div className="flex-1 overflow-auto p-3">
            {isLoading && addresses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Loading addresses...</p>
              </div>
            ) : filteredAddresses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">No addresses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredAddresses.map((addr) => (
                  <div 
                    key={addr.id || addr._id} 
                    className={`group bg-white border ${editingId === (addr.id || addr._id) ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'} rounded-xl p-4 transition-all relative overflow-hidden`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${editingId === (addr.id || addr._id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'} transition-colors`}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-10">
                        <h3 className="text-sm font-bold text-slate-900 truncate" title={addr.name}>{addr.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">{addr.address}</p>
                        <div className="mt-2 flex gap-2">
                           <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">Lat: {addr.latitude}</span>
                           <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">Lng: {addr.longitude}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className={`absolute right-3 top-4 flex flex-col gap-1 transition-all duration-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${editingId === (addr.id || addr._id) ? '!opacity-100 !translate-x-0' : ''}`}>
                      <button 
                        onClick={() => handleEdit(addr)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100 bg-white"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(addr.id || addr._id, addr.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-100 bg-white"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
