import React, { useRef } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

const AgingBuckets = ({ buckets }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleInfoClick = (label, amount) => {
    alert(`Details for ${label}:\nAmount: ₹${amount}\nView specific invoices in Open Bills.`);
  };

  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[22px] p-4 sm:p-5 mb-4 relative overflow-hidden group">
      
      <div className="flex items-center gap-2.5 mb-4">
        <BarChart3 className="w-5 h-5 text-[#E52323]" strokeWidth={2} />
        <h3 className="text-[15px] sm:text-[16px] font-bold text-[#17232D]">Aging Buckets</h3>
      </div>

      <div className="relative">
        {/* Scroll Left Button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 sm:-ml-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#17232D] hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal scroll container */}
        <div 
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-2 px-2 sm:mx-0 sm:px-0"
        >
          {buckets.map((bucket, idx) => {
            const isCurrent = bucket.label === "Current Days";
            const hasAmount = bucket.amount > 0;
            
            return (
              <div 
                key={idx}
                className={`relative flex flex-col items-center justify-center rounded-[14px] p-3 min-w-[80px] sm:min-w-[90px] border transition-colors ${
                  isCurrent 
                    ? 'bg-[#FFF0F0] border-[#FFF0F0]' 
                    : 'bg-white border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                }`}
              >
                {/* Question mark icon if amount > 0 */}
                {hasAmount && (
                  <button 
                    onClick={() => handleInfoClick(bucket.label, bucket.amount)}
                    className="absolute top-1.5 right-1.5 p-0.5 text-[#59636D] hover:text-[#17232D] transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}

                <span className={`text-[10px] sm:text-[11px] font-medium whitespace-nowrap mb-1.5 mt-1 ${
                  isCurrent ? 'text-[#17232D]' : 'text-[#59636D]'
                }`}>
                  {bucket.label}
                </span>
                <span className={`text-[15px] sm:text-[16px] font-black ${
                  isCurrent ? 'text-[#E52323]' : 'text-[#17232D]'
                }`}>
                  ₹{bucket.amount}
                </span>
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 sm:-mr-4 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] text-[#17232D] hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
    </div>
  );
};

export default AgingBuckets;
