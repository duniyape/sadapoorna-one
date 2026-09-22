import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderStatus from './OrderStatus';

const OrderCard = ({ order }) => {
  // Navigate to order details using the internal MongoDB ID
  const targetUrl = `/order/${order.internalId || order.id.replace('#', '')}`;


  return (
    <Link 
      to={targetUrl}
      className="flex flex-col py-3.5 border-b border-gray-100 last:border-0 hover:bg-white/50 cursor-pointer transition-colors px-1 block"
    >
      {/* Top Row: Order ID, Items, Amount */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span className="font-bold text-[13px] sm:text-[14px] text-[#17232D] leading-none mb-1">
            {order.displayId || order.id}
          </span>
          <span className="text-[11px] sm:text-xs text-[#59636D]">
            {order.date}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-right">
          <span className="text-[12px] sm:text-[13px] text-[#59636D] font-medium">
            {order.items}
          </span>
          <span className="font-bold text-[14px] sm:text-[15px] text-[#17232D]">
            {order.amount}
          </span>
        </div>
      </div>

      {/* Bottom Row: Statuses and Arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {order.payment === 'PAID' && (
            <span className="bg-[#EAF6E5] text-[#16803C] text-[9.5px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {order.payment}
            </span>
          )}
          <OrderStatus status={order.status} />
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#E52323]" strokeWidth={2} />
      </div>
    </Link>
  );
};

export default OrderCard;
