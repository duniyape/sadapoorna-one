import React, { useState, useEffect } from 'react';
import { ClipboardList, FileText, ChevronRight, Headphones, Phone } from 'lucide-react';
import OrderCard from './OrderCard';
import { useCustomerProfile } from '../../context/CustomerProfileContext';
import { apiFetch, ENDPOINTS } from '../../utils/api';

const ProfileOrdersTab = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useCustomerProfile();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchOrders = async () => {
      setLoading(true);
      const customerId = profile.mongo_id || profile._id || profile.id;
      let res = await apiFetch(ENDPOINTS.ORDERS_LIST);
      if (!res.ok || !res.data) {
        res = await apiFetch(`/orders/v1?page=1&limit=50&customer_id=${customerId}`);
      }
      
      let o = [];
      if (res.data) {
        if (Array.isArray(res.data.data)) o = res.data.data;
        else if (Array.isArray(res.data)) o = res.data;
      }
      
      const mapped = o.map(ord => {
        const oid = ord.id || ord._id;
        const amt = ord.grand_total || ord.total || ord.items?.reduce((a, c) => a + c.quantity * c.rate, 0) || 0;
        return {
          id: `#${ord.order_no || oid.slice(-6)}`,
          displayId: `#${ord.order_no || oid.slice(-6)}`,
          internalId: oid,
          date: new Date(ord.created_at || ord.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: `${ord.items?.length || 0} item${ord.items?.length > 1 ? 's' : ''}`,
          amount: `₹${amt.toLocaleString()}`,
          payment: ord.payment_status ? ord.payment_status.replace(/_/g, ' ') : "UNPAID",
          status: ord.status ? ord.status.replace(/_/g, ' ') : "Pending"
        };
      });
      
      setOrders(mapped);
      setLoading(false);
    };
    fetchOrders();
  }, [profile]);

  const visibleOrders = isExpanded ? orders : orders.slice(0, 4);

  return (
    <div className="flex flex-col gap-4 mt-4 animate-fade-in">
      
      {/* Order History Card */}
      <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] overflow-hidden p-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 shrink-0">
            <ClipboardList className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-[15px] sm:text-base text-[#17232D] leading-tight">Order History</h3>
            <p className="text-[10px] text-[#59636D] mt-0.5">All orders placed by this customer</p>
          </div>
        </div>

        {/* Order List */}
        <div className="flex flex-col">
          {loading ? (
            <div className="p-6 text-center text-xs text-[#59636D] font-medium">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#59636D] font-medium">No orders found.</div>
          ) : (
            visibleOrders.map((order, idx) => (
              <OrderCard key={idx} order={order} />
            ))
          )}
        </div>
      </div>

      {/* View More Orders */}
      <div 
        className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex items-center justify-between cursor-pointer hover:bg-white transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFF0EF] border border-[#E52323]/10 shrink-0">
            <FileText className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-sm text-[#17232D] leading-tight">
              {isExpanded ? 'View Less Orders' : 'View More Orders'}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-[#59636D] mt-0.5">
              {isExpanded ? 'Hide past orders' : 'See all past orders'}
            </p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-[#E52323] transition-transform ${isExpanded ? 'rotate-90' : ''}`} strokeWidth={2} />
      </div>

      {/* Need Help / Support Card */}
      <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[20px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-100 shrink-0 mt-0.5 sm:mt-0">
            <Headphones className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-sm text-[#17232D] leading-tight">Need Help with an Order?</h4>
            <p className="text-[10px] sm:text-[11px] text-[#59636D] mt-0.5">Contact our sales team for support.</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 border-[1.5px] border-[#E52323] text-[#E52323] bg-white rounded-full px-5 py-2 hover:bg-[#FFF0EF] transition-colors w-full sm:w-auto justify-center font-bold text-xs">
          <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
          Contact Sales
        </button>
      </div>

    </div>
  );
};

export default ProfileOrdersTab;
