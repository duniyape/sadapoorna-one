import React, { useState } from 'react';
import StatementHeader from '../components/statements/StatementHeader';
import DateFilterModal from '../components/statements/DateFilterModal';
import BalanceSummary from '../components/statements/BalanceSummary';
import LedgerControls from '../components/statements/LedgerControls';
import TransactionList from '../components/statements/TransactionList';

import { useCustomerProfile } from '../context/CustomerProfileContext';
import { apiFetch } from '../utils/api';
const fmt = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtMoney = (amount) => {
  if (amount === undefined || amount === null) return '0.00';
  return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const PaymentHistory = () => {
  const { profile } = useCustomerProfile();
  
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [dateRange, setDateRange] = useState("This Month");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest First');

  const fetchStatement = async (f, t) => {
    if (!profile) return;
    setIsGenerating(true);
    try {
      const customerId = profile.mongo_id || profile._id || profile.id;
      const params = new URLSearchParams();
      if (f) params.set('from_date', f);
      if (t) params.set('to_date', t);
      
      const res = await apiFetch(`/accounting/customers/${customerId}/statement?${params}`);
      if (res.ok && res.data && res.data.data) {
        const d = res.data.data;
        
        // Map transactions
        const mapped = (d.transactions || []).map((row, i) => ({
          id: i,
          timestamp: new Date(row.date).getTime(),
          date: fmt(row.date),
          title: row.invoice_no ? `Invoice ${row.invoice_no}` : (row.payment_mode ? `Receipt (${row.payment_mode})` : row.voucher_type),
          description: row.particulars || '',
          voucher: row.voucher_number || '',
          reference: row.invoice_no || '',
          debit: row.debit > 0 ? fmtMoney(row.debit) : '-',
          credit: row.credit > 0 ? fmtMoney(row.credit) : '-',
          balance: `${fmtMoney(row.running_balance)} ${row.balance_type}`
        }));
        
        setTransactions(mapped);
        setMeta({
          opening: `${fmtMoney(d.opening_balance)} ${d.opening_balance_type}`,
          debit: fmtMoney(d.total_debit),
          credit: fmtMoney(d.total_credit),
          closing: `${fmtMoney(d.closing_balance)} ${d.closing_balance_type}`
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  React.useEffect(() => {
    fetchStatement(fromDate, toDate);
  }, [profile, fromDate, toDate]);

  const handleApplyDate = (from, to) => {
    const formatStr = (d) => {
      if (!d) return '';
      const [year, month, day] = d.split('-');
      return `${day}-${month}-${year}`;
    };
    
    if (from && to) {
      setDateRange(`${formatStr(from)} to ${formatStr(to)}`);
      setFromDate(from);
      setToDate(to);
    } else {
      setDateRange("All time");
      setFromDate('');
      setToDate('');
    }
    setIsDateFilterOpen(false);
  };

  const handleGenerate = () => {
    fetchStatement(fromDate, toDate);
  };

  // Filter Logic
  let filteredTransactions = transactions.filter(tx => {
    const title = tx.title.toLowerCase();
    switch (filter) {
      case 'Debit': return tx.debit !== '-';
      case 'Credit': return tx.credit !== '-';
      case 'Invoices': return title.includes('invoice');
      case 'Receipts': return title.includes('receipt');
      case 'Reversals': return title.includes('reversal');
      default: return true;
    }
  });

  // Sort Logic (mock timestamps)
  if (sort === 'Newest First') {
    filteredTransactions = filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    filteredTransactions = filteredTransactions.sort((a, b) => a.timestamp - b.timestamp);
  }

  return (
    <div 
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: `radial-gradient(
          circle at 50% 0%,
          rgba(229, 35, 35, 0.08) 0%,
          rgba(229, 35, 35, 0.04) 20%,
          rgba(229, 35, 35, 0) 45%
        ),
        radial-gradient(
          circle at 0% 45%,
          rgba(239, 32, 38, 0.03) 0%,
          rgba(239, 32, 38, 0) 35%
        ),
        radial-gradient(
          circle at 100% 70%,
          rgba(229, 35, 35, 0.03) 0%,
          rgba(229, 35, 35, 0) 35%
        ),
        #FFF9F7`
      }}
    >
      {/* Global Background Leaves Watermark */}
      <div className="fixed top-0 left-0 w-full h-[300px] pointer-events-none z-0 overflow-hidden">
        <svg className="absolute -top-16 -left-16 w-64 h-64 text-[#E52323] opacity-[0.06] transform rotate-45" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
        <svg className="absolute top-10 -left-10 w-48 h-48 text-[#E52323] opacity-[0.04] transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
      </div>

      <div className="max-w-[430px] mx-auto px-4 sm:px-5 pb-12 pt-2 relative z-10 animate-fade-in">
        
        <StatementHeader 
          dateRange={dateRange} 
          onOpenDateFilter={() => setIsDateFilterOpen(true)} 
        />

        <div className="flex flex-col gap-4 mt-2">
          
          <BalanceSummary 
            openingBalance={meta ? meta.opening : "₹0.00"}
            totalDebit={meta ? meta.debit : "₹0.00"}
            totalCredit={meta ? meta.credit : "₹0.00"}
            closingBalance={meta ? meta.closing : "₹0.00"}
          />

          <LedgerControls 
            totalRecords={filteredTransactions.length}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />

          <TransactionList transactions={filteredTransactions} />

        </div>

      </div>

      <DateFilterModal 
        isOpen={isDateFilterOpen}
        onClose={() => setIsDateFilterOpen(false)}
        onApply={handleApplyDate}
      />

    </div>
  );
};

export default PaymentHistory;
