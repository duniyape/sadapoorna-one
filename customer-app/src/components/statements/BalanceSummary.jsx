import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, WalletCards } from 'lucide-react';

const BalanceSummary = ({ openingBalance, totalDebit, totalCredit, closingBalance }) => {
  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] p-5">
      <div className="grid grid-cols-2 gap-y-6 gap-x-4">
        
        {/* Opening Balance */}
        <div className="flex flex-col">
          <span className="text-[11px] sm:text-xs text-[#59636D] font-bold mb-0.5 tracking-wide">Opening Balance</span>
          <span className="text-[16px] sm:text-[18px] font-black text-[#17232D]">{openingBalance}</span>
          <div className="mt-1.5 opacity-60">
            <WalletCards className="w-4 h-4 text-[#17232D]" />
          </div>
        </div>

        {/* Total Debit */}
        <div className="flex flex-col border-l border-gray-100 pl-4">
          <span className="text-[11px] sm:text-xs text-[#59636D] font-bold mb-0.5 tracking-wide">Total Debit</span>
          <span className="text-[16px] sm:text-[18px] font-black text-[#E52323]">{totalDebit}</span>
          <div className="mt-1.5 flex items-center">
            <ArrowUpCircle className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          </div>
        </div>

        {/* Total Credit */}
        <div className="flex flex-col pt-4 border-t border-gray-100">
          <span className="text-[11px] sm:text-xs text-[#59636D] font-bold mb-0.5 tracking-wide">Total Credit</span>
          <span className="text-[16px] sm:text-[18px] font-black text-[#16803C]">{totalCredit}</span>
          <div className="mt-1.5 flex items-center">
            <ArrowDownCircle className="w-4 h-4 text-[#16803C]" strokeWidth={2} />
          </div>
        </div>

        {/* Closing Balance */}
        <div className="flex flex-col pt-4 border-t border-l border-gray-100 pl-4">
          <span className="text-[11px] sm:text-xs text-[#59636D] font-bold mb-0.5 tracking-wide">Closing Balance</span>
          <span className="text-[16px] sm:text-[18px] font-black text-[#E52323]">{closingBalance}</span>
          <div className="mt-1.5 flex items-center gap-1.5">
            <WalletCards className="w-4 h-4 text-[#59636D]" />
            <span className="text-[11px] font-bold text-[#59636D]">Dr</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BalanceSummary;
