import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, CheckCircle2, XCircle, Search, Filter, Eye, X, FileText, Building2, ShoppingCart, IndianRupee, Handshake, Users, Info, Calendar } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function PurchaseOrdersDirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [vendorsMap, setVendorsMap] = useState({});
  const [warehousesMap, setWarehousesMap] = useState({});

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const [vRes, wRes] = await Promise.all([
          fetch('/vendors/v1', { headers }).catch(() => null),
          fetch('/warehouses/get', { headers }).catch(() => null)
        ]);
        
        if (vRes && vRes.ok) {
          const vData = await vRes.json();
          if (vData.data) {
            const vMap = {};
            vData.data.forEach(v => {
              vMap[v.id || v._id] = v.business_name || v.name || 'Unnamed Vendor';
            });
            setVendorsMap(vMap);
          }
        }
        
        if (wRes && wRes.ok) {
          const wData = await wRes.json();
          if (wData.data) {
            const wMap = {};
            wData.data.forEach(w => {
              wMap[w.id || w._id] = w.name;
            });
            setWarehousesMap(wMap);
          }
        }
      } catch (err) {
        console.error("Failed to fetch references", err);
      }
    };
    fetchReferences();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let url = '/orders/v1?type=purchase&limit=50';
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch purchase orders", err);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/orders/status/v1/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
        fetchOrders();
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error("Status update error", error);
      showToast("Network error occurred");
    }
  };

  const handleToggleActive = async (order, activate) => {
    const isConfirmed = window.confirm(`Are you sure you want to ${activate ? 'activate' : 'deactivate'} this purchase order?`);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/orders/record-status/v1/${order.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ record_status: activate ? 'active' : 'inactive' })
      });
      if (res.ok) {
        showToast(`Order ${activate ? 'activated' : 'deactivated'}`);
        fetchOrders();
      } else {
        showToast('Failed to update record status');
      }
    } catch (error) {
      showToast('Network error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Confirmed': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Ready to Pick Up': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Out for Delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
            <p className="text-xs text-slate-500">Manage orders, inventory intake, and vendor purchases</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-purchase-order')}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by invoice number or notes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="relative w-full sm:w-auto min-w-[150px]">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Ready to Pick Up">Ready to Pick Up</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No purchase orders found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0"></div>
              <div className="w-32 shrink-0">Invoice # / Date</div>
              <div className="w-48 shrink-0">Entities</div>
              <div className="w-32 shrink-0">Status</div>
              <div className="flex-1 min-w-[120px]">Value & Items</div>
              <div className="w-32 shrink-0 text-right">Actions</div>
            </div>
            
            {orders.map((order) => (
              <div key={order.id} className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl bg-white border ${order.record_status === 'inactive' ? 'border-rose-100 bg-rose-50/20 opacity-75' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all text-xs`}>
                
                {/* Mobile Top Row / Desktop Left side */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Icon */}
                  <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">
                    <ShoppingCart className="w-5 h-5 lg:w-4 lg:h-4" />
                  </div>
                  
                  {/* Invoice & Date */}
                  <div className="flex-1 min-w-0 lg:w-32 lg:shrink-0 lg:flex-none">
                    <div className="font-bold text-slate-900 truncate text-sm lg:text-xs">
                      {order.invoice_no}
                    </div>
                    <div className="text-slate-500 font-medium truncate mt-0.5 text-[10px]">
                      {formatDate(order.invoice_date)}
                    </div>
                  </div>

                  {/* Mobile Status */}
                  <div className="lg:hidden shrink-0">
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Desktop Only Vendor & Warehouse */}
                <div className="hidden lg:block w-48 shrink-0 text-slate-700 font-bold truncate">
                  <div title="Vendor" className="truncate text-xs text-slate-800">{order.vendor_id ? (vendorsMap[order.vendor_id] || `V: ${order.vendor_id.substring(0,8)}...`) : 'No Vendor'}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium flex items-center gap-1"><Building2 className="w-3 h-3"/> {order.warehouse_id ? (warehousesMap[order.warehouse_id] || `W: ${order.warehouse_id.substring(0,8)}...`) : 'No Warehouse'}</div>
                </div>

                <div className="hidden lg:block w-32 shrink-0">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                {/* Mobile Details Row / Desktop Middle */}
                <div className="flex items-center justify-between lg:justify-start lg:contents w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <div className="flex items-center gap-4 lg:gap-3 lg:contents w-full">
                    {/* Value & Items */}
                    <div className="flex-1 lg:min-w-[120px] truncate text-slate-700 font-black text-sm lg:text-xs">
                      ₹{order.grand_total?.toLocaleString()}
                      <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3"/> {order.items?.length || 0} line items
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-auto lg:w-32 shrink-0 flex items-center justify-end gap-1">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-md bg-sky-50 border border-sky-100 text-sky-600 hover:bg-sky-100 transition-colors"
                      title="View Order"
                    >
                      <Eye className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                    </button>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                      <button 
                        onClick={() => navigate(`/edit-purchase-order/${order.id}`)}
                        className="p-1.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-colors"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleActive(order, order.record_status === 'inactive')}
                      className={`p-1.5 rounded-md border transition-colors ${order.record_status === 'active' ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'}`}
                      title={order.record_status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {order.record_status === 'active' ? <XCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5" /> : <CheckCircle2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl ring-1 ring-white/10 overflow-hidden relative">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50 relative shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-200/50">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    {selectedOrder.invoice_no}
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date: {formatDate(selectedOrder.invoice_date)} 
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors bg-white shadow-sm border border-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar space-y-6">
              
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <Handshake className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor / Supplier</div>
                    <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">{selectedOrder.vendor_id ? (vendorsMap[selectedOrder.vendor_id] || selectedOrder.vendor_id) : 'N/A'}</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <Building2 className="w-8 h-8 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warehouse</div>
                    <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">{selectedOrder.warehouse_id ? (warehousesMap[selectedOrder.warehouse_id] || selectedOrder.warehouse_id) : 'N/A'}</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <ShoppingCart className="w-8 h-8 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Items</div>
                    <div className="text-sm font-black text-slate-800 leading-tight mt-0.5">{selectedOrder.items?.length || 0}</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <IndianRupee className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</div>
                    <div className="text-sm font-black text-emerald-600 leading-tight mt-0.5">₹{selectedOrder.grand_total?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Order Items</h3>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2 py-0.5 rounded bg-white">
                    GST: {selectedOrder.gst_type}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Product / Variant</th>
                        <th className="px-5 py-3 text-right">Qty</th>
                        <th className="px-5 py-3 text-right">Rate</th>
                        <th className="px-5 py-3 text-right">Taxable</th>
                        <th className="px-5 py-3 text-right">GST</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">{item.product_name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.variant_name} ({item.sku})</div>
                            {item.investors?.length > 0 && (
                              <div className="mt-2 pl-2 border-l-2 border-indigo-200 space-y-1">
                                <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">Investor Allocations:</div>
                                {item.investors.map((inv, iIdx) => (
                                  <div key={iIdx} className="text-[10px] text-slate-600 flex justify-between w-32">
                                    <span className="font-mono">User: {inv.investor_id.substring(0,6)}</span>
                                    <span className="font-bold">{inv.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right font-bold">{item.quantity}</td>
                          <td className="px-5 py-4 text-right">₹{item.rate}</td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-700">₹{item.taxable_amount}</td>
                          <td className="px-5 py-4 text-right text-slate-500">
                            {item.gst_percent}% (₹{item.gst_amount})
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-800">
                            ₹{item.total_amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Financial Totals */}
                <div className="bg-slate-50 p-5 border-t border-slate-200">
                  <div className="flex flex-col items-end gap-2 text-xs">
                    <div className="flex justify-between w-48 text-slate-600">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-bold">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-48 text-slate-600">
                      <span className="font-medium">Total GST</span>
                      <span className="font-bold">₹{selectedOrder.total_gst?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-48 text-slate-600">
                      <span className="font-medium">Other Charges</span>
                      <span className="font-bold">₹{selectedOrder.other_charges?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-48 text-rose-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">- ₹{selectedOrder.discount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-48 text-emerald-700 pt-2 border-t border-slate-200">
                      <span className="font-black uppercase tracking-wider text-[10px] mt-0.5">Grand Total</span>
                      <span className="font-black text-lg leading-none">₹{selectedOrder.grand_total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update & Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Quick Status Update */}
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="w-4 h-4 text-indigo-500" /> Update Order Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Confirmed', 'Ready to Pick Up', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                        <button
                          key={status}
                          disabled={selectedOrder.status === status || selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                          onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            selectedOrder.status === status 
                              ? getStatusColor(status) 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {['Delivered', 'Cancelled'].includes(selectedOrder.status) && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-medium">
                      This order is {selectedOrder.status}. The status cannot be changed further.
                    </div>
                  )}
                </div>

                {/* Notes & Terms */}
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Order Notes</h4>
                      <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100 min-h-[60px]">
                        {selectedOrder.notes || 'No additional notes.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
