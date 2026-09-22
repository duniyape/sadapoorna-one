import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../../context/CustomerProfileContext';

const ProfileMenu = ({ name = 'You' }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { resetProfile } = useCustomerProfile();

  // Bahar click karne par dropdown band karo
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_data');
    resetProfile(); // context cache clear karo
    window.location.href = '/login'; // full reload → App.jsx re-reads empty token
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <div
        className="flex items-center gap-1.5 cursor-pointer select-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#394B62] flex items-center justify-center overflow-hidden shrink-0">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={1.8} />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] sm:text-[11px] font-medium text-[#59636D] leading-none mb-0.5">Hello,</span>
          <span className="text-[12px] sm:text-sm font-bold text-[#17232D] leading-none">{name}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#17232D] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-44 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-fade-in">
          {/* My Profile */}
          <button
            onClick={() => { setOpen(false); navigate('/profile'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#17232D] hover:bg-slate-50 transition-colors"
          >
            <UserCircle className="w-4 h-4 text-[#394B62]" strokeWidth={2} />
            My Profile
          </button>

          <div className="h-px bg-slate-100 mx-3" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#E52323] hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

