import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, UserCircle, MapPin, Briefcase, CreditCard, Layers, FileText, X, Plus, Users, Building2 } from 'lucide-react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import indiaData from '../utils/indiaStatesCities.json';

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isViewMode = searchParams.get('view') === 'true';
  const isEditMode = !!id;
  const { showToast, user } = useOutletContext();

  const [formData, setFormData] = useState({
    customer_type: 'business', // Default to business since it's the first option now
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
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Check if the user has Assignment permission for add-customer
  const hasAssignmentPermission = user?.access?.frontend_icons?.find(
    (item) => item.icon === 'add-customer'
  )?.buttons?.includes('Assignment') || false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, userRes] = await Promise.all([
          fetch('/branches/v1').catch(() => null),
          fetch('/users/get').catch(() => null)
        ]);
        if (branchRes && branchRes.ok) {
          const branchData = await branchRes.json();
          setBranches(branchData.data || branchData || []);
        }
        if (userRes && userRes.ok) {
          const userData = await userRes.json();
          setEmployees(userData.data || userData || []);
        }

        if (isEditMode) {
          const custRes = await fetch(`/customer/${id}`);
          if (custRes.ok) {
            const custData = await custRes.json();
            if (custData.status && custData.data) {
              const c = custData.data;
              setFormData(prev => ({
                ...prev,
                customer_type: c.customer_type || 'business',
                name: c.name || '',
                email: c.email || '',
                mobile: c.mobile || '',
                alternate_mobile: c.alternate_mobile || '',
                billing_address: c.billing_address || prev.billing_address,
                shipping_address: c.shipping_address || prev.shipping_address,
                sameAsBilling: c.sameAsBilling ?? prev.sameAsBilling,
                company_name: c.company_name || '',
                business_type: c.business_type || '',
                gst_number: c.gst_number || '',
                branch_id: c.branch_id || prev.branch_id,
                assigned_employee_id: c.assigned_employee_id || prev.assigned_employee_id
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [id, isEditMode]);

  // Set default values from logged-in user profile whenever it becomes available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        branch_id: user.branch?.id || user.branch?._id || prev.branch_id,
        assigned_employee_id: user.id || user._id || prev.assigned_employee_id
      }));
    }
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.branch_id || !formData.assigned_employee_id) {
      showToast("Please select Branch and Assigned Employee in the Assignment section.");
      return;
    }

    setIsSaving(true);
    
    // Construct clean payload matching Pydantic model
    const payload = {
      customer_type: formData.customer_type,
      name: formData.name,
      email: formData.email || null,
      mobile: formData.mobile,
      alternate_mobile: formData.alternate_mobile || null,
      billing_address: {
        address: formData.billing_address.address || null,
        city: formData.billing_address.city || null,
        state: formData.billing_address.state || null,
        pincode: formData.billing_address.pincode || null,
      },
      shipping_address: formData.sameAsBilling ? {
        address: formData.billing_address.address || null,
        city: formData.billing_address.city || null,
        state: formData.billing_address.state || null,
        pincode: formData.billing_address.pincode || null,
      } : {
        address: formData.shipping_address.address || null,
        city: formData.shipping_address.city || null,
        state: formData.shipping_address.state || null,
        pincode: formData.shipping_address.pincode || null,
      },
      sameAsBilling: formData.sameAsBilling,
      company_name: formData.company_name || null,
      business_type: formData.business_type || null,
      gst_number: formData.gst_number || null,
      branch_id: formData.branch_id,
      assigned_employee_id: formData.assigned_employee_id
    };

    console.log("Customer JSON Payload:");
    console.log(JSON.stringify(payload, null, 2));

    try {
      const endpoint = isEditMode ? `/customer/update/${id}` : '/customer/create';
      // Most of these API structures use POST for updates, but we'll use PUT if the user's FastAPI uses PUT. Since not specified, POST is safer if it's named update. We will use POST.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data.status) {
        showToast(`Customer account '${formData.name}' ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/customers'); 
      } else {
        showToast(data.detail || data.message || `Failed to ${isEditMode ? 'update' : 'create'} customer`);
      }
    } catch (err) {
      console.error("API error:", err);
      showToast("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-2.5 py-1.5 rounded border border-slate-200 text-[12px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400";
  const labelClass = "block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5";
  const cardClass = "bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden";
  const cardHeaderClass = "px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5";

  // Derive available cities based on selected state
  const billingCities = useMemo(() => indiaData[formData.billing_address.state] || [], [formData.billing_address.state]);
  const shippingCities = useMemo(() => indiaData[formData.shipping_address.state] || [], [formData.shipping_address.state]);
  const allStates = Object.keys(indiaData);

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Global Datalists for Searchable Dropdowns */}
      <datalist id="india-states">
        {allStates.map(state => <option key={state} value={state} />)}
      </datalist>
      <datalist id="billing-cities">
        {billingCities.map(city => <option key={city} value={city} />)}
      </datalist>
      <datalist id="shipping-cities">
        {shippingCities.map(city => <option key={city} value={city} />)}
      </datalist>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-white/90 backdrop-blur-md z-10 py-1.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/customers')} type="button" className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {isViewMode ? 'Customer Profile' : (isEditMode ? 'Edit Customer Account' : 'Add Customer Account')}
            </h1>
            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">Master Directory</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <fieldset disabled={isViewMode} className={isViewMode ? "opacity-90" : ""}>

        {/* Customer Type Selector */}
        <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-[13px] font-bold text-slate-800">Registration Type</h3>
            <p className="text-[11px] text-slate-500">Is this a registered business or an individual customer?</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleChange('customer_type', 'business')}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.customer_type === 'business' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'}`}
            >
              <Building2 className="w-3.5 h-3.5" /> Business
            </button>
            <button
              type="button"
              onClick={() => handleChange('customer_type', 'individual')}
              className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.customer_type === 'individual' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'}`}
            >
              <Users className="w-3.5 h-3.5" /> Individual
            </button>
          </div>
        </div>

        {/* Section 1: Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1 bg-indigo-100 rounded-md"><UserCircle className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Basic Details</h2>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>Full Name *</label>
              <input type="text" required value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="e.g. John Doe" className={inputClass} />
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
          </div>
        </div>

        {/* Section 3 & 4: Business Details */}
        {formData.customer_type === 'business' && (
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <div className="p-1 bg-indigo-100 rounded-md"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Business & Contact Details</h2>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Shop Name *</label>
                <input type="text" required value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} placeholder="e.g. Acme Corp Pvt Ltd" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Business Type</label>
                <input type="text" value={formData.business_type} onChange={e => handleChange('business_type', e.target.value)} placeholder="e.g. Retailer" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>GST Number</label>
                <input type="text" value={formData.gst_number} onChange={e => handleChange('gst_number', e.target.value)} placeholder="GSTIN" className={inputClass} />
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
          <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Billing */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded w-fit uppercase tracking-wider">Billing Address</h3>
              <div>
                <label className={labelClass}>Full Address *</label>
                <textarea required rows="2" value={formData.billing_address.address} onChange={e => handleAddressChange('billing_address', 'address', e.target.value)} placeholder="Street address..." className={inputClass}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>State *</label>
                  <input list="india-states" type="text" required value={formData.billing_address.state} onChange={e => handleAddressChange('billing_address', 'state', e.target.value)} placeholder="Search State..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <input list="billing-cities" type="text" required value={formData.billing_address.city} onChange={e => handleAddressChange('billing_address', 'city', e.target.value)} placeholder="Search City..." className={inputClass} />
                </div>
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
                    <label className={labelClass}>State *</label>
                    <input list="india-states" type="text" required value={formData.shipping_address.state} onChange={e => handleAddressChange('shipping_address', 'state', e.target.value)} placeholder="Search State..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>City *</label>
                    <input list="shipping-cities" type="text" required value={formData.shipping_address.city} onChange={e => handleAddressChange('shipping_address', 'city', e.target.value)} placeholder="Search City..." className={inputClass} />
                  </div>
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
          {/* Section 6 & 7: Categorization & Assignment */}
          {hasAssignmentPermission && (
            <div className={`${cardClass} flex flex-col`}>
              <div className={cardHeaderClass}>
                <div className="p-1 bg-indigo-100 rounded-md"><Layers className="w-4 h-4 text-indigo-600" /></div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Assignment</h2>
              </div>
              <div className="p-3 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 border-t border-slate-100 pt-3">
                  <div>
                    <label className={labelClass}>Branch / Hub</label>
                    <select value={formData.branch_id} onChange={e => handleChange('branch_id', e.target.value)} className={inputClass}>
                      <option value="">-- Select Branch --</option>
                      {branches.map(b => (
                        <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Assigned Employee</label>
                    <select value={formData.assigned_employee_id} onChange={e => handleChange('assigned_employee_id', e.target.value)} className={inputClass}>
                      <option value="">-- Select Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id || emp._id} value={emp.id || emp._id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar (Fixed Bottom) */}
        {!isViewMode && (
          <div className="fixed bottom-0 left-0 right-0 sm:left-64 p-2 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-end gap-2 z-50">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded border border-slate-200 font-bold text-[11px] text-slate-600 hover:bg-slate-50 bg-white shadow-sm transition-all"
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
        )}
        </fieldset>
      </form >
    </div >
  );
}
