import React, { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import TransactionCard from './TransactionCard';
import TransactionDetailModal from './TransactionDetailModal';

const TransactionList = ({ transactions }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Reset pagination if transactions change (e.g. filtered or sorted)
  useEffect(() => {
    setVisibleCount(10);
  }, [transactions]);

  const visibleTransactions = transactions.slice(0, visibleCount);
  const hasMore = visibleCount < transactions.length;

  const handleViewMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, transactions.length));
  };

  return (
    <div className="flex flex-col animate-fade-in mt-4">
      {/* List Container */}
      <div className="bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] rounded-[20px] overflow-hidden">
        
        {/* Table Header (hidden on very small screens, visible on normal mobile) */}
        <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Date & Details</span>
          <span className="text-[10px] font-bold text-[#59636D] uppercase tracking-wider">Amount & Bal</span>
        </div>

        <div className="flex flex-col px-3 py-1">
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-[13px] font-bold text-[#59636D]">No transactions found.</span>
            </div>
          ) : (
            visibleTransactions.map((tx, idx) => (
              <TransactionCard 
                key={idx} 
                transaction={tx} 
                onClick={setSelectedTransaction}
              />
            ))
          )}
        </div>
      </div>

      {/* View More Button */}
      {transactions.length > 0 && (
        <div className="flex flex-col items-center justify-center mt-6 mb-8">
          {hasMore ? (
            <button 
              onClick={handleViewMore}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#E52323]/20 bg-[#FFF0EF] text-[#E52323] hover:bg-[#FDE8E4] transition-colors"
            >
              <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
              <span className="font-bold text-[13px]">View More Transactions</span>
            </button>
          ) : (
            <div className="h-10" /> /* Spacer when no button */
          )}
          <span className="text-[11px] font-medium text-[#59636D] mt-3">
            Showing {visibleTransactions.length} of {transactions.length} records
          </span>
        </div>
      )}

      {/* Detail Modal */}
      <TransactionDetailModal 
        transaction={selectedTransaction} 
        isOpen={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  );
};

export default TransactionList;
