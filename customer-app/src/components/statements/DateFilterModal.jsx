import React, { useState } from 'react';

const DateFilterModal = ({ isOpen, onClose, onApply, currentFrom, currentTo }) => {
  const [fromDate, setFromDate] = useState(currentFrom || '');
  const [toDate, setToDate] = useState(currentTo || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(fromDate, toDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full sm:w-[360px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
        
        <h2 className="text-xl font-bold text-[#17232D] mb-6">Filter by Date</h2>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-[#59636D] uppercase tracking-wider mb-1.5 ml-1">From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-[#FFF9F7] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-[#17232D] font-medium outline-none focus:border-[#E52323] transition-colors"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-[#59636D] uppercase tracking-wider mb-1.5 ml-1">To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-[#FFF9F7] border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-[#17232D] font-medium outline-none focus:border-[#E52323] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-[#59636D] font-bold py-3.5 rounded-xl text-[14px] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 bg-[#E52323] text-white font-bold py-3.5 rounded-xl text-[14px] hover:bg-[#D41C1C] transition-colors shadow-lg shadow-[#E52323]/20"
          >
            Apply
          </button>
        </div>

      </div>
    </div>
  );
};

export default DateFilterModal;
