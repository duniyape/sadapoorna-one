import React, { useState, useEffect } from 'react';

const CollectPaymentModal = ({ isOpen, onClose, customerName, maxOutstanding, onCollect }) => {
  const [amount, setAmount] = useState(maxOutstanding.toString());
  const [method, setMethod] = useState('Cash');
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(maxOutstanding.toString());
      setMethod('Cash');
      setError('');
    }
  }, [isOpen, maxOutstanding]);

  if (!isOpen) return null;

  const paymentMethods = ['Cash', 'UPI', 'Cheque', 'Bank Transfer'];

  const handleConfirm = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (val > maxOutstanding) {
      setError(`Amount cannot exceed total outstanding (₹${maxOutstanding}).`);
      return;
    }
    
    setError('');
    onCollect(val, method);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full sm:w-[380px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
        
        <h2 className="text-[20px] font-bold text-[#17232D] mb-6">Collect Payment</h2>
        
        <div className="flex flex-col gap-5 mb-8">
          
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
            <span className="text-[12px] font-bold text-[#59636D]">Customer</span>
            <span className="text-[13px] font-bold text-[#17232D]">{customerName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[13px] font-bold text-[#59636D]">Outstanding:</span>
            <span className="text-[15px] font-black text-[#E52323]">₹{maxOutstanding.toLocaleString()}</span>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col relative">
            <label className="text-[12px] font-bold text-[#59636D] mb-1.5 ml-1">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#17232D] text-[16px]">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className={`w-full bg-[#FFF9F7] border ${error ? 'border-[#E52323]' : 'border-gray-200'} rounded-xl pl-9 pr-4 py-3.5 text-[16px] text-[#17232D] font-bold outline-none focus:border-[#E52323] transition-colors`}
                placeholder="0"
              />
            </div>
            {error && <span className="text-[11px] text-[#E52323] font-medium mt-1.5 ml-1">{error}</span>}
          </div>

          {/* Payment Method */}
          <div className="flex flex-col">
            <label className="text-[12px] font-bold text-[#59636D] mb-2 ml-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-2.5">
              {paymentMethods.map(m => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2.5 px-2 rounded-xl border text-[12px] font-bold transition-colors ${
                    method === m 
                      ? 'bg-[#FFF0EF] border-[#E52323] text-[#E52323]' 
                      : 'bg-white border-gray-200 text-[#59636D] hover:bg-gray-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 text-[#59636D] font-bold py-3.5 rounded-xl text-[14px] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 bg-[#E52323] text-white font-bold py-3.5 rounded-xl text-[14px] hover:bg-[#D41C1C] transition-colors shadow-lg shadow-[#E52323]/20"
          >
            Confirm Payment
          </button>
        </div>

      </div>
    </div>
  );
};

export default CollectPaymentModal;
