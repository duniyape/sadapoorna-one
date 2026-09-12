import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Building2, Briefcase, Layers, Clock, User } from 'lucide-react';

export default function CustomerProfileTab() {
  const { customer, branches, employees, isBiz } = useOutletContext();

  const getBranchName = (bid) => {
    if (!bid) return 'N/A';
    return branches.find(b => b.id === bid || b._id === bid)?.name || bid;
  };

  const getEmpName = (eid) => {
    if (!eid) return 'N/A';
    return employees.find(e => e.id === eid || e._id === eid)?.name || eid;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left col */}
      <div className="lg:col-span-2 space-y-4">

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-indigo-600" /> Address Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 pl-3 border-l-2 border-indigo-100">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Billing Address</h3>
              {customer.billing_address?.address ? (
                <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-900">{customer.billing_address.address}</p>
                  <p>{customer.billing_address.city}, {customer.billing_address.state}</p>
                  <p>PIN: {customer.billing_address.pincode}</p>
                </div>
              ) : <p className="text-[11px] text-slate-400">No billing address provided.</p>}
            </div>
            <div className="space-y-2 pl-3 border-l-2 border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Shipping Address</h3>
                {customer.sameAsBilling && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Same as Billing</span>
                )}
              </div>
              {customer.shipping_address?.address ? (
                <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-900">{customer.shipping_address.address}</p>
                  <p>{customer.shipping_address.city}, {customer.shipping_address.state}</p>
                  <p>PIN: {customer.shipping_address.pincode}</p>
                </div>
              ) : <p className="text-[11px] text-slate-400">No shipping address provided.</p>}
            </div>
          </div>
        </div>

        {/* Business info */}
        {isBiz && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Business Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[['Company Name', customer.company_name], ['Business Type', customer.business_type]].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">{k}</p>
                  <p className="text-xs font-bold text-slate-900">{v || 'N/A'}</p>
                </div>
              ))}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <p className="text-[10px] font-bold text-slate-500 mb-0.5">GST Number</p>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{customer.gst_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right col */}
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
              <p className="text-[11px] font-bold text-slate-800">{getBranchName(customer.branch_id)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Employee</p>
              <p className="text-[11px] font-bold text-slate-800">{getEmpName(customer.assigned_employee_id)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
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
  );
}
