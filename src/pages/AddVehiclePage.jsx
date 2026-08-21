import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, Settings2, UserCircle, Box, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useOutletContext();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    make: '',
    model: '',
    variant: '',
    color: '',
    
    chassis_number: '',
    engine_number: '',
    registration_date: '',
    
    ownership_type: 'company',
    owner_name: '',
    
    branch: '',
    
    capacity: '',
    capacity_unit: 'kg',
    
    fuel_type: '',
    
    rc_document: '',
    insurance_document: '',
    pollution_document: '',
    fitness_document: '',
    
    insurance_expiry: '',
    pollution_expiry: '',
    fitness_expiry: '',
    permit_expiry: '',
    
    description: '',
    status: 'active'
  });

  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch branches
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

  // Fetch vehicle details if edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchVehicle = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/vehicles/get-one?vehicle_id=${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            const v = json.data;
            setFormData({
              vehicle_number: v.vehicle_number || '',
              vehicle_type: v.vehicle_type || '',
              make: v.make || '',
              model: v.model || '',
              variant: v.variant || '',
              color: v.color || '',
              
              chassis_number: v.chassis_number || '',
              engine_number: v.engine_number || '',
              registration_date: v.registration_date || '',
              
              ownership_type: v.ownership_type || 'company',
              owner_name: v.owner_name || '',
              
              branch: v.branch || '',
              
              capacity: v.capacity || '',
              capacity_unit: v.capacity_unit || 'kg',
              
              fuel_type: v.fuel_type || '',
              
              rc_document: v.rc_document || '',
              insurance_document: v.insurance_document || '',
              pollution_document: v.pollution_document || '',
              fitness_document: v.fitness_document || '',
              
              insurance_expiry: v.insurance_expiry || '',
              pollution_expiry: v.pollution_expiry || '',
              fitness_expiry: v.fitness_expiry || '',
              permit_expiry: v.permit_expiry || '',
              
              description: v.description || '',
              status: v.status || 'active'
            });
          }
        } else {
          showToast('Failed to fetch vehicle details');
          navigate('/vehicles');
        }
      } catch (error) {
        console.error(error);
        showToast('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id, isEditMode, navigate, showToast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = { ...formData };
      if (payload.capacity) {
        payload.capacity = parseFloat(payload.capacity);
      } else {
        payload.capacity = null;
      }
      
      const endpoint = isEditMode ? `/vehicles/update/${id}` : '/vehicles/create';
      
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
        showToast(`Vehicle ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/vehicles');
      } else {
        let errMsg = data.message || data.detail || `Failed to ${isEditMode ? 'update' : 'create'} vehicle`;
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

  const inputClass = "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const cardClass = "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4";
  const cardHeaderClass = "px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-500">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 py-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/vehicles')} type="button" className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {isEditMode ? 'Edit Vehicle' : 'New Vehicle'}
            </h1>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">Fleet Management</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-amber-100 rounded-lg"><Truck className="w-4 h-4 text-amber-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Basic Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Vehicle Number *</label>
              <input type="text" required value={formData.vehicle_number} onChange={e => handleChange('vehicle_number', e.target.value)} placeholder="e.g. MP04 AB 1234" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select value={formData.vehicle_type} onChange={e => handleChange('vehicle_type', e.target.value)} className={inputClass}>
                <option value="">-- Select --</option>
                <option value="truck">Truck</option>
                <option value="van">Van / Minivan</option>
                <option value="pickup">Pickup</option>
                <option value="two_wheeler">Two Wheeler</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Fuel Type</label>
              <select value={formData.fuel_type} onChange={e => handleChange('fuel_type', e.target.value)} className={inputClass}>
                <option value="">-- Select --</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="cng">CNG</option>
                <option value="ev">Electric</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Make (Brand)</label>
              <input type="text" value={formData.make} onChange={e => handleChange('make', e.target.value)} placeholder="e.g. Tata, Mahindra" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input type="text" value={formData.model} onChange={e => handleChange('model', e.target.value)} placeholder="e.g. Ace, Bolero" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Variant / Color</label>
              <div className="flex gap-2">
                <input type="text" value={formData.variant} onChange={e => handleChange('variant', e.target.value)} placeholder="Variant" className={inputClass} />
                <input type="text" value={formData.color} onChange={e => handleChange('color', e.target.value)} placeholder="Color" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Identification & Ownership */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Settings2 className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Identification & Ownership</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Chassis Number</label>
              <input type="text" value={formData.chassis_number} onChange={e => handleChange('chassis_number', e.target.value)} placeholder="VIN / Chassis No." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Engine Number</label>
              <input type="text" value={formData.engine_number} onChange={e => handleChange('engine_number', e.target.value)} placeholder="Engine No." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Registration Date</label>
              <input type="date" value={formData.registration_date} onChange={e => handleChange('registration_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ownership Type</label>
              <select value={formData.ownership_type} onChange={e => handleChange('ownership_type', e.target.value)} className={inputClass}>
                <option value="company">Company Owned</option>
                <option value="rented">Rented / Leased</option>
                <option value="employee">Employee Owned</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Owner Name (If not company)</label>
              <input type="text" value={formData.owner_name} onChange={e => handleChange('owner_name', e.target.value)} placeholder="Name of owner or leasing agency" className={inputClass} disabled={formData.ownership_type === 'company'} />
            </div>
          </div>
        </div>

        {/* Section 3: Branch & Capacity */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-emerald-100 rounded-lg"><Box className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Capacity & Branch</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Linked Branch</label>
              <select value={formData.branch} onChange={e => handleChange('branch', e.target.value)} className={inputClass}>
                <option value="">-- Select Branch (Optional) --</option>
                {branches.map(b => <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Payload Capacity</label>
              <input type="number" step="0.01" value={formData.capacity} onChange={e => handleChange('capacity', e.target.value)} placeholder="e.g. 1500" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Capacity Unit</label>
              <select value={formData.capacity_unit} onChange={e => handleChange('capacity_unit', e.target.value)} className={inputClass}>
                <option value="kg">Kilograms (KG)</option>
                <option value="ton">Tons</option>
                <option value="cbm">Cubic Meters (CBM)</option>
                <option value="liters">Liters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Documents & Expiry */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-sky-100 rounded-lg"><FileText className="w-4 h-4 text-sky-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">4. Documents & Validity</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">
            
            <div className="space-y-2">
              <label className={labelClass}>RC Document Details</label>
              <input type="text" value={formData.rc_document} onChange={e => handleChange('rc_document', e.target.value)} placeholder="RC Info/Number" className={inputClass} />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Insurance Info</label>
              <input type="text" value={formData.insurance_document} onChange={e => handleChange('insurance_document', e.target.value)} placeholder="Policy Number" className={inputClass} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Expiry:</span>
                <input type="date" value={formData.insurance_expiry} onChange={e => handleChange('insurance_expiry', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>PUC (Pollution) Info</label>
              <input type="text" value={formData.pollution_document} onChange={e => handleChange('pollution_document', e.target.value)} placeholder="Certificate Number" className={inputClass} />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-medium">Expiry:</span>
                <input type="date" value={formData.pollution_expiry} onChange={e => handleChange('pollution_expiry', e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Fitness & Permit</label>
              <input type="text" value={formData.fitness_document} onChange={e => handleChange('fitness_document', e.target.value)} placeholder="Fitness Cert No." className={inputClass} />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium w-12">Fit Exp:</span>
                  <input type="date" value={formData.fitness_expiry} onChange={e => handleChange('fitness_expiry', e.target.value)} className={inputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium w-12">Permit:</span>
                  <input type="date" value={formData.permit_expiry} onChange={e => handleChange('permit_expiry', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/vehicles')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Create Vehicle')}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>

      </form>
    </div>
  );
}
