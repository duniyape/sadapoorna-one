import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const LocationSelector = () => {
  return (
    <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-sm h-[32px] sm:h-[36px]">
      <MapPin className="w-3.5 h-3.5 text-[#E52323] shrink-0" strokeWidth={2.5} />
      <span className="text-[11px] sm:text-xs font-semibold text-[#17232D] whitespace-nowrap">Bhopal, MP</span>
      <ChevronDown className="w-3.5 h-3.5 text-[#E52323] shrink-0" strokeWidth={2.5} />
    </div>
  );
};

export default LocationSelector;
