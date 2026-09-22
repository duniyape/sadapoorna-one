import React from 'react';
import { ArrowLeft, CalendarDays, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatementHeader = ({ dateRange, onOpenDateFilter }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#17232D]" strokeWidth={1.8} />
        </button>
        <h1 className="text-[20px] font-bold text-[#17232D]">Account Statement</h1>
      </div>
      
      <button 
        onClick={onOpenDateFilter}
        className="flex items-center gap-2 border-[1.5px] border-[#E52323] text-[#E52323] bg-white rounded-full px-3 py-1.5 hover:bg-[#FFF0EF] transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="font-bold text-[10px] tracking-wide">{dateRange}</span>
        <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
      </button>
    </div>
  );
};

export default StatementHeader;
