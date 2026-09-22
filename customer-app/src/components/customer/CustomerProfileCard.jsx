import React, { useState } from 'react';
import { UserRound, Phone, Copy } from 'lucide-react';

const CustomerProfileCard = ({ customer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(customer.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[22px] p-4 sm:p-5 flex items-start gap-4 mb-4">
      
      {/* Avatar */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#8C98A4] rounded-full flex items-center justify-center shrink-0">
        <UserRound className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 mt-1">
        
        {/* Name and Status */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[17px] sm:text-[18px] font-bold text-[#17232D] leading-tight">
            {customer.name}
          </h2>
          <span className="bg-[#E8F7EA] text-[#16803C] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 mt-0.5">
            {customer.status}
          </span>
        </div>

        {/* ID */}
        <span className="text-[12px] sm:text-[13px] font-medium text-[#59636D] mt-1">
          ID: {customer.id}
        </span>

        {/* Phone */}
        <div className="flex items-center gap-2 mt-2.5">
          <Phone className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          <span className="text-[13px] sm:text-[14px] font-bold text-[#17232D]">
            {customer.phone}
          </span>
          <button 
            onClick={handleCopy}
            className="p-1 hover:bg-black/5 rounded-md transition-colors relative"
          >
            <Copy className="w-4 h-4 text-[#17232D]" strokeWidth={1.8} />
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#17232D] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
                Copied
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerProfileCard;
