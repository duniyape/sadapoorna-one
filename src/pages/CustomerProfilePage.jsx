import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Building2, User, Clock, Layers, Briefcase } from 'lucide-react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const [branchRes, empRes] = await Promise.all([
          fetch('/branches/v1', { headers }).catch(() => null),
          fetch('/users/get', { headers }).catch(() => null)
        ]);
        if (branchRes && branchRes.ok) {
          const data = await branchRes.json();
          setBranches(data.data || data || []);
        }
        if (empRes && empRes.ok) {
          const data = await empRes.json();
          setEmployees(data.data || data.users || data || []);
        }
      } catch (e) {
        console.error("Failed to fetch metadata", e);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const res = await fetch(`/customer/${id}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            setCustomer(json.data);
          }
        } else {
          showToast("Failed to load customer profile");
        }
      } catch (err) {
        console.error("Failed to fetch customer profile", err);
        showToast("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id, showToast]);

  if (isLoading) {
    return <div className="p-6 text-center font-bold text-slate-500">Loading Profile...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-center font-bold text-slate-500">Customer not found.</div>;
  }

  const isBusiness = customer.customer_type === 'business';
  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : '?';

  const getBranchName = (id) => {
    if (!id) return 'N/A';
    const branch = branches.find(b => (b.id === id || b._id === id));
    return branch ? branch.name : id;
  };

  const getEmployeeName = (id) => {
    if (!id) return 'N/A';
    const emp = employees.find(e => (e.id === id || e._id === id));
    return emp ? emp.name : id;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-10">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/customers')} className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={() => navigate(`/edit-customer/${id}`)}
          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit Profile
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Gradient bg accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl rounded-full -z-10 translate-x-1/4 -translate-y-1/4"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 relative z-10">
          <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md">
            {initial}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isBusiness && customer.company_name ? customer.company_name : customer.name}
              </h1>
              <span className={`w-fit mx-auto md:mx-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {customer.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5">
              {isBusiness ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {isBusiness ? `Business Account • POC: ${customer.name}` : 'Individual Account'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              {customer.mobile && (
                <a href={`tel:${customer.mobile}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" /> {customer.mobile}
                </a>
              )}
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" /> {customer.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address Information */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
              <MapPin className="w-4 h-4 text-indigo-600" /> Address Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5 relative">
                <div className="absolute top-0 bottom-0 -left-5 w-1 bg-indigo-100 rounded-r-md"></div>
                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Billing Address</h3>
                {customer.billing_address?.address ? (
                  <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                    <p className="text-slate-900 font-bold">{customer.billing_address.address}</p>
                    <p>{customer.billing_address.city}, {customer.billing_address.state}</p>
                    <p>PIN: {customer.billing_address.pincode}</p>
                  </div>
                ) : <p className="text-[11px] text-slate-400">No billing address provided.</p>}
              </div>

              <div className="space-y-2.5 relative">
                <div className="absolute top-0 bottom-0 -left-5 w-1 bg-emerald-100 rounded-r-md"></div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Shipping Address</h3>
                  {customer.sameAsBilling && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Same as Billing</span>
                  )}
                </div>
                {customer.shipping_address?.address ? (
                  <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                    <p className="text-slate-900 font-bold">{customer.shipping_address.address}</p>
                    <p>{customer.shipping_address.city}, {customer.shipping_address.state}</p>
                    <p>PIN: {customer.shipping_address.pincode}</p>
                  </div>
                ) : <p className="text-[11px] text-slate-400">No shipping address provided.</p>}
              </div>
            </div>
          </div>

          {/* Business Information (If Business) */}
          {isBusiness && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Business Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">Company Name</p>
                  <p className="text-xs font-bold text-slate-900">{customer.company_name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">Business Type</p>
                  <p className="text-xs font-bold text-slate-900">{customer.business_type || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">GST Number</p>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{customer.gst_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
              <Layers className="w-4 h-4 text-indigo-600" /> Account Assignment
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">System ID</p>
                <p className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-mono w-fit">{customer.id}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Branch / Hub</p>
                <p className="text-[11px] font-bold text-slate-800 truncate" title={getBranchName(customer.branch_id)}>
                  {getBranchName(customer.branch_id)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Employee</p>
                <p className="text-[11px] font-bold text-slate-800 truncate" title={getEmployeeName(customer.assigned_employee_id)}>
                  {getEmployeeName(customer.assigned_employee_id)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
             {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            
            <h2 className="text-[13px] font-bold flex items-center gap-1.5 mb-4 text-white/90">
              <Clock className="w-4 h-4" /> Audit Log
            </h2>
            <div className="space-y-3 relative z-10">
              <div>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Created At</p>
                <p className="text-[11px] font-medium">{customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              {customer.updated_at && (
                <div>
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Last Modified</p>
                  <p className="text-[11px] font-medium">{new Date(customer.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
