import React from 'react';

const CategoryItem = ({ name, icon: Icon, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-[#FFF0EF] flex items-center justify-center border border-[#E52323]/10">
        <Icon className="w-7 h-7 text-[#E52323]" strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium text-[#17232D] text-center">{name}</span>
    </div>
  );
};

export default CategoryItem;
