import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function AddCustomerPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    gstin: '',
    address: '',
    beat: 'Beat 1 - Central Market',
    creditLimit: '150000',
    creditPeriodDays: '30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`Customer account '${formData.name}' created successfully!`);
    navigate('/customers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Customer Account</h1>
            <p className="text-xs text-slate-500">Register new wholesale trader or retail shopkeeper</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Business / Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Laxmi Supermarket"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proprietor / Owner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Patel"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="29AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Beat / Sales Territory</label>
              <select
                value={formData.beat}
                onChange={(e) => setFormData({ ...formData, beat: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:outline-none bg-white"
              >
                <option>Beat 1 - Central Market</option>
                <option>Beat 2 - North Wholesale Hub</option>
                <option>Beat 3 - South Retail Zone</option>
                <option>Beat 4 - Highway Outlets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Credit Limit (₹)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Commercial Address</label>
            <textarea
              rows="3"
              placeholder="Shop No. 42, Grain Market Main Road..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-md"
            >
              Register Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
