import React, { useState } from 'react';
import { FileText, FileDown, Filter, ArrowUpDown, ChevronDown } from 'lucide-react';

const LedgerControls = ({ totalRecords, onGenerate, isGenerating, filter, sort, onFilterChange, onSortChange }) => {
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  const filters = ['All', 'Debit', 'Credit', 'Invoices', 'Receipts', 'Reversals'];
  const sorts = ['Newest First', 'Oldest First'];

  const handleFilterSelect = (opt) => {
    onFilterChange(opt);
    setShowFilterOptions(false);
  };

  const handleSortSelect = (opt) => {
    onSortChange(opt);
    setShowSortOptions(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-100 shrink-0">
            <FileText className="w-5 h-5 text-[#E52323]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-black text-[16px] text-[#17232D] leading-tight">Ledger Statement</h3>
            <p className="text-[11px] font-medium text-[#59636D] mt-0.5">Showing all transactions</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 border-[1.5px] border-[#E52323] text-[#E52323] bg-white rounded-full px-4 py-1.5 hover:bg-[#FFF0EF] transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" strokeWidth={2} />
            <span className="font-bold text-xs">{isGenerating ? 'Generating...' : 'Generate Statement'}</span>
          </button>
          <span className="text-[10px] font-bold text-[#59636D] mt-2 tracking-wider uppercase">
            {totalRecords} RECORDS
          </span>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex items-center justify-between bg-white/60 border border-gray-100 rounded-xl p-2 px-3 mt-1">
        
        {/* Filter */}
        <div className="relative">
          <button 
            onClick={() => { setShowFilterOptions(!showFilterOptions); setShowSortOptions(false); }}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-[#59636D]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[#17232D]">Filter: {filter}</span>
            <ChevronDown className="w-3 h-3 text-[#59636D] ml-0.5" strokeWidth={2} />
          </button>
          
          {showFilterOptions && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-20 animate-fade-in">
              {filters.map(f => (
                <button 
                  key={f}
                  onClick={() => handleFilterSelect(f)}
                  className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors ${filter === f ? 'bg-[#FFF0EF] text-[#E52323] font-bold' : 'text-[#17232D] hover:bg-gray-50'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button 
            onClick={() => { setShowSortOptions(!showSortOptions); setShowFilterOptions(false); }}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#59636D]" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-[#17232D]">Sort: {sort.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-[#59636D] ml-0.5" strokeWidth={2} />
          </button>
          
          {showSortOptions && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-20 animate-fade-in">
              {sorts.map(s => (
                <button 
                  key={s}
                  onClick={() => handleSortSelect(s)}
                  className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors ${sort === s ? 'bg-[#FFF0EF] text-[#E52323] font-bold' : 'text-[#17232D] hover:bg-gray-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LedgerControls;
