import React from 'react';

export const authHdr = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const fmt = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtDateTime = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return isNaN(d) ? 'N/A' : d.toLocaleString('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

export const formatVoucherNumber = (v, fallbackId = '') => {
  if (!v) return 'N/A';
  if (v.voucher_number) return v.voucher_number;
  if (v.voucher_no) return v.voucher_no;
  if (v.human_readable_id) return v.human_readable_id;
  const id = v._id || v.id || v.voucher_id || fallbackId;
  return id ? `VCH-${id.toString().slice(-6).toUpperCase()}` : 'N/A';
};

export const fmtMoney = (v) => {
  const n = parseFloat(v) || 0;
  return `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const todayStr = () => new Date().toISOString().split('T')[0];

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export const StatusBadge = ({ status }) => {
  const map = {
    pending:            'bg-amber-50 text-amber-700 border-amber-200',
    confirmed:          'bg-sky-50 text-sky-700 border-sky-200',
    'ready to pick up': 'bg-violet-50 text-violet-700 border-violet-200',
    'out for delivery': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered:          'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled:          'bg-rose-50 text-rose-700 border-rose-200',
  };
  const cls = map[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${cls}`}>
      {status || 'Pending'}
    </span>
  );
};
