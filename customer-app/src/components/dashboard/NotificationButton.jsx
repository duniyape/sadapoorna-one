import React from 'react';
import { Bell } from 'lucide-react';

const NotificationButton = ({ count = 0 }) => {
  return (
    <div className="relative p-1 cursor-pointer flex items-center justify-center">
      <Bell className="w-6 h-6 text-[#17232D]" strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute top-0 right-0 bg-[#E52323] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#FFFDFC]">
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationButton;
