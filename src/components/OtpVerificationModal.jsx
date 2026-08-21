import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function OtpVerificationModal({ customer, onClose, onSuccess, showToast }) {
  const [otpInput, setOtpInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleOtpSubmit = async () => {
    if (!otpInput) {
      showToast("Please enter an OTP");
      return;
    }
    setIsSending(true);
    // Placeholder for actual OTP verification logic
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      const customerId = customer.id || customer.customer_id || customer._id;
      const res = await fetch(`/whatsapp/verify-otp/${customerId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          otp: otpInput
        })
      });
      if (res.ok) {
        showToast("OTP Verified successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error verifying OTP");
    } finally {
      setIsSending(false);
    }
  };

  const inputClass = "w-full px-2.5 py-1.5 rounded border border-slate-200 text-[12px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400";
  const labelClass = "block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 p-4 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Verify Customer</h3>
          <p className="text-indigo-100 text-[11px] mt-1">Customer created successfully</p>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer ID</p>
            <p className="text-xs font-mono font-bold text-slate-800 break-all">
              {customer.id || customer.customer_id || customer._id || 'N/A'}
            </p>
          </div>

          <div>
            <label className={labelClass}>Enter OTP</label>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="e.g. 123456"
              className={inputClass}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={isSending}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              {isSending ? 'Verifying...' : 'Submit OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
