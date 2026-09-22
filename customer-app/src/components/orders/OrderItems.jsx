import React from 'react';
import { Package } from 'lucide-react';
import InfoSection from '../profile/InfoSection';

const OrderItems = ({ items }) => {
  return (
    <InfoSection 
      title={`Order Items (${items.length})`} 
      icon={Package}
    >
      <div className="flex flex-col">
        {/* Table Header (hidden on very small screens, but compact otherwise) */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <span className="text-[10px] text-[#59636D] font-medium flex-[2]">Item</span>
          <span className="text-[10px] text-[#59636D] font-medium flex-1 text-center">Rate</span>
          <span className="text-[10px] text-[#59636D] font-medium flex-1 text-center">Qty</span>
          <span className="text-[10px] text-[#59636D] font-medium flex-1 text-right">Total</span>
        </div>

        {/* List of Items */}
        <div className="flex flex-col gap-3 pt-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              
              {/* Product Info (Text Only) */}
              <div className="flex flex-col flex-[2] pr-2">
                <span className="font-bold text-[12px] sm:text-[13px] text-[#17232D] leading-tight">
                  {item.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#59636D] mt-0.5">
                  {item.type}
                </span>
              </div>
              
              {/* Rate */}
              <div className="flex-1 text-center">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#17232D]">{item.rate}</span>
              </div>
              
              {/* Qty */}
              <div className="flex-1 text-center">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#17232D]">{item.quantity}</span>
              </div>
              
              {/* Total */}
              <div className="flex-1 text-right">
                <span className="text-[12px] sm:text-[13px] font-bold text-[#17232D]">{item.total}</span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </InfoSection>
  );
};

export default OrderItems;
