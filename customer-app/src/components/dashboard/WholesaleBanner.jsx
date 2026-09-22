import React from 'react';
import { Tag } from 'lucide-react';

const WholesaleBanner = () => {
  return (
    <div className="bg-[#EAF6E5] rounded-2xl p-4 flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#d3ecc9] flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-green-800" strokeWidth={1.8} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-green-900 font-bold text-sm">Special Wholesale Rates</h3>
          <p className="text-green-800 text-[11px]">Get the best prices on bulk orders</p>
        </div>
      </div>
      <button className="bg-green-100/50 hover:bg-green-200 text-green-900 rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1 shrink-0 whitespace-nowrap transition-colors">
        View Offers <span>→</span>
      </button>
    </div>
  );
};

export default WholesaleBanner;
