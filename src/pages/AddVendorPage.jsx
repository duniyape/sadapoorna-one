import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, Phone, Building, CheckCircle2, Handshake, CreditCard, FileText } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export default function AddVendorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useOutletContext();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    mobile: '',
    email: '',
    gst_number: '',
    pan_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    payment_terms: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch vendor details if in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchVendor = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/vendors/v1/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            const v = json.data;
            setFormData({
              business_name: v.business_name || '',
              contact_person: v.contact_person || '',
              mobile: v.mobile || '',
              email: v.email || '',
              gst_number: v.gst_number || '',
              pan_number: v.pan_number || '',
              address: v.address || '',
              city: v.city || '',
              state: v.state || '',
              pincode: v.pincode || '',
              bank_name: v.bank_name || '',
              account_number: v.account_number || '',
              ifsc_code: v.ifsc_code || '',
              payment_terms: v.payment_terms || '',
              status: v.status || 'active'
            });
          } else if (json.data) {
             const v = json.data;
             setFormData({
              business_name: v.business_name || '',
              contact_person: v.contact_person || '',
              mobile: v.mobile || '',
              email: v.email || '',
              gst_number: v.gst_number || '',
              pan_number: v.pan_number || '',
              address: v.address || '',
              city: v.city || '',
              state: v.state || '',
              pincode: v.pincode || '',
              bank_name: v.bank_name || '',
              account_number: v.account_number || '',
              ifsc_code: v.ifsc_code || '',
              payment_terms: v.payment_terms || '',
              status: v.status || 'active'
            });
          }
        } else {
          showToast('Failed to fetch vendor details');
          navigate('/vendors');
        }
      } catch (error) {
        console.error(error);
        showToast('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendor();
  }, [id, isEditMode, navigate, showToast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = { ...formData };
      
      const endpoint = isEditMode ? `/vendors/update/v1/${id}` : '/vendors/v1';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok && (data.success || data.status)) {
        showToast(`Vendor ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/vendors');
      } else {
        let errMsg = data.message || data.detail || `Failed to ${isEditMode ? 'update' : 'create'} vendor`;
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
          <button onClick={() => navigate('/vendors')} type="button" className="p-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {isEditMode ? 'Edit Vendor' : 'New Vendor'}
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Supplier Management</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Section 1: Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Building2 className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Business Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Business Name *</label>
              <input type="text" required value={formData.business_name} onChange={e => handleChange('business_name', e.target.value)} placeholder="e.g. ABC Enterprises" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Contact Person</label>
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

        {/* Section 2: Taxation Info */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-rose-100 rounded-lg"><FileText className="w-4 h-4 text-rose-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Taxation Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>GST Number</label>
              <input type="text" value={formData.gst_number} onChange={e => handleChange('gst_number', e.target.value)} placeholder="22AAAAA0000A1Z5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PAN Number</label>
              <input type="text" value={formData.pan_number} onChange={e => handleChange('pan_number', e.target.value)} placeholder="AAAAA0000A" className={inputClass} />
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

        {/* Section 4: Bank Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-emerald-100 rounded-lg"><Building className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">4. Bank Account Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Bank Name</label>
              <input type="text" value={formData.bank_name} onChange={e => handleChange('bank_name', e.target.value)} placeholder="e.g. HDFC Bank" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input type="text" value={formData.account_number} onChange={e => handleChange('account_number', e.target.value)} placeholder="Account No." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input type="text" value={formData.ifsc_code} onChange={e => handleChange('ifsc_code', e.target.value)} placeholder="e.g. HDFC0001234" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Section 5: Payment Terms */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-purple-100 rounded-lg"><CreditCard className="w-4 h-4 text-purple-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5. Payment Terms</h2>
          </div>
          <div className="p-4">
            <label className={labelClass}>Payment Terms</label>
            <textarea 
              rows={2}
              value={formData.payment_terms} 
              onChange={e => handleChange('payment_terms', e.target.value)} 
              placeholder="e.g. Net 30, Advance 50%..." 
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Vendor' : 'Create Vendor')}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>

      </form>
    </div>
  );
}
