import React from 'react';

const InfoRow = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-start gap-3 w-full p-2">
      {Icon && (
        <div className="mt-0.5 shrink-0">
          <Icon className="w-5 h-5 text-[#E52323]" strokeWidth={1.5} />
        </div>
      )}
      <div className="flex flex-col flex-1">
        <span className="text-[11px] sm:text-xs text-[#59636D] mb-0.5 font-medium">{label}</span>
        <span className="text-xs sm:text-sm font-bold text-[#17232D]">{value}</span>
      </div>
    </div>
  );
};

export default InfoRow;
