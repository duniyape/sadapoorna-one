import React from 'react';
import QuickActionCard from './QuickActionCard';
import { ShoppingCart, ClipboardList, FileText, WalletCards } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Place Order',
      subtitle: 'Quick & Easy',
      icon: ShoppingCart,
      colorClass: 'text-white',
      iconBgClass: 'bg-green-500',
      to: '/create-order'
    },
    {
      title: 'Order History',
      subtitle: 'Track & Manage',
      icon: ClipboardList,
      colorClass: 'text-white',
      iconBgClass: 'bg-orange-500',
      to: '/profile'
    },
    {
      title: 'Statement',
      subtitle: 'Account Ledger',
      icon: FileText,
      colorClass: 'text-white',
      iconBgClass: 'bg-blue-500',
      to: '/statement'
    },
    {
      title: 'Outstanding',
      subtitle: 'Collect Payment',
      icon: WalletCards,
      colorClass: 'text-white',
      iconBgClass: 'bg-purple-500',
      to: '/customer-details'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {actions.map((action, idx) => (
        <QuickActionCard key={idx} {...action} />
      ))}
    </div>
  );
};

export default QuickActions;
