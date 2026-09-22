import React from 'react';
import { Headphones, PhoneCall } from 'lucide-react';

const NeedHelpCard = () => {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[22px] p-4 sm:p-5 flex items-center justify-between gap-4">
      
      <div className="flex items-start gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl border border-gray-100 shadow-sm shrink-0">
          <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#E52323]" strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[14px] sm:text-[15px] font-bold text-[#17232D] leading-tight mb-1">
            Need Help?
          </h3>
          <p className="text-[11px] sm:text-[12px] font-medium text-[#59636D] leading-tight max-w-[140px] sm:max-w-full">
            Contact our team for any queries.
          </p>
        </div>
      </div>

      <a 
        href="tel:+1234567890"
        className="flex items-center gap-1.5 border-[1.5px] border-[#E52323] text-[#E52323] bg-white rounded-full px-4 py-2 sm:py-2.5 hover:bg-[#FFF0EF] transition-colors shrink-0 shadow-sm"
      >
        <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
        <span className="font-bold text-[11px] sm:text-[12px]">Contact Sales</span>
      </a>

    </div>
  );
};

export default NeedHelpCard;
