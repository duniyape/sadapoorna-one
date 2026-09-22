import React from 'react';
import { CheckCircle } from 'lucide-react';

const stages = ['Pending', 'Confirmed', 'Packed', 'Dispatched', 'Delivered'];

const OrderSummary = ({ orderId, internalId, date, status }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] p-4">
      {/* Top Details */}
      <div className="flex flex-col mb-5">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-[#17232D]">Order <span className="text-[#17232D] ml-1">{orderId}</span></h2>
          <span className="bg-[#FFF0EF] text-[#E52323] text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wide">
            {status}
          </span>
        </div>
        <p className="text-[11px] text-[#59636D] font-medium">
          ID: {internalId} &bull; {date}
        </p>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative flex justify-between items-center w-full px-2 mt-2">
        {/* Connecting Line Background */}
        <div className="absolute top-3 left-4 right-4 h-[2px] bg-[#E52323] z-0" />
        
        {/* Stages */}
        {stages.map((stage, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            {/* Circle Icon */}
            <div className="bg-white rounded-full">
              <CheckCircle className="w-6 h-6 text-[#E52323] fill-[#E52323] text-white" strokeWidth={1} />
            </div>
            {/* Label */}
            <span className="text-[10px] sm:text-[11px] font-bold text-[#17232D] mt-1.5 whitespace-nowrap">
              {stage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSummary;
