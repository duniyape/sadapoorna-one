import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ShoppingCart, User, Building2,
  Phone, Mail, BarChart3, FileText, Receipt, AlertCircle,
} from 'lucide-react';
import { authHdr } from '../utils/customerHelpers';

const TABS = [
  { key: 'profile',   label: 'Profile',   Icon: User },
  { key: 'orders',    label: 'Orders',    Icon: ShoppingCart },
  { key: 'statement', label: 'Statement', Icon: FileText },
  { key: 'khata',     label: 'Payment',   Icon: Receipt },
];

export default function CustomerProfileLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useOutletContext();

  const [customer, setCustomer]   = useState(null);
  const [branches, setBranches]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive active tab purely from URL — zero state needed
  const pathTail = location.pathname.split('/').pop();
  const activeTab = ['orders', 'statement', 'khata'].includes(pathTail) ? pathTail : 'profile';

  const goTab = (key) =>
    navigate(key === 'profile' ? `/view-customer/${id}` : `/view-customer/${id}/${key}`);

  // ── Fetch customer + branches + employees in ONE parallel round-trip ────────
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const [cRes, bRes, eRes] = await Promise.all([
          fetch(`/customer/${id}`,  { headers: authHdr(), signal: ctrl.signal }),
          fetch('/branches/v1',     { headers: authHdr(), signal: ctrl.signal }).catch(() => null),
          fetch('/users/get',       { headers: authHdr(), signal: ctrl.signal }).catch(() => null),
        ]);

        if (cRes.ok) {
          const j = await cRes.json();
          let c = j.data || j.customer || j;
          if (Array.isArray(c)) c = c[0]; // If backend returns array, take first
          if (c && typeof c === 'object') setCustomer(c);
          else showToast('Failed to load customer data format');
        } else showToast('Failed to load customer');

        if (bRes?.ok) { 
          const j = await bRes.json(); 
          let b = [];
          if (Array.isArray(j.data)) b = j.data;
          else if (j.data?.branches && Array.isArray(j.data.branches)) b = j.data.branches;
          else if (Array.isArray(j.branches)) b = j.branches;
          else if (Array.isArray(j)) b = j;
          setBranches(b);
        }
        if (eRes?.ok) { 
          const j = await eRes.json(); 
          let e = [];
          if (Array.isArray(j.data)) e = j.data;
          else if (j.data?.users && Array.isArray(j.data.users)) e = j.data.users;
          else if (j.data?.employees && Array.isArray(j.data.employees)) e = j.data.employees;
          else if (Array.isArray(j.users)) e = j.users;
          else if (Array.isArray(j)) e = j;
          setEmployees(e);
        }
      } catch (e) {
        if (e.name !== 'AbortError') showToast('Error loading profile');
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [id]);

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="max-w-6xl mx-auto space-y-4 pb-10 animate-pulse">
      <div className="h-10 bg-slate-200 rounded-2xl" />
      <div className="h-28 bg-slate-200 rounded-2xl" />
      <div className="h-10 bg-slate-200 rounded-2xl w-2/3" />
      <div className="h-56 bg-slate-200 rounded-2xl" />
    </div>
  );

  if (!customer) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-3">
      <AlertCircle className="w-10 h-10" />
      <p className="font-bold text-sm">Customer not found.</p>
    </div>
  );

  const isBiz = customer.customer_type === 'business';
  const displayName = (isBiz && customer.company_name) ? customer.company_name : customer.name;
  const initial = displayName?.charAt(0)?.toUpperCase() || '?';

  // ── Context passed to ALL child tab pages via Outlet ───────────────────────
  const outletCtx = { customer, branches, employees, id, showToast, isBiz, displayName };

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-16">

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/add-order', { state: { preselectedCustomer: customer } })}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> New Order
          </button>
          <button
            onClick={() => navigate(`/edit-customer/${id}`)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Hero card — original white theme */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl rounded-full -z-0 translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md">
            {initial}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{displayName}</h1>
              <span className={`w-fit mx-auto md:mx-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${customer.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                {customer.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5">
              {isBiz ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {isBiz ? `Business Account • POC: ${customer.name}` : 'Individual Account'}
              {customer.id && <span className="ml-1 font-mono text-slate-400 text-[10px]">• {customer.id}</span>}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
              {customer.mobile && (
                <a href={`tel:${customer.mobile}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />{customer.mobile}
                </a>
              )}
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />{customer.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation bar */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => goTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Active tab content — rendered by React Router via Outlet */}
      <Outlet context={outletCtx} />
    </div>
  );
}
