import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OpenBills = ({ bills }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[22px] overflow-hidden mb-4">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#E52323]" strokeWidth={2} />
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#17232D]">Open Bills ({bills.length})</h3>
        </div>
        <button className="flex items-center gap-1 group">
          <span className="text-[11px] sm:text-[12px] font-bold text-[#E52323]">View All</span>
          <span className="text-[#E52323] group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* List Header (Hidden on small screens) */}
      <div className="hidden sm:grid grid-cols-4 px-5 py-2 bg-gray-50/50 border-y border-gray-100">
        <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Invoice No</span>
        <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Billed At</span>
        <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Pending Amount</span>
        <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Status</span>
      </div>

      {/* Invoice List (Compact Card Style for Mobile) */}
      <div className="flex flex-col p-2">
        {bills.map((bill, idx) => {
          const cleanId = bill.invoiceNo.replace('#', '');
          
          return (
            <div 
              key={idx}
              onClick={() => navigate(`/order/${cleanId}`)}
              className="flex items-center justify-between p-3 rounded-[14px] hover:bg-black/5 cursor-pointer transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-[13px] sm:text-[14px] font-bold text-[#17232D] mb-1 leading-tight">
                  {bill.invoiceNo}
                </span>
                <span className="text-[11px] sm:text-[12px] font-medium text-[#59636D] leading-tight">
                  {bill.billedAt}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-[#59636D] sm:hidden mb-0.5">Pending Amount</span>
                  <span className="text-[14px] sm:text-[15px] font-black text-[#E52323] leading-tight">
                    ₹{bill.pendingAmount}
                  </span>
                </div>
                
                <span className="bg-[#FFF0F0] text-[#E52323] text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {bill.status}
                </span>

                <ChevronRight className="w-4 h-4 text-[#E52323] shrink-0" strokeWidth={2} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OpenBills;
