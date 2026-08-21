import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, Phone, Box, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';

export default function AddWarehousePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useOutletContext();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch: '',
    warehouse_type: 'general',
    capacity: '',
    capacity_unit: 'kg',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_person: '',
    mobile: '',
    email: '',
    description: '',
    status: 'active'
  });

  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch branches for dropdown
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

  // Fetch warehouse details if in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchWarehouse = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/warehouses/get-one?warehouse_id=${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            const w = json.data;
            setFormData({
              name: w.name || '',
              code: w.code || '',
              branch: w.branch || '',
              warehouse_type: w.warehouse_type || 'general',
              capacity: w.capacity || '',
              capacity_unit: w.capacity_unit || 'kg',
              address: w.address || '',
              city: w.city || '',
              state: w.state || '',
              pincode: w.pincode || '',
              contact_person: w.contact_person || '',
              mobile: w.mobile || '',
              email: w.email || '',
              description: w.description || '',
              status: w.status || 'active'
            });
          }
        } else {
          showToast('Failed to fetch warehouse details');
          navigate('/warehouses');
        }
      } catch (error) {
        console.error(error);
        showToast('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWarehouse();
  }, [id, isEditMode, navigate, showToast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Clean up payload (convert capacity to number if provided)
      const payload = { ...formData };
      if (payload.capacity) {
        payload.capacity = parseFloat(payload.capacity);
      } else {
        payload.capacity = null;
      }
      
      const endpoint = isEditMode ? `/warehouses/update/${id}` : '/warehouses/create';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data.status) {
        showToast(`Warehouse ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/warehouses');
      } else {
        // Handle FastAPI validation error format
        let errMsg = data.message || data.detail || `Failed to ${isEditMode ? 'update' : 'create'} warehouse`;
        if (Array.isArray(data.detail)) {
          errMsg = data.detail.map(err => `${err.loc?.join('.') || 'Field'}: ${err.msg}`).join(' | ');
        }
        showToast(errMsg);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const cardClass = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4";
  const cardHeaderClass = "px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-500">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 py-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/warehouses')} type="button" className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {isEditMode ? 'Edit Warehouse' : 'New Warehouse'}
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Facility Configuration</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Building2 className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Basic Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Warehouse Name *</label>
              <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. Central Hub" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Warehouse Code</label>
              <input type="text" value={formData.code || 'Auto-generated'} readOnly disabled className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>Linked Branch</label>
              <select value={formData.branch} onChange={e => handleChange('branch', e.target.value)} className={inputClass}>
                <option value="">-- Select Branch (Optional) --</option>
                {branches.map(b => <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Storage & Capacity */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-emerald-100 rounded-lg"><Box className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Storage & Capacity</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Warehouse Type</label>
              <select value={formData.warehouse_type} onChange={e => handleChange('warehouse_type', e.target.value)} className={inputClass}>
                <option value="general">General</option>
                <option value="cold_storage">Cold Storage</option>
                <option value="hazardous">Hazardous Materials</option>
                <option value="bonded">Bonded Warehouse</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Capacity</label>
              <input type="number" step="0.01" value={formData.capacity} onChange={e => handleChange('capacity', e.target.value)} placeholder="e.g. 5000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Capacity Unit</label>
              <select value={formData.capacity_unit} onChange={e => handleChange('capacity_unit', e.target.value)} className={inputClass}>
                <option value="kg">Kilograms (KG)</option>
                <option value="ton">Tons</option>
                <option value="sqft">Square Feet</option>
                <option value="cbm">Cubic Meters (CBM)</option>
                <option value="pallets">Pallets</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Location */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-amber-100 rounded-lg"><MapPin className="w-4 h-4 text-amber-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Location</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Street Address</label>
              <input type="text" value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Full street address" className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>City</label>
              <input type="text" value={formData.city} onChange={e => handleChange('city', e.target.value)} placeholder="City" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" value={formData.state} onChange={e => handleChange('state', e.target.value)} placeholder="State" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pincode</label>
              <input type="text" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} placeholder="Postal code" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 4: Contact Person */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-sky-100 rounded-lg"><Phone className="w-4 h-4 text-sky-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">4. Contact Information</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Contact Person Name</label>
              <input type="text" value={formData.contact_person} onChange={e => handleChange('contact_person', e.target.value)} placeholder="Manager's Name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input type="tel" value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder="+91..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="email@example.com" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 5: Additional Info */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-purple-100 rounded-lg"><FileText className="w-4 h-4 text-purple-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5. Additional Details</h2>
          </div>
          <div className="p-4">
            <label className={labelClass}>Description / Notes</label>
            <textarea 
              rows={3}
              value={formData.description} 
              onChange={e => handleChange('description', e.target.value)} 
              placeholder="Any specific instructions or details about this warehouse..." 
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/warehouses')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Warehouse' : 'Create Warehouse')}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>

      </form>
    </div>
  );
}
