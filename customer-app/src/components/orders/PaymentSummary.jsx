import React from 'react';
import { CreditCard } from 'lucide-react';
import InfoSection from '../profile/InfoSection';

const PaymentSummary = ({ grandTotal, paidAmount, pendingDue, status }) => {
  // Determine colors based on status
  let badgeConfig = {
    bg: 'bg-[#FFF3D6]',
    text: 'text-[#B45309]',
    label: 'PARTIALLY PAID'
  };

  let paidAmountColor = 'text-[#16803C]';
  let pendingDueColor = 'text-[#E52323]';

  if (status === 'PAID') {
    badgeConfig = {
      bg: 'bg-[#EAF6E5]',
      text: 'text-[#16803C]',
      label: 'PAID'
    };
    pendingDueColor = 'text-[#17232D]'; // neutral if 0
  } else if (status === 'UNPAID') {
    badgeConfig = {
      bg: 'bg-[#FDE8E4]',
      text: 'text-[#E52323]',
      label: 'UNPAID'
    };
    paidAmountColor = 'text-[#17232D]'; // neutral if 0
  }

  return (
    <InfoSection 
      title="Accounting & Payment" 
      icon={CreditCard}
    >
      <div className="grid grid-cols-2 gap-y-5 gap-x-4">
        {/* Grand Total */}
        <div className="flex flex-col">
          <span className="text-[11px] text-[#59636D] font-medium mb-0.5">Grand Total</span>
          <span className="text-[15px] font-bold text-[#17232D]">{grandTotal}</span>
        </div>

        {/* Paid Amount */}
        <div className="flex flex-col border-l border-gray-100 pl-4">
          <span className="text-[11px] text-[#59636D] font-medium mb-0.5">Paid Amount</span>
          <span className={`text-[15px] font-bold ${paidAmountColor}`}>{paidAmount}</span>
        </div>

        {/* Pending Due */}
        <div className="flex flex-col pt-4 border-t border-gray-100">
          <span className="text-[11px] text-[#59636D] font-medium mb-0.5">Pending Due</span>
          <span className={`text-[15px] font-bold ${pendingDueColor}`}>{pendingDue}</span>
        </div>

        {/* Payment Status */}
        <div className="flex flex-col pt-4 border-t border-l border-gray-100 pl-4">
          <span className="text-[11px] text-[#59636D] font-medium mb-1.5">Payment Status</span>
          <div>
            <span className={`${badgeConfig.bg} ${badgeConfig.text} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
              {badgeConfig.label}
            </span>
          </div>
        </div>
      </div>
    </InfoSection>
  );
};

export default PaymentSummary;
