import React from 'react';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function StockInventoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const stockItems = [
    { code: 'GR-001', name: 'Sonamasuri Raw Rice (26kg)', category: 'Rice Bags', stock: '840 Bags', reorder: '200 Bags', rate: '₹1,350', warehouse: 'Godown A' },
    { code: 'GR-002', name: 'Sonamasuri Steam Rice (26kg)', category: 'Rice Bags', stock: '420 Bags', reorder: '150 Bags', rate: '₹1,450', warehouse: 'Godown A' },
    { code: 'GR-003', name: 'Basmati Special Long Grain', category: 'Premium Grain', stock: '35 Quintals', reorder: '50 Quintals', rate: '₹7,200 / Q', warehouse: 'Godown B' },
    { code: 'GR-004', name: 'Whole Wheat Grade-A', category: 'Wheat', stock: '1,200 Bags', reorder: '300 Bags', rate: '₹1,850', warehouse: 'Godown C' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stock &amp; Inventory Management</h1>
            <p className="text-xs text-slate-500">Live grain quantities across Sadapoorna godowns</p>
          </div>
        </div>
        <button onClick={() => showToast('Stock Inward Entry opened')} className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" /> Inward Stock Receipt
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Wholesale Rate</th>
                <th className="p-4">Godown</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stockItems.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.code}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 font-bold text-teal-600">{item.stock}</td>
                  <td className="p-4 font-bold text-slate-900">{item.rate}</td>
                  <td className="p-4 text-slate-600">{item.warehouse}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => showToast(`Edited stock for ${item.code}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
