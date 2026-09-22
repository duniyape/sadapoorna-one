import React from 'react';
import { 
  MapPin, Home, Truck, FileText, UsersRound, Building2, 
  Hash, UserRound, Network, Clock, CalendarDays, Phone
} from 'lucide-react';
import InfoSection from './InfoSection';
import AddressCard from './AddressCard';
import PinnedLocation from './PinnedLocation';
import InfoRow from './InfoRow';

const ProfileDetailsTab = ({ customerData }) => {
  return (
    <div className="flex flex-col animate-fade-in">
      {/* 1. Address & Location Section */}
      <InfoSection 
        title="Address & Location" 
        description="Customer address details and location information"
        icon={MapPin} 
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <AddressCard 
            title="Billing Address"
            icon={Home}
            {...customerData.billingAddress}
          />
          <AddressCard 
            title="Shipping Address"
            icon={Truck}
            sameAsBilling={customerData.shippingAddress.sameAsBilling}
            {...customerData.shippingAddress}
          />
        </div>
        <PinnedLocation text={customerData.pinnedLocation} />
      </InfoSection>

      {/* 2. Additional Details Section */}
      <InfoSection 
        title="Additional Details" 
        description="More information about this customer"
        icon={FileText} 
      >
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <InfoRow 
            label="Customer Type" 
            value={customerData.additionalDetails.customerType} 
            icon={UsersRound} 
          />
          <InfoRow 
            label="Business Type" 
            value={customerData.additionalDetails.businessType} 
            icon={Home} 
          />
          <InfoRow 
            label="Alternate Mobile" 
            value={customerData.additionalDetails.alternateMobile} 
            icon={Phone} 
          />
          <InfoRow 
            label="GST Number" 
            value={customerData.additionalDetails.gstNumber} 
            icon={FileText} 
          />
          <InfoRow 
            label="Company Name" 
            value={customerData.additionalDetails.companyName} 
            icon={Building2} 
          />
        </div>
      </InfoSection>

      {/* 3. Account Assignment Section */}
      <InfoSection 
        title="Account Assignment" 
        description="System and team assignment details"
        icon={UsersRound} 
      >
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <InfoRow 
            label="System ID" 
            value={customerData.accountAssignment.systemId} 
            icon={Hash} 
          />
          <InfoRow 
            label="Assigned Employee" 
            value={customerData.accountAssignment.assignedEmployee} 
            icon={UserRound} 
          />
          <InfoRow 
            label="Branch / Hub" 
            value={customerData.accountAssignment.branchHub} 
            icon={Building2} 
          />
          <InfoRow 
            label="Assigned Beat" 
            value={customerData.accountAssignment.assignedBeat} 
            icon={Network} 
          />
        </div>
      </InfoSection>

      {/* 4. Audit Log Section */}
      <InfoSection 
        title="Audit Log" 
        description="Account creation and modification history"
        icon={Clock} 
        defaultExpanded={true}
      >
        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
          <InfoRow 
            label="Created At" 
            value={customerData.auditLog.createdAt} 
            icon={CalendarDays} 
          />
          <InfoRow 
            label="Last Modified" 
            value={customerData.auditLog.lastModified} 
            icon={CalendarDays} 
          />
        </div>
      </InfoSection>
    </div>
  );
};

export default ProfileDetailsTab;
