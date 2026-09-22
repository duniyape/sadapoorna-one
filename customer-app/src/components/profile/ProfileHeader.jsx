import React from 'react';
import { ArrowLeft, Bell, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between pt-4 pb-2 px-1">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-[#17232D]" strokeWidth={2} />
        </button>
        <h1 className="text-[26px] font-bold text-[#17232D] leading-none">Profile</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer flex items-center justify-center">
          <Bell className="w-6 h-6 text-[#17232D]" strokeWidth={1.5} />
          <span className="absolute -top-1 -right-1 bg-[#E52323] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border-[1.5px] border-[#FFFDFC]">
            3
          </span>
        </div>
        <button className="cursor-pointer">
          <MoreVertical className="w-6 h-6 text-[#17232D]" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
