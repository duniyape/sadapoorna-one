import React from 'react';
import { Truck, UserRound, Phone, MapPin } from 'lucide-react';
import InfoSection from '../profile/InfoSection';

const DeliveryDetails = ({ customer, phone, address, vehicle }) => {
  return (
    <InfoSection 
      title="Delivery Details" 
      icon={Truck}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <UserRound className="w-4 h-4 text-[#E52323] shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-[13px] text-[#17232D] font-medium">{customer}</span>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-[#E52323] shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-[13px] text-[#17232D] font-medium">{phone}</span>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[#E52323] shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-[13px] text-[#17232D] font-medium leading-relaxed">{address}</span>
        </div>

        <div className="flex items-start gap-3">
          <Truck className="w-4 h-4 text-[#E52323] shrink-0 mt-0.5" strokeWidth={2} />
          <span className="text-[13px] text-[#17232D] font-medium">{vehicle}</span>
        </div>
      </div>
    </InfoSection>
  );
};

export default DeliveryDetails;
