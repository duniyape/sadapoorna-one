import React from 'react';
import { Phone, Copy, User } from 'lucide-react';

const CustomerSummaryCard = ({ data }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] p-4 mt-2 relative overflow-hidden">
      
      {/* Background Watermark Leaves */}
      <div className="absolute inset-0 pointer-events-none rounded-[20px]">
        {/* Bottom Right Leaf */}
        <svg className="absolute -bottom-10 -right-6 w-32 h-32 text-[#E52323] opacity-[0.12] transform -rotate-45" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
          <path d="M 80 20 C 80 70 40 110 -10 90 C 0 30 30 -10 80 20 Z" opacity="0.6" />
        </svg>
        {/* Top Right Leaf */}
        <svg className="absolute -top-10 right-4 w-28 h-28 text-[#E52323] opacity-[0.08] transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#A0B0CB] rounded-full flex items-center justify-center overflow-hidden border-2 border-white/50 shadow-sm relative z-20">
          <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#475A77]" strokeWidth={1.5} />
        </div>
        
        {/* Info */}
        <div className="flex-1 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-[22px] font-bold text-[#17232D] leading-none">{data.name}</h2>
              <span className="bg-[#EAF6E5] text-[#2F7F3B] text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                {data.status}
              </span>
            </div>
            {/* Sadapoorna logo placeholder on right */}
            <img src="https://sadapoorna.in/icons/Group.png" alt="Sadapoorna" className="w-[80px] sm:w-[90px] h-auto object-contain hidden sm:block opacity-90 relative z-20" />
          </div>
          
          <p className="text-[10px] sm:text-[11px] text-[#59636D] mt-1.5 font-medium">
            {data.accountType} &bull; POC: {data.poc} &bull; {data.customerId}
          </p>
          
          <div className="flex items-center gap-2 mt-3 relative z-20">
            <div className="w-6 h-6 rounded-full bg-[#FFF0EF] flex items-center justify-center">
              <Phone className="w-3.5 h-3.5 text-[#E52323]" strokeWidth={2} />
            </div>
            <span className="text-[#E52323] font-bold text-sm sm:text-[15px]">{data.mobile}</span>
            <button className="text-[#17232D] p-1 ml-1 cursor-pointer">
              <Copy className="w-4 h-4 text-[#59636D]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile logo position if it was hidden in flex row */}
      <div className="sm:hidden flex justify-end mt-[-10px] pr-2 relative z-20 pointer-events-none">
         <img src="https://sadapoorna.in/icons/Group.png" alt="Sadapoorna" className="w-[70px] h-auto object-contain opacity-90" />
      </div>
    </div>
  );
};

export default CustomerSummaryCard;
