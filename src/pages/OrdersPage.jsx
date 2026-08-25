import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Download, Eye, Check, X } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [ordersList, setOrdersList] = useState([
    { id: 'ORD-9821', customer: 'Apex Wholesale Traders', date: 'Today, 10:30 AM', items: '50 Bags Sonamasuri Rice (26kg)', total: '₹72,500', status: 'Confirmed', paid: 'Paid' },
    { id: 'ORD-9820', customer: 'Laxmi Supermarket', date: 'Today, 09:15 AM', items: '20 Quintals Basmati Special', total: '₹1,40,000', status: 'Pending', paid: 'Credit' },
    { id: 'ORD-9819', customer: 'Shree Balaji Kirana Store', date: 'Yesterday', items: '15 Bags Jeera Rice', total: '₹22,500', status: 'Out for Delivery', paid: 'Paid' },
    { id: 'ORD-9818', customer: 'Karnataka Grain Hub', date: 'Yesterday', items: '100 Bags Wheat Grade A', total: '₹1,85,000', status: 'Delivered', paid: 'Partially Paid' },
  ]);

  const handleStatusChange = async (orderId, newStatus) => {
    // Optimistically update the UI
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      const response = await fetch(`http://192.168.29.8:8000/orders/status/v1/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('API returned an error');
      }
      showToast(`Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('Status update failed:', error);
      showToast(`Failed to update ${orderId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders & Invoices</h1>
            <p className="text-xs text-slate-500">Live order processing and delivery status</p>
          </div>
        </div>
        <button
          onClick={() => showToast('New Order entry window triggered')}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Total Orders Today</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">28 Invoices</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Today's Order Value</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹4,20,000</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Pending Approval</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">3 Orders</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Dispatched</div>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">14 Vehicles</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>All Orders</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Pending</button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input type="text" placeholder="Search order ID or client..." className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Order Summary</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ordersList.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{ord.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{ord.customer}</td>
                  <td className="p-4 text-slate-600">{ord.items}</td>
                  <td className="p-4 font-bold text-slate-900">{ord.total}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ord.paid === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {ord.paid}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border
                        ${ord.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          ord.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          ord.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 flex items-center justify-end">
                    {ord.status === 'Pending' && (
                      <>
                        <button onClick={() => handleStatusChange(ord.id, 'Confirmed')} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600" title="Confirm">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStatusChange(ord.id, 'Cancelled')} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => showToast(`Printed invoice ${ord.id}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="Download Invoice">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => showToast(`Opened ${ord.id}`)} className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600" title="View Details">
                      <Eye className="w-4 h-4" />
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
