import React from 'react';
import { CheckCircle, Truck, Package, RefreshCw, FileText } from 'lucide-react';

const OrderStatus = ({ status }) => {
  let config = {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    Icon: FileText,
  };

  switch (status) {
    case 'Delivered':
      config = {
        bg: 'bg-[#EAF6E5]',
        text: 'text-[#16803C]',
        Icon: CheckCircle,
      };
      break;
    case 'Out for Delivery':
      config = {
        bg: 'bg-[#EFF6FF]',
        text: 'text-[#2563EB]',
        Icon: Truck,
      };
      break;
    case 'Packed':
      config = {
        bg: 'bg-[#F3E8FF]',
        text: 'text-[#7C3AED]',
        Icon: Package,
      };
      break;
    case 'Confirming':
      config = {
        bg: 'bg-[#FEF3C7]',
        text: 'text-[#D97706]',
        Icon: RefreshCw,
      };
      break;
    case 'Order Placed':
    default:
      config = {
        bg: 'bg-gray-100',
        text: 'text-[#59636D]',
        Icon: FileText,
      };
      break;
  }

  const { bg, text, Icon } = config;

  return (
    <div className={`flex items-center gap-1 ${bg} px-2 py-0.5 rounded-full`}>
      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${text}`} strokeWidth={2.5} />
      <span className={`text-[9px] sm:text-[10px] font-bold ${text} whitespace-nowrap`}>
        {status}
      </span>
    </div>
  );
};

export default OrderStatus;
