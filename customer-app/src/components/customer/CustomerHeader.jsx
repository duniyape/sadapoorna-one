import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Edit2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerHeader = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between py-4 relative z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#17232D]" strokeWidth={1.8} />
        </button>
        <h1 className="text-[24px] sm:text-[26px] font-bold text-[#17232D]">Customer Details</h1>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <MoreVertical className="w-6 h-6 text-[#17232D]" strokeWidth={1.8} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in py-1">
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#17232D] hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4 text-[#59636D]" /> Edit Customer
              </button>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#17232D] hover:bg-gray-50 flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#59636D]" /> Call Customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;
