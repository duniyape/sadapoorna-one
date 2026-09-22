import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3 } from 'lucide-react';

const InfoSection = ({ title, icon: Icon, children, hasEdit = false, defaultExpanded = true, description }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] p-4 mt-4 overflow-hidden">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 shrink-0">
            <Icon className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-[15px] sm:text-base text-[#17232D] leading-tight">{title}</h3>
            {description && (
              <p className="text-[10px] text-[#59636D] mt-0.5">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasEdit && (
            <button 
              className="hidden sm:flex items-center gap-1 bg-[#FFF0EF] text-[#E52323] px-3 py-1 rounded-full border border-[#E52323]/20 hover:bg-[#FDE8E4] transition-colors"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Edit3 className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="text-[11px] font-bold">Edit</span>
            </button>
          )}
          <button className="p-1">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-[#17232D]" strokeWidth={1.5} />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#17232D]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile edit button if present */}
      {hasEdit && (
        <div className="sm:hidden flex justify-end mt-2 mb-[-8px]">
          <button 
            className="flex items-center gap-1 bg-[#FFF0EF] text-[#E52323] px-3 py-1 rounded-full border border-[#E52323]/20 active:bg-[#FDE8E4] transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Edit3 className="w-3 h-3" strokeWidth={2} />
            <span className="text-[10px] font-bold">Edit</span>
          </button>
        </div>
      )}

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100/60 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default InfoSection;
