import React, { useState } from 'react';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderHeader = ({ orderId, invoiceNo }) => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!orderId) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`/orders/get-bill/v1/${orderId}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('customer_token')}` }
      });
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      alert("Error fetching invoice PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#17232D]" strokeWidth={1.8} />
        </button>
        <h1 className="text-[20px] font-bold text-[#17232D]">Order Details</h1>
      </div>
      
      {invoiceNo && (
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 border-[1.5px] border-[#E52323] text-[#E52323] bg-white rounded-full px-4 py-1.5 hover:bg-[#FFF0EF] transition-colors disabled:opacity-50"
        >
          {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Download className="w-4 h-4" strokeWidth={2} />}
          <span className="font-bold text-xs">Download Bill</span>
        </button>
      )}
    </div>
  );
};

export default OrderHeader;
