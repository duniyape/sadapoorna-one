import React from 'react';

const AddressCard = ({ title, icon: Icon, address, city, state, pin, sameAsBilling }) => {
  return (
    <div className="bg-white/60 rounded-xl p-3 border border-gray-100 flex-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#E52323]" strokeWidth={2} />
        <h4 className="font-bold text-[#17232D] text-sm">{title}</h4>
      </div>
      
      {sameAsBilling && (
        <p className="text-[#E52323] text-[10px] font-bold mb-2">Same as Billing</p>
      )}
      
      <div className="text-[11px] text-[#59636D] leading-relaxed font-medium">
        <p>{address}</p>
        <p>{city}, {state}</p>
        <p className="mt-1">PIN: {pin}</p>
      </div>
    </div>
  );
};

export default AddressCard;
