import React from 'react';
import { ChevronRight, FileText, IndianRupee, RefreshCw } from 'lucide-react';

const TransactionCard = ({ transaction, onClick }) => {
  // Determine styling based on type
  let icon = <FileText className="w-4 h-4" strokeWidth={2} />;
  let iconBg = 'bg-[#FFF0EF]';
  let iconColor = 'text-[#E52323]';
  let amountStr = '';
  let amountColor = '';

  const isInvoice = transaction.title.toLowerCase().includes('invoice');
  const isReceipt = transaction.title.toLowerCase().includes('receipt');
  const isReversal = transaction.title.toLowerCase().includes('reversal');
  const isOpening = transaction.title.toLowerCase().includes('opening');

  if (isInvoice) {
    icon = <FileText className="w-4 h-4" strokeWidth={2} />;
    iconBg = 'bg-[#FFF0EF]';
    iconColor = 'text-[#E52323]';
    amountStr = transaction.debit;
    amountColor = 'text-[#E52323]';
  } else if (isReceipt) {
    icon = <IndianRupee className="w-4 h-4" strokeWidth={2} />;
    iconBg = 'bg-[#EAF6E5]';
    iconColor = 'text-[#16803C]';
    amountStr = transaction.credit;
    amountColor = 'text-[#16803C]';
  } else if (isReversal) {
    icon = <RefreshCw className="w-4 h-4" strokeWidth={2} />;
    iconBg = 'bg-[#FFF3D6]';
    iconColor = 'text-[#D97706]';
    amountStr = transaction.debit;
    amountColor = 'text-[#E52323]'; // Reversals debit amount is red
  } else if (isOpening) {
    icon = <FileText className="w-4 h-4" strokeWidth={2} />;
    iconBg = 'bg-gray-100';
    iconColor = 'text-gray-500';
    amountStr = '-';
    amountColor = 'text-gray-400';
  }

  return (
    <div 
      onClick={() => onClick(transaction)}
      className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-black/5 cursor-pointer transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Date Stack */}
        <div className="flex flex-col items-center justify-center shrink-0 w-12 pt-0.5">
          {isOpening ? (
            <span className="text-[12px] font-bold text-gray-400">--</span>
          ) : (
            <>
              <span className="text-[11px] font-bold text-[#17232D] leading-tight">{transaction.date.split(' ')[0]}</span>
              <span className="text-[11px] font-bold text-[#17232D] leading-tight">{transaction.date.split(' ')[1]}</span>
              <span className="text-[9px] font-medium text-[#59636D]">{transaction.date.split(' ')[2]}</span>
            </>
          )}
        </div>

        {/* Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconBg} ${iconColor}`}>
          {icon}
        </div>

        {/* Title & Desc */}
        <div className="flex flex-col max-w-[140px] sm:max-w-[180px]">
          <span className="font-bold text-[12.5px] sm:text-[14px] text-[#17232D] leading-tight mb-1">
            {transaction.title}
          </span>
          {transaction.description && (
            <span className="text-[10.5px] sm:text-[11px] text-[#59636D] leading-tight mb-0.5">
              {transaction.description}
            </span>
          )}
          {transaction.voucher && (
            <span className="text-[9.5px] text-[#8C98A4] font-medium">
              {transaction.voucher}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-right">
        {/* Amount & Balance */}
        <div className="flex flex-col items-end">
          <span className={`font-black text-[13px] sm:text-[14px] leading-tight mb-1 ${amountColor}`}>
            {amountStr !== '-' ? amountStr : '-'}
          </span>
          <span className="font-bold text-[11px] sm:text-[12px] text-[#17232D]">
            {transaction.balance}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#E52323] shrink-0" strokeWidth={2} />
      </div>
    </div>
  );
};

export default TransactionCard;
