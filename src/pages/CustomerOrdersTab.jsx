import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ShoppingCart, Eye, Package, RefreshCw } from 'lucide-react';
import { authHdr, fmt, fmtMoney, Skeleton, StatusBadge } from '../utils/customerHelpers';
import ViewOrderModal from '../components/ViewOrderModal';

export default function CustomerOrdersTab() {
  const { id } = useOutletContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const hasFetched = useRef(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    hasFetched.current = true;
    try {
      const res = await fetch(`/orders/v1?customer_id=${id}&limit=50`, { headers: authHdr() });
      const json = res.ok ? await res.json() : {};
      let o = [];
      if (Array.isArray(json.data)) o = json.data;
      else if (json.data?.orders && Array.isArray(json.data.orders)) o = json.data.orders;
      else if (Array.isArray(json.orders)) o = json.orders;
      else if (Array.isArray(json)) o = json;
      setOrders(o);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!hasFetched.current) fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Order History</h2>
          {!loading && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
              {orders.length} orders
            </span>
          )}
        </div>
        <button
          onClick={() => { hasFetched.current = false; fetchOrders(); }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-8 space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="font-bold text-sm">No orders found for this customer.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  {['Order #', 'Date', 'Items', 'Amount', 'Billing', 'Payment', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(ord => {
                  const oid = ord.id || ord._id;
                  const amt = ord.grand_total || ord.total || ord.items?.reduce((a, c) => a + c.quantity * c.rate, 0) || 0;
                  return (
                    <tr key={oid} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-5 py-3 font-black text-slate-900">#{ord.order_no || ord.invoice_no || oid?.slice(-6)}</td>
                      <td className="px-5 py-3 text-slate-500 font-semibold">{fmt(ord.invoice_date || ord.created_at)}</td>
                      <td className="px-5 py-3 text-slate-600">{ord.items?.length || 0} items</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{fmtMoney(amt)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ord.invoice_no ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                          {ord.invoice_no ? 'Billed' : 'Unbilled'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {ord.payment_status ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ord.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ord.payment_status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            {ord.payment_status.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={ord.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedOrderId(oid)}
                          className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 opacity-60 group-hover:opacity-100 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3 p-4">
            {orders.map(ord => {
              const oid = ord.id || ord._id;
              const amt = ord.grand_total || ord.total || 0;
              return (
                <div 
                  key={oid} 
                  onClick={() => setSelectedOrderId(oid)}
                  className="bg-slate-50 rounded-xl p-3 border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-black text-slate-900 text-xs">#{ord.order_no || oid?.slice(-6)}</p>
                      <p className="text-[10px] text-slate-500">{fmt(ord.invoice_date || ord.created_at)}</p>
                    </div>
                    <StatusBadge status={ord.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-semibold">{ord.items?.length || 0} items</span>
                    <span className="font-black text-slate-900 text-sm">{fmtMoney(amt)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/60">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${ord.payment_status === 'PAID' ? 'text-emerald-600' : ord.payment_status === 'PARTIALLY_PAID' ? 'text-amber-600' : 'text-rose-600'}`}>
                      {ord.payment_status ? ord.payment_status.replace(/_/g, ' ') : 'UNPAID'}
                    </span>
                    {ord.pending_amount > 0 && <span className="text-[10px] font-bold text-rose-600">Pending: {fmtMoney(ord.pending_amount)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Full Order Details Modal */}
      <ViewOrderModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
    </div>
  );
}
