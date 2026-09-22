import React from 'react';

const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-lg font-black text-[#17232D] leading-tight pr-4">
            {transaction.title}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold shrink-0 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Date</span>
            <span className="text-[13px] font-bold text-[#17232D]">{transaction.date}</span>
          </div>
          
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Description</span>
            <span className="text-[12px] font-medium text-[#17232D] text-right max-w-[200px]">{transaction.description || '-'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Voucher</span>
            <span className="text-[12px] font-medium text-[#17232D]">{transaction.voucher || '-'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Reference</span>
            <span className="text-[12px] font-medium text-[#17232D]">{transaction.reference || '-'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Debit</span>
            <span className="text-[13px] font-black text-[#E52323]">{transaction.debit || '-'}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-[12px] font-bold text-[#59636D]">Credit</span>
            <span className="text-[13px] font-black text-[#16803C]">{transaction.credit || '-'}</span>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-[12px] font-bold text-[#59636D]">Running Balance</span>
            <span className="text-[14px] font-black text-[#17232D]">{transaction.balance}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TransactionDetailModal;
