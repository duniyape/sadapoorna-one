import React, { useState } from 'react';
import { ArrowLeft, Save, UserCircle, MapPin, Briefcase, CreditCard, Layers, FileText, X, Plus, Users, Building2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [formData, setFormData] = useState({
    customer_type: 'individual',
    name: '',
    display_name: '',
    email: '',
    mobile: '',
    alternate_mobile: '',
    date_of_birth: '',
    gender: 'Male',
    billing_address: { address: '', city: '', state: '', country: '', pincode: '' },
    shipping_address: { address: '', city: '', state: '', country: '', pincode: '' },
    sameAsBilling: true,
    company_name: '',
    business_type: '',
    gst_number: '',
    pan_number: '',
    registration_number: '',
    contact_person_name: '',
    contact_person_mobile: '',
    contact_person_email: '',
    credit_limit: '',
    credit_days: '',
    opening_balance: '',
    payment_terms: '',
    customer_category: 'Retail',
    customer_group: '',
    price_category: '',
    branch_id: '',
    assigned_employee_id: '',
    documents: []
  });

  const [docInput, setDocInput] = useState({ type: 'PAN', document_number: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleDocAdd = () => {
    if (!docInput.type || !docInput.document_number) return;
    setFormData({
      ...formData,
      documents: [...formData.documents, { ...docInput, file_url: 'placeholder_url' }]
    });
    setDocInput({ type: 'PAN', document_number: '' });
  };

  const removeDoc = (index) => {
    const newDocs = [...formData.documents];
    newDocs.splice(index, 1);
    setFormData({ ...formData, documents: newDocs });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData };
    if (payload.sameAsBilling) {
      payload.shipping_address = { ...payload.billing_address };
    }
    console.log("Customer Payload Submitted:", payload);
    setTimeout(() => {
      showToast(`Customer account '${formData.name}' created successfully!`);
      setIsSaving(false);
      navigate('/customers');
    }, 600);
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1";
  const cardClass = "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md";
  const cardHeaderClass = "px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2";

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-2 border-b border-transparent">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customers')} type="button" className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Add Customer Account</h1>
            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Master Directory</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Customer Type Selector */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-[13px] font-bold text-slate-800">Registration Type</h3>
            <p className="text-[11px] text-slate-500">Is this an individual customer or a registered business?</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleChange('customer_type', 'individual')}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.customer_type === 'individual' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="w-3.5 h-3.5" /> Individual
            </button>
            <button
              type="button"
              onClick={() => handleChange('customer_type', 'business')}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.customer_type === 'business' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 className="w-3.5 h-3.5" /> Business
            </button>
          </div>
        </div>

        {/* Section 1: Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1 bg-indigo-100 rounded-md"><UserCircle className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Basic Details</h2>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>Full Name *</label>
              <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. John Doe" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Display Name</label>
              <input type="text" value={formData.display_name} onChange={e => handleChange('display_name', e.target.value)} placeholder="e.g. John D" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="john@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Mobile Number *</label>
              <input type="tel" required value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder="+91 9876543210" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alternate Mobile</label>
              <input type="tel" value={formData.alternate_mobile} onChange={e => handleChange('alternate_mobile', e.target.value)} placeholder="Optional" className={inputClass} />
            </div>
            {formData.customer_type === 'individual' && (
              <>
                {/* <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} className={inputClass} />
                </div> */}
                {/* <div>
                  <label className={labelClass}>Gender</label>
                  <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} className={inputClass}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div> */}
              </>
            )}
          </div>
        </div>

        {/* Section 3 & 4: Business Details */}
        {formData.customer_type === 'business' && (
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <div className="p-1 bg-indigo-100 rounded-md"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Business & Contact Details</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Company Name *</label>
                <input type="text" required value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} placeholder="e.g. Acme Corp Pvt Ltd" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Business Type</label>
                <input type="text" value={formData.business_type} onChange={e => handleChange('business_type', e.target.value)} placeholder="e.g. Retailer" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Registration No.</label>
                <input type="text" value={formData.registration_number} onChange={e => handleChange('registration_number', e.target.value)} placeholder="CIN / Udyam" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GST Number</label>
                <input type="text" value={formData.gst_number} onChange={e => handleChange('gst_number', e.target.value)} placeholder="GSTIN" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>PAN Number</label>
                <input type="text" value={formData.pan_number} onChange={e => handleChange('pan_number', e.target.value)} placeholder="PAN" className={inputClass} />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Contact Person *</label>
                  <input type="text" required value={formData.contact_person_name} onChange={e => handleChange('contact_person_name', e.target.value)} placeholder="Manager's Name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Mobile *</label>
                  <input type="tel" required value={formData.contact_person_mobile} onChange={e => handleChange('contact_person_mobile', e.target.value)} placeholder="+91..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" value={formData.contact_person_email} onChange={e => handleChange('contact_person_email', e.target.value)} placeholder="email@company.com" className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Addresses */}
        <div className={cardClass}>
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-indigo-100 rounded-md"><MapPin className="w-4 h-4 text-indigo-600" /></div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Address Details</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm w-fit">
              <input type="checkbox" checked={formData.sameAsBilling} onChange={e => handleChange('sameAsBilling', e.target.checked)} className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
              <span className="text-[11px] font-bold text-slate-700">Shipping same as Billing</span>
            </label>
          </div>
          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Billing */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded w-fit uppercase tracking-wider">Billing Address</h3>
              <div>
                <label className={labelClass}>Full Address *</label>
                <textarea required rows="2" value={formData.billing_address.address} onChange={e => handleAddressChange('billing_address', 'address', e.target.value)} placeholder="Street address..." className={inputClass}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>City *</label>
                  <input type="text" required value={formData.billing_address.city} onChange={e => handleAddressChange('billing_address', 'city', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State *</label>
                  <input type="text" required value={formData.billing_address.state} onChange={e => handleAddressChange('billing_address', 'state', e.target.value)} className={inputClass} />
                </div>
                {/* <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={formData.billing_address.country} onChange={e => handleAddressChange('billing_address', 'country', e.target.value)} className={inputClass} />
                </div> */}
                <div>
                  <label className={labelClass}>Pincode </label>
                  <input type="text" value={formData.billing_address.pincode} onChange={e => handleAddressChange('billing_address', 'pincode', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Shipping */}
            {!formData.sameAsBilling && (
              <div className="space-y-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8">
                <h3 className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded w-fit uppercase tracking-wider">Shipping Address</h3>
                <div>
                  <label className={labelClass}>Full Address *</label>
                  <textarea required rows="2" value={formData.shipping_address.address} onChange={e => handleAddressChange('shipping_address', 'address', e.target.value)} placeholder="Street address..." className={inputClass}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input type="text" required value={formData.shipping_address.city} onChange={e => handleAddressChange('shipping_address', 'city', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input type="text" required value={formData.shipping_address.state} onChange={e => handleAddressChange('shipping_address', 'state', e.target.value)} className={inputClass} />
                  </div>
                  {/* <div>
                    <label className={labelClass}>Country</label>
                    <input type="text" value={formData.shipping_address.country} onChange={e => handleAddressChange('shipping_address', 'country', e.target.value)} className={inputClass} />
                  </div> */}
                  <div>
                    <label className={labelClass}>Pincode </label>
                    <input type="text" value={formData.shipping_address.pincode} onChange={e => handleAddressChange('shipping_address', 'pincode', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Section 5: Financial */}


          {/* Section 6 & 7: Categorization & Assignment */}
          <div className={`${cardClass} flex flex-col`}>
            <div className={cardHeaderClass}>
              <div className="p-1 bg-indigo-100 rounded-md"><Layers className="w-4 h-4 text-indigo-600" /></div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category & Assignment</h2>
            </div>
            <div className="p-4 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">


              <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 border-t border-slate-100 pt-4">
                <div>
                  <label className={labelClass}>Branch / Hub</label>
                  <select value={formData.branch_id} onChange={e => handleChange('branch_id', e.target.value)} className={inputClass}>
                    <option value="">-- Select Branch --</option>
                    <option value="b1">Headquarters</option>
                    <option value="b2">North Zone Hub</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Assigned Employee</label>
                  <select value={formData.assigned_employee_id} onChange={e => handleChange('assigned_employee_id', e.target.value)} className={inputClass}>
                    <option value="">-- Select Employee --</option>
                    <option value="u1">Indrajeet (Sales)</option>
                    <option value="u2">Rahul (Admin)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Documents */}

        {/* Action Bar (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 sm:left-64 p-3 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-end gap-3 z-50">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="px-5 py-2 rounded-lg border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 bg-white shadow-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form >
    </div >
  );
}
