import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Truck, Receipt, Tag, ShieldCheck, MapPin, CheckCircle2, Package, IndianRupee, Download } from 'lucide-react';
import OrderPipeline from './OrderPipeline';
import { authHdr, fmt, fmtMoney, StatusBadge } from '../utils/customerHelpers';

export default function ViewOrderModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadBill = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/orders/get-bill/v1/${orderId}/pdf`, {
        headers: authHdr()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || "Failed to fetch invoice");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert(error.message || "Error fetching invoice PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/orders/v1/${orderId}`, { headers: authHdr() });
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        } else {
          setError(json.message || "Failed to load order details");
        }
      } catch (err) {
        setError("Network error fetching order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:w-[800px] bg-slate-50 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              Order {order?.order_no || order?.invoice_no || orderId.slice(-6)}
              {order?.invoice_no && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                  Billed
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {order ? fmt(order.created_at) : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order?.invoice_no && (
              <button
                onClick={handleDownloadBill}
                disabled={isDownloading}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isDownloading ? <div className="w-3.5 h-3.5 border-2 border-indigo-700/30 border-t-indigo-700 rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download Bill
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-500 mt-4">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-6 rounded-2xl text-center font-bold">
              {error}
            </div>
          ) : (
            <>
              {/* Pipeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <OrderPipeline currentStatus={order.status} />
              </div>

              {/* 2-Col Layout: Info & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Info */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> Delivery Details
                  </h3>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-800">{order.customer?.name || 'Unknown'}</p>
                    {order.customer?.mobile && (
                      <p className="text-xs text-slate-600 mt-0.5">{order.customer.mobile}</p>
                    )}
                    {order.customer?.shipping_address && (
                      <div className="flex items-start gap-1 mt-2 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{order.customer.shipping_address.address}, {order.customer.shipping_address.city}</span>
                      </div>
                    )}
                  </div>
                  {order.vehicle && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Truck className="w-4 h-4 text-indigo-500" />
                      Vehicle: {order.vehicle.vehicle_number} ({order.vehicle.model})
                    </div>
                  )}
                </div>

                {/* Billing Summary */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Receipt className="w-3 h-3" /> Accounting & Payment
                  </h3>
                  <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-500">Grand Total</span>
                      <span className="text-base font-black text-slate-900">{fmtMoney(order.grand_total)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-emerald-600">Paid Amount</span>
                      <span className="text-xs font-bold text-emerald-700">{fmtMoney(order.paid_amount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-indigo-100 pt-1 mt-1">
                      <span className="text-xs font-semibold text-rose-600">Pending Due</span>
                      <span className="text-xs font-bold text-rose-700">{fmtMoney(order.pending_amount || 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-slate-500">Payment Status</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                      order.payment_status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      order.payment_status === 'PARTIALLY_PAID' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {order.payment_status?.replace(/_/g, ' ') || 'UNPAID'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Package className="w-4 h-4 text-sky-500" />
                  <h3 className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Order Items ({order.items?.length || 0})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2">Rate</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items?.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{item.product_name}</p>
                            <p className="text-[10px] text-slate-500">{item.variant_name} • {item.sku}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-600">{fmtMoney(item.rate)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{item.quantity}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900">
                            {fmtMoney(item.total_amount || (item.rate * item.quantity))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tracking History */}
              {order.tracking && order.tracking.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-4">
                    <CheckCircle2 className="w-3 h-3" /> Audit & Tracking
                  </h3>
                  <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-2">
                    {order.tracking.map((trk, i) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-white" />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{trk.status}</p>
                            <p className="text-[10px] text-slate-500">{trk.note}</p>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                            {fmt(trk.timestamp)}
                            {trk.updated_by_name && <span className="block sm:inline sm:ml-1 text-slate-300">• by {trk.updated_by_name}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
