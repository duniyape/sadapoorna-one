import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, ENDPOINTS } from '../utils/api';
import OrderHeader from '../components/orders/OrderHeader';
import OrderSummary from '../components/orders/OrderSummary';
import DeliveryDetails from '../components/orders/DeliveryDetails';
import PaymentSummary from '../components/orders/PaymentSummary';
import OrderItems from '../components/orders/OrderItems';
import OrderHistoryTimeline from '../components/orders/OrderHistoryTimeline';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      let res = await apiFetch(`/orders/v1/${id}`);
      if (!res.ok) {
        res = await apiFetch(ENDPOINTS.ORDER_DETAIL(id));
      }
      if (res.ok && res.data) {
        setOrder(res.data.data || res.data);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-slate-500 gap-4">
        Order not found
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-indigo-600 text-white rounded">Go Back</button>
      </div>
    );
  }

  // Map API data to component props
  const oid = order.id || order._id;
  const mappedOrder = {
    id: `#${order.order_no || oid.slice(-6)}`,
    internalId: oid,
    date: new Date(order.created_at || order.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: order.status ? order.status.replace(/_/g, ' ') : 'PENDING',
    invoice_no: order.invoice_no,
    delivery: {
      customer: order.customer?.name || "Customer",
      phone: order.customer?.mobile || "N/A",
      address: order.customer?.shipping_address ? `${order.customer.shipping_address.address}, ${order.customer.shipping_address.city}` : "N/A",
      vehicle: order.vehicle ? `${order.vehicle.vehicle_number} (${order.vehicle.model})` : null
    },
    payment: {
      grandTotal: `₹${(order.grand_total || order.total || order.items?.reduce((a,c) => a + (c.quantity*c.rate), 0) || 0).toLocaleString()}`,
      paidAmount: `₹${(order.paid_amount || 0).toLocaleString()}`,
      pendingDue: `₹${(order.pending_amount || 0).toLocaleString()}`,
      status: order.payment_status ? order.payment_status.replace(/_/g, ' ') : "UNPAID"
    },
    items: (order.items || []).map(item => {
      const rate = item.rate || 0;
      const qty = item.quantity || item.qty || 0;
      return {
        name: item.product_name || item.name,
        type: `${item.variant_name || ''} ${item.sku ? `• ${item.sku}` : ''}`,
        rate: `₹${rate.toLocaleString()}`,
        quantity: qty,
        total: `₹${(item.total_amount || (rate * qty)).toLocaleString()}`
      };
    }),
    history: (order.tracking || order.history || []).map(step => ({
      status: step.status ? step.status.replace(/_/g, ' ') : 'Update',
      description: step.note || '',
      date: step.timestamp ? new Date(step.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      by: step.updated_by_name || 'System'
    }))
  };
  return (
    <div 
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: `radial-gradient(
          circle at 50% 0%,
          rgba(229, 35, 35, 0.08) 0%,
          rgba(229, 35, 35, 0.04) 20%,
          rgba(229, 35, 35, 0) 45%
        ),
        radial-gradient(
          circle at 0% 45%,
          rgba(239, 32, 38, 0.03) 0%,
          rgba(239, 32, 38, 0) 35%
        ),
        radial-gradient(
          circle at 100% 70%,
          rgba(229, 35, 35, 0.03) 0%,
          rgba(229, 35, 35, 0) 35%
        ),
        #FFF9F7`
      }}
    >
      {/* Global Background Leaves Watermark */}
      <div className="fixed top-0 left-0 w-full h-[300px] pointer-events-none z-0 overflow-hidden">
        {/* Top Left Leaf Cluster */}
        <svg className="absolute -top-16 -left-16 w-64 h-64 text-[#E52323] opacity-[0.06] transform rotate-45" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
        <svg className="absolute top-10 -left-10 w-48 h-48 text-[#E52323] opacity-[0.04] transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
      </div>

      <div className="max-w-[430px] mx-auto px-4 sm:px-5 pb-12 pt-2 relative z-10 animate-fade-in">
        
        {/* Header */}
        <OrderHeader orderId={mappedOrder.internalId} invoiceNo={mappedOrder.invoice_no} />

        <div className="flex flex-col gap-4 mt-2">
          {/* Order Summary & Status Timeline */}
          <OrderSummary 
            orderId={mappedOrder.id}
            internalId={mappedOrder.internalId}
            date={mappedOrder.date}
            status={mappedOrder.status}
          />

          {/* Delivery Details (NO MAP) */}
          <DeliveryDetails {...mappedOrder.delivery} />

          {/* Accounting & Payment */}
          <PaymentSummary {...mappedOrder.payment} />

          {/* Order Items (NO IMAGES) */}
          <OrderItems items={mappedOrder.items} />

          {/* Order History Timeline */}
          {mappedOrder.history && mappedOrder.history.length > 0 && (
            <OrderHistoryTimeline history={mappedOrder.history} />
          )}
        </div>
        
      </div>
    </div>
  );
};

export default OrderDetailsPage;
