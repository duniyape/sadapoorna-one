import React from 'react';
import { Crosshair } from 'lucide-react';

const PinnedLocation = ({ text }) => {
  return (
    <div className="flex items-center justify-between mt-3 bg-white/60 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center gap-3">
        <Crosshair className="w-5 h-5 text-[#E52323]" strokeWidth={2} />
        <div className="flex flex-col">
          <h4 className="font-bold text-[#17232D] text-sm leading-tight">Pinned Location</h4>
          <p className="text-[10px] sm:text-[11px] text-[#59636D] font-medium mt-0.5">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default PinnedLocation;
