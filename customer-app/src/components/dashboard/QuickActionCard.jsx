import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ title, subtitle, icon: Icon, colorClass, iconBgClass, to }) => {
  const content = (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-full cursor-pointer hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${iconBgClass} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="text-[#17232D] font-bold text-sm leading-tight">{title}</h3>
        <p className="text-[#59636D] text-xs mt-1">{subtitle}</p>
      </div>
    </div>
  );

  return to ? <Link to={to} className="block h-full">{content}</Link> : content;
};

export default QuickActionCard;
