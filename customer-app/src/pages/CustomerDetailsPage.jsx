import React, { useState } from 'react';

import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerProfileCard from '../components/customer/CustomerProfileCard';
import OutstandingCard from '../components/customer/OutstandingCard';
import CollectPaymentModal from '../components/customer/CollectPaymentModal';
import AgingBuckets from '../components/customer/AgingBuckets';
import OpenBills from '../components/customer/OpenBills';
import NeedHelpCard from '../components/customer/NeedHelpCard';

const CustomerDetailsPage = () => {
  // Initial State based on prompt
  const [outstanding, setOutstanding] = useState(500);
  const [agingBuckets, setAgingBuckets] = useState([
    { label: "Current Days", amount: 500 },
    { label: "1 – 30 Days", amount: 0 },
    { label: "31 – 60 Days", amount: 0 },
    { label: "61 – 90 Days", amount: 0 },
    { label: "90+ Days", amount: 0 }
  ]);
  
  const [openBills, setOpenBills] = useState([
    {
      invoiceNo: "INV-2026-09-0003",
      billedAt: "21 Sept 2026",
      pendingAmount: 500,
      status: "Pending"
    }
  ]);

  const [isCollectModalOpen, setCollectModalOpen] = useState(false);

  const customerData = {
    name: "Walk In customer",
    id: "6ab0edf40f98926cab65dd6f",
    phone: "919131037870",
    status: "Active"
  };

  const handleCollectPayment = (amount, method) => {
    // Collect Payment Logic
    const newOutstanding = Math.max(0, outstanding - amount);
    setOutstanding(newOutstanding);

    // Update aging bucket (assuming deduction strictly from Current Days for mock)
    const newBuckets = [...agingBuckets];
    newBuckets[0].amount = Math.max(0, newBuckets[0].amount - amount);
    setAgingBuckets(newBuckets);

    // Update open bills (mock implementation for one bill)
    if (newOutstanding === 0) {
      setOpenBills([]);
    } else {
      const newBills = [...openBills];
      newBills[0].pendingAmount = newOutstanding;
      setOpenBills(newBills);
    }

    setCollectModalOpen(false);
  };

  return (
    <div 
      className="min-h-screen w-full overflow-x-hidden pb-8"
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

      <div className="max-w-[430px] mx-auto px-4 sm:px-5 relative z-10 animate-fade-in">
        
        {/* Customer Details Header */}
        <CustomerHeader />

        <div className="flex flex-col mt-2">
          
          {/* Customer Summary */}
          <CustomerProfileCard customer={customerData} />

          {/* Total Outstanding */}
          <OutstandingCard 
            outstandingAmount={outstanding} 
            onCollectPayment={() => setCollectModalOpen(true)}
          />

          {/* Aging Buckets */}
          <AgingBuckets buckets={agingBuckets} />

          {/* Open Bills */}
          {openBills.length > 0 && (
            <OpenBills bills={openBills} />
          )}

          {/* Need Help? */}
          <NeedHelpCard />

        </div>
      </div>

      <CollectPaymentModal 
        isOpen={isCollectModalOpen} 
        onClose={() => setCollectModalOpen(false)}
        customerName={customerData.name}
        maxOutstanding={outstanding}
        onCollect={handleCollectPayment}
      />

    </div>
  );
};

export default CustomerDetailsPage;
