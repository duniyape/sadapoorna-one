import React from 'react';
import { UserRound, ClipboardList, BarChart3, CreditCard } from 'lucide-react';

const ProfileTabs = ({ activeTab = 'orders', setActiveTab }) => {
  const tabs = [
    { key: 'profile', name: 'Profile', icon: UserRound },
    { key: 'orders', name: 'Orders', icon: ClipboardList },
    { key: 'statements', name: 'Statements', icon: BarChart3 },
    { key: 'payment', name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide pb-2">
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <div
            key={idx}
            onClick={() => setActiveTab && setActiveTab(tab.key)}
            className={`flex-1 min-w-[70px] sm:min-w-[80px] flex flex-col items-center justify-center p-3 rounded-[14px] bg-white/85 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer transition-colors border-b-2 ${
              isActive ? 'border-[#E52323]' : 'border-transparent'
            }`}
          >
            <Icon
              className={`w-5 h-5 sm:w-6 sm:h-6 mb-1.5 ${
                isActive ? 'text-[#E52323]' : 'text-[#17232D]'
              }`}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span
              className={`text-[10px] sm:text-xs font-semibold ${
                isActive ? 'text-[#E52323]' : 'text-[#17232D]'
              }`}
            >
              {tab.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileTabs;
