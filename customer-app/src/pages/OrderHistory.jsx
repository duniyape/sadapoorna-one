import React, { useState, useEffect } from 'react';
import { Package, Download, ChevronRight, CheckCircle2, Truck, Clock, PackageCheck, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerProfile } from '../context/CustomerProfileContext';
import { apiFetch, ENDPOINTS } from '../utils/api';

const OrderHistory = () => {
  const { profile } = useCustomerProfile();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
      case 'OUT_FOR_DELIVERY': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getTrackerIcon = (status) => {
    switch(status) {
      case 'PLACED': return <Package className="w-5 h-5" />;
      case 'PROCESSING': return <Clock className="w-5 h-5" />;
      case 'OUT_FOR_DELIVERY': return <Truck className="w-5 h-5" />;
      case 'DELIVERED': return <PackageCheck className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    if (!profile) return;
    const fetchOrders = async () => {
      setLoading(true);
      const customerId = profile.mongo_id || profile._id || profile.id;
      // Try specific customer API first, fallback to generic API
      let res = await apiFetch(ENDPOINTS.ORDERS_LIST);
      if (!res.ok || !res.data) {
        res = await apiFetch(`/orders/v1?page=1&limit=50&customer_id=${customerId}`);
      }
      
      let o = [];
      if (res.data) {
        if (Array.isArray(res.data.data)) o = res.data.data;
        else if (Array.isArray(res.data)) o = res.data;
      }
      setOrders(o);
      setLoading(false);
    };
    fetchOrders();
  }, [profile]);

  const handleSelectOrder = async (ord) => {
    const oid = ord.id || ord._id;
    setSelectedOrder({ _loading: true, id: oid, order_no: ord.order_no || oid.slice(-6) });
    setDetailsLoading(true);
    
    // Fetch full order details
    let res = await apiFetch(`/orders/v1/${oid}`);
    if (!res.ok) {
       res = await apiFetch(ENDPOINTS.ORDER_DETAIL(oid));
    }
    
    if (res.ok && res.data) {
      setSelectedOrder(res.data.data || res.data);
    }
    setDetailsLoading(false);
  };

  const handleDownloadBill = async (e) => {
    e.stopPropagation();
    if (!selectedOrder) return;
    const oid = selectedOrder.id || selectedOrder._id;
    setIsDownloading(true);
    try {
      const res = await fetch(`/orders/get-bill/v1/${oid}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      alert("Error fetching invoice PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Order List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-10 text-center text-slate-400 font-medium">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium">No orders found.</div>
          ) : orders.map(order => {
            const oid = order.id || order._id;
            const amt = order.grand_total || order.total || order.items?.reduce((a, c) => a + c.quantity * c.rate, 0) || 0;
            const dateStr = new Date(order.created_at || order.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            const isSelected = selectedOrder?.id === oid || selectedOrder?._id === oid;
            
            return (
              <div 
                key={oid} 
                onClick={() => handleSelectOrder(order)}
                className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all ${
                  isSelected ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-200 shadow-sm hover:border-indigo-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">#{order.order_no || oid.slice(-6)}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{dateStr}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${getStatusColor(order.status)}`}>
                    {order.status ? order.status.replace(/_/g, ' ') : 'PENDING'}
                  </span>
                </div>
                
                <div className="flex items-end justify-between border-t border-slate-100 pt-4 mt-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Order Total</p>
                    <p className="font-black text-slate-900 text-xl">₹{amt.toLocaleString()}</p>
                  </div>
                  <div className="text-indigo-600 font-bold text-sm flex items-center gap-1 group">
                    View Tracker <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Details & Tracker */}
        <div className="lg:sticky lg:top-24 h-fit">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">#{selectedOrder.order_no || selectedOrder._id?.slice(-6) || selectedOrder.id?.slice(-6)}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Loading...'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert('Reorder functionality coming soon...')}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-indigo-200"
                    >
                      <ShoppingCart className="w-4 h-4" /> Reorder
                    </button>
                    {selectedOrder.invoice_no && (
                      <button onClick={handleDownloadBill} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors hidden sm:flex disabled:opacity-50">
                        {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Bill
                      </button>
                    )}
                  </div>
                </div>

                {detailsLoading ? (
                   <div className="p-10 text-center text-slate-400 font-medium flex justify-center items-center gap-2">
                     <RefreshCw className="w-5 h-5 animate-spin" /> Loading details...
                   </div>
                ) : (
                  <>

                {/* Vertical Tracker */}
                <div className="mb-8 pl-2">
                  <h3 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Tracking History</h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {(selectedOrder.tracking && selectedOrder.tracking.length > 0) ? selectedOrder.tracking.map((step, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm bg-indigo-600 text-white`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-indigo-50 border-indigo-100`}>
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className={`font-bold text-sm text-indigo-900`}>
                              {step.status ? step.status.replace(/_/g, ' ') : 'Update'}
                            </div>
                          </div>
                          {step.timestamp && <div className={`text-xs font-medium text-indigo-600`}>{new Date(step.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                          {step.note && <div className="text-xs text-indigo-700/70 mt-1">{step.note}</div>}
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-slate-500 ml-12">No tracking updates yet.</div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Items Included</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => {
                      const rate = item.rate || 0;
                      const qty = item.quantity || item.qty || 0;
                      const total = item.total_amount || (rate * qty);
                      
                      return (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.product_name || item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.variant_name} {item.sku ? `• ${item.sku}` : ''}</p>
                            <p className="text-xs text-slate-600 font-medium mt-1">Qty: {qty} × ₹{rate.toLocaleString()}</p>
                          </div>
                          <p className="font-black text-slate-900">₹{total.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-50/50 rounded-3xl p-10 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <Package className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Select an order from the list to view its delivery tracker and download bills.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
