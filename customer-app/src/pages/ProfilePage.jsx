import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ProfileHeader from '../components/profile/ProfileHeader';
import CustomerSummaryCard from '../components/profile/CustomerSummaryCard';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileDetailsTab from '../components/profile/ProfileDetailsTab';
import ProfileOrdersTab from '../components/profile/ProfileOrdersTab';
import { useCustomerProfile } from '../context/CustomerProfileContext';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();
  const { profile, loading, error } = useCustomerProfile();

  useEffect(() => {
    if (activeTab === 'statements') {
      navigate('/statement');
    } else if (activeTab === 'payment') {
      navigate('/customer-details');
    }
  }, [activeTab, navigate]);

  // /customer/profile ka exact response structure se map kar rahe hain
  const customerData = profile ? {
    name:        profile.name        || '-',
    status:      profile.status      || 'active',
    accountType: profile.customer_type === 'business' ? 'Business Account' : 'Individual Account',
    poc:         profile.company_name || profile.name || '-',
    customerId:  profile.custom_id   || profile.id   || '-',
    mobile:      profile.mobile      || '-',

    billingAddress: {
      address: profile.billing_address?.address || '-',
      city:    profile.billing_address?.city    || '-',
      state:   profile.billing_address?.state   || '-',
      pin:     profile.billing_address?.pincode || '-',   // API: pincode
    },

    shippingAddress: {
      sameAsBilling: false,
      address: profile.shipping_address?.address || profile.billing_address?.address || '-',
      city:    profile.shipping_address?.city    || profile.billing_address?.city    || '-',
      state:   profile.shipping_address?.state   || profile.billing_address?.state   || '-',
      pin:     profile.shipping_address?.pincode || profile.billing_address?.pincode || '-', // API: pincode
    },

    pinnedLocation: profile.pinned_location || 'No GPS location captured for this customer.',

    additionalDetails: {
      customerType:    profile.customer_type    || '-',
      alternateMobile: profile.alternate_mobile || 'N/A',
      companyName:     profile.company_name     || '-',
      businessType:    profile.business_type    || profile.customer_type || '-',
      gstNumber:       profile.gst_number       || '-',
    },

    accountAssignment: {
      systemId:         profile.custom_id        || profile.id        || '-',
      branchHub:        profile.branch_id        || '-',
      assignedEmployee: profile.assigned_employee || '-',
      assignedBeat:     profile.beat_id          || 'N/A',
    },

    auditLog: {
      createdAt:    profile.created_at ? new Date(profile.created_at).toLocaleString('en-IN') : '-',
      lastModified: profile.updated_at ? new Date(profile.updated_at).toLocaleString('en-IN') : '-',
    },
  } : null;

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
        {/* Top Left Leaf Cluster */}
        <svg className="absolute -top-16 -left-16 w-64 h-64 text-[#E52323] opacity-[0.06] transform rotate-45" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
        <svg className="absolute top-10 -left-10 w-48 h-48 text-[#E52323] opacity-[0.04] transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 100 0 C 100 60 60 100 0 100 C 0 40 40 0 100 0 Z" />
        </svg>
      </div>

      <div className="max-w-[430px] mx-auto px-4 pb-12 pt-2 relative z-10">
        
        {/* Top Header */}
        <ProfileHeader />

        {/* Loading State */}
        {loading && (
          <div className="mt-4 bg-white/70 rounded-[20px] p-6 flex flex-col gap-3 animate-pulse">
            <div className="h-5 bg-slate-200 rounded-full w-1/2" />
            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
            <div className="h-4 bg-slate-100 rounded-full w-2/3" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-[20px] p-5 text-center">
            <p className="text-red-500 font-semibold text-sm">{error}</p>
            <p className="text-red-400 text-xs mt-1">Dobara try karne ke liye refresh karo</p>
          </div>
        )}

        {/* Profile Content */}
        {!loading && customerData && (
          <>
            {/* Customer Summary Card */}
            <CustomerSummaryCard data={customerData} />

            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content Rendering */}
            {activeTab === 'profile' && <ProfileDetailsTab customerData={customerData} />}
            {activeTab === 'orders' && <ProfileOrdersTab />}
          </>
        )}
        
        {/* End of Profile Page - No Bottom Navigation! */}
      </div>
    </div>
  );
};

export default ProfilePage;

