import React from 'react';
import { WalletCards, Plus } from 'lucide-react';

const OutstandingCard = ({ outstandingAmount, onCollectPayment }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[22px] p-4 sm:p-5 flex items-center justify-between gap-4 mb-4">
      
      {/* Amount Info */}
      <div className="flex items-start gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl border border-gray-100 shadow-sm shrink-0 mt-1">
          <WalletCards className="w-5 h-5 sm:w-6 sm:h-6 text-[#E52323]" strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] sm:text-[13px] font-bold text-[#59636D] leading-tight">
            Total Outstanding
          </span>
          <span className="text-[26px] sm:text-[32px] font-black text-[#E52323] leading-none mt-1 tracking-tight">
            ₹{outstandingAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Collect Button */}
      <button 
        onClick={onCollectPayment}
        className="flex items-center gap-1.5 bg-[#E52323] text-white px-4 py-2 sm:py-2.5 rounded-full hover:bg-[#D41C1C] transition-colors shadow-lg shadow-[#E52323]/20 shrink-0"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        <span className="font-bold text-[12px] sm:text-[13px]">Collect Payment</span>
      </button>

    </div>
  );
};

export default OutstandingCard;
