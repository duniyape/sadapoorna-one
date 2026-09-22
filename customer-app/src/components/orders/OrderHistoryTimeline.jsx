import React from 'react';
import { Clock3, CircleCheck, Clock, Package, Truck, FileText } from 'lucide-react';
import InfoSection from '../profile/InfoSection';

const OrderHistoryTimeline = ({ history }) => {
  // Helper to determine color and icon based on status string
  const getEventStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-500', border: 'border-gray-500' };
      case 'Confirmed':
        return { icon: CircleCheck, color: 'text-[#16803C]', bg: 'bg-[#16803C]', border: 'border-[#16803C]' };
      case 'Ready to Pick Up':
        return { icon: Package, color: 'text-[#2563EB]', bg: 'bg-[#2563EB]', border: 'border-[#2563EB]' };
      case 'Delivered':
        return { icon: CircleCheck, color: 'text-[#16803C]', bg: 'bg-[#16803C]', border: 'border-[#16803C]' };
      case 'Billed':
        return { icon: FileText, color: 'text-[#E52323]', bg: 'bg-[#E52323]', border: 'border-[#E52323]' };
      default:
        return { icon: CircleCheck, color: 'text-gray-500', bg: 'bg-gray-500', border: 'border-gray-500' };
    }
  };

  return (
    <InfoSection 
      title="Order History" 
      icon={Clock3}
      defaultExpanded={true}
    >
      <div className="flex flex-col relative pl-2 py-1">
        
        {/* Continuous Vertical Line */}
        <div className="absolute left-[20px] top-4 bottom-6 w-[1px] bg-gray-200 z-0" />

        {history.map((event, idx) => {
          const { icon: EventIcon, color, bg } = getEventStyle(event.status);
          const isLast = idx === history.length - 1;

          return (
            <div key={idx} className="relative z-10 flex items-start gap-4 mb-6 last:mb-0">
              
              {/* Timeline Icon */}
              <div className="relative mt-0.5 shrink-0">
                <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center bg-white shadow-sm border-2 ${color.replace('text', 'border')}`}>
                  {event.status === 'Pending' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  ) : (
                    <EventIcon className={`w-3.5 h-3.5 ${color}`} strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Event Content */}
              <div className="flex flex-col justify-center min-h-[26px]">
                <h4 className="font-bold text-[13px] sm:text-[14px] text-[#17232D] leading-none">
                  {event.status}
                </h4>
                {event.date && (
                  <span className="text-[10px] text-[#8C98A4] mt-1.5 font-medium">
                    {event.date}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </InfoSection>
  );
};

export default OrderHistoryTimeline;
