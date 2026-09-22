import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Grid2X2, ShoppingCart, FileText, UserRound } from 'lucide-react';

const BottomNavigation = () => {
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: House },
    { name: 'Categories', path: '/categories', icon: Grid2X2 },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: 2 },
    { name: 'Orders', path: '/profile/orders', icon: FileText },
    { name: 'Account', path: '/profile', icon: UserRound },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FFFDFC] border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] h-[80px] flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                isActive ? 'text-[#E52323]' : 'text-[#17232D]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={`w-[28px] h-[28px] mb-1 ${isActive ? 'text-[#E52323]' : 'text-gray-800'}`} strokeWidth={1.8} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-[#E52323] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#E52323]' : 'text-gray-800'}`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
