import React from 'react';
import ProfileMenu from './ProfileMenu';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomerProfile } from '../../context/CustomerProfileContext';

const Header = ({ cart = {} }) => {
  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const { profile, loading } = useCustomerProfile();

  // API se naam lo, fallback mein loading ya "You"
  const displayName = loading ? '...' : (profile?.name || profile?.full_name || profile?.customer_name || 'You');

  return (
    <div className="flex items-center justify-between pt-4 pb-2">
      {/* Logo */}
      <div className="flex flex-col shrink-0">
        <img
          src="https://sadapoorna.in/icons/Group.png"
          alt="Sadapoorna"
          className="w-[110px] sm:w-[130px] h-auto object-contain"
        />
        <p className="text-[#17232D] text-[4.5px] sm:text-[5px] font-bold tracking-[0.1em] mt-1 uppercase pl-1">
          Pure essentials for a brighter tomorrow
        </p>
      </div>
      
      {/* Right side items */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <Link 
          to="/cart"
          state={{ initialCart: cart }}
          className="relative p-2 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-[#17232D]" strokeWidth={1.8} />
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E52323] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#FFF9F7]">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
        </Link>
        <ProfileMenu name={displayName} />
      </div>
    </div>
  );
};

export default Header;

