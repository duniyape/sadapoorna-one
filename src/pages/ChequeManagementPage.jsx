import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Landmark, ShieldCheck, AlertTriangle, FileText, ArrowDownToLine, RefreshCcw } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { fmtMoney, fmt, authHdr } from '../utils/customerHelpers';
import ReceiveChequeModal from '../components/ReceiveChequeModal';
import DepositChequeModal from '../components/DepositChequeModal';
import VerifyChequeModal from '../components/VerifyChequeModal';
import BounceChequeModal from '../components/BounceChequeModal';

export default function ChequeManagementPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [activeTab, setActiveTab] = useState('PENDING');
  const [cheques, setCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [receiveVoucher, setReceiveVoucher] = useState(null);
  const [depositVoucher, setDepositVoucher] = useState(null);
  const [verifyVoucher, setVerifyVoucher] = useState(null);
  const [bounceVoucher, setBounceVoucher] = useState(null);

  const fetchCheques = async () => {
    setIsLoading(true);
    try {
      // If ALL is selected, don't pass verification_status param
      const url = activeTab === 'ALL' 
        ? '/accounting/vouchers?voucher_mode=Bank' 
        : `/accounting/vouchers?voucher_mode=Bank&verification_status=${activeTab}`;
        
      const res = await fetch(url, {
        headers: authHdr()
      });
      if (res.ok) {
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        // Filter client-side by payment_mode == "CHEQUE" or if cheque_no exists
        const filtered = data.filter(v => v.payment_mode?.toUpperCase() === 'CHEQUE' || v.cheque_no || v.cheque_ref);
        setCheques(filtered);
      } else {
        showToast("Failed to fetch cheques");
      }
    } catch (err) {
      console.error("Failed to fetch cheques", err);
      showToast("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, [activeTab]);

  const handleSuccess = (msg) => {
    showToast(msg);
    setReceiveVoucher(null);
    setDepositVoucher(null);
    setVerifyVoucher(null);
    setBounceVoucher(null);
    fetchCheques();
  };

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Cheque Management</h1>
          <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Accounting & Finance</p>
        </div>
        <button 
          onClick={fetchCheques} 
          disabled={isLoading}
          className="ml-auto p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all ${
              activeTab === 'PENDING' ? 'bg-white border-b-2 border-indigo-500 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowDownToLine className={`w-4 h-4 ${activeTab === 'PENDING' ? 'text-indigo-500' : 'text-slate-400'}`} />
              <span className="text-xs font-black uppercase tracking-wider">Driver Handover</span>
            </div>
            <span className="text-[10px] font-bold mt-1 opacity-70">PENDING (In Transit)</span>
          </button>

          <button
            onClick={() => setActiveTab('RECEIVED')}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all border-l border-slate-100 ${
              activeTab === 'RECEIVED' ? 'bg-white border-b-2 border-amber-500 text-amber-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${activeTab === 'RECEIVED' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-xs font-black uppercase tracking-wider">In Office Safe</span>
            </div>
            <span className="text-[10px] font-bold mt-1 opacity-70">RECEIVED</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPOSITED')}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all border-l border-slate-100 ${
              activeTab === 'DEPOSITED' ? 'bg-white border-b-2 border-emerald-500 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Landmark className={`w-4 h-4 ${activeTab === 'DEPOSITED' ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="text-xs font-black uppercase tracking-wider">In Bank Clearing</span>
            </div>
            <span className="text-[10px] font-bold mt-1 opacity-70">DEPOSITED</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 flex flex-col items-center justify-center p-4 transition-all border-l border-slate-100 ${
              activeTab === 'ALL' ? 'bg-white border-b-2 border-slate-700 text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${activeTab === 'ALL' ? 'text-slate-700' : 'text-slate-400'}`} />
              <span className="text-xs font-black uppercase tracking-wider">All Cheques</span>
            </div>
            <span className="text-[10px] font-bold mt-1 opacity-70">LIFECYCLE</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : cheques.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-bold">No cheques found in this stage.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6 font-semibold">
                    {activeTab === 'DEPOSITED' ? 'Deposited On' : 'Date'}
                  </th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Cheque Details</th>
                  <th className="p-4 font-semibold text-right">Amount (₹)</th>
                  <th className="p-4 font-semibold">
                    {activeTab === 'ALL' ? 'Status' : activeTab === 'PENDING' ? 'Collected By' : activeTab === 'RECEIVED' ? 'Location' : 'Slip Ref'}
                  </th>
                  <th className="p-4 pr-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700">
                {cheques.map(c => (
                  <tr key={c._id || c.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 pl-6 font-bold whitespace-nowrap">
                      {fmt(activeTab === 'DEPOSITED' ? (c.deposit_date || c.date) : c.date)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{c.customer_name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-500">{c.voucher_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">#{c.cheque_no || c.cheque_ref}</p>
                      <p className="text-[10px] font-bold text-indigo-500">{c.cheque_bank || 'Bank'}</p>
                      {c.cheque_date && <p className="text-[10px] text-slate-500">Dt: {fmt(c.cheque_date)}</p>}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-black text-slate-900 text-sm">₹{c.amount?.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      {activeTab === 'ALL' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md font-bold text-[10px] uppercase ${
                          c.verification_status === 'PENDING' ? 'bg-slate-100 text-slate-700' :
                          c.verification_status === 'RECEIVED' ? 'bg-amber-50 text-amber-700' :
                          c.verification_status === 'DEPOSITED' ? 'bg-indigo-50 text-indigo-700' :
                          c.verification_status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' :
                          c.verification_status === 'BOUNCED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {c.verification_status || 'Unknown'}
                        </span>
                      )}
                      {activeTab === 'PENDING' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {c.created_by || 'Staff'}
                        </span>
                      )}
                      {activeTab === 'RECEIVED' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] uppercase">
                          Office Safe
                        </span>
                      )}
                      {activeTab === 'DEPOSITED' && (
                        <span className="font-bold text-slate-700">
                          {c.deposit_slip_ref || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === 'ALL' ? (
                          <span className="text-slate-400 text-xs italic">- View Only -</span>
                        ) : (
                          <>
                            {activeTab === 'PENDING' && (
                              <button 
                                onClick={() => setReceiveVoucher(c)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Receive in Office
                              </button>
                            )}
                            {activeTab === 'RECEIVED' && (
                              <button 
                                onClick={() => setDepositVoucher(c)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
                              >
                                <Landmark className="w-3.5 h-3.5" />
                                Deposit in Bank
                              </button>
                            )}
                            {activeTab === 'DEPOSITED' && (
                              <>
                                <button 
                                  onClick={() => setVerifyVoucher(c)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 flex items-center gap-1.5 transition-colors"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Clear / Verify
                                </button>
                                <button 
                                  onClick={() => setBounceVoucher(c)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Bounce
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {receiveVoucher && <ReceiveChequeModal voucher={receiveVoucher} onClose={() => setReceiveVoucher(null)} onSuccess={handleSuccess} />}
      {depositVoucher && <DepositChequeModal voucher={depositVoucher} onClose={() => setDepositVoucher(null)} onSuccess={handleSuccess} />}
      {verifyVoucher && <VerifyChequeModal voucher={verifyVoucher} onClose={() => setVerifyVoucher(null)} onSuccess={handleSuccess} />}
      {bounceVoucher && <BounceChequeModal voucher={bounceVoucher} onClose={() => setBounceVoucher(null)} onSuccess={handleSuccess} />}
    </div>
  );
}
