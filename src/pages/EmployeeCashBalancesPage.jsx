import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Wallet, Search, Eye, Filter, ArrowDownLeft, ArrowUpRight, HandCoins } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { fmtMoney, fmt } from '../utils/customerHelpers';
import EmployeeCashSummaryModal from '../components/EmployeeCashSummaryModal';
import EmployeeCashHandoverModal from '../components/EmployeeCashHandoverModal';

export default function EmployeeCashBalancesPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [balances, setBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [handoverEmployee, setHandoverEmployee] = useState(null);

  const fetchBalances = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/accounting/employees/cash-balances', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setBalances(Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []));
        } else {
          let errMsg = "Failed to load cash balances";
          const err = await res.json().catch(() => ({}));
          if (typeof err.detail === 'string') errMsg = err.detail;
          else if (typeof err.message === 'string') errMsg = err.message;
          else if (Array.isArray(err.detail) && err.detail.length > 0 && err.detail[0].msg) errMsg = err.detail[0].msg;
          showToast(errMsg);
        }
    } catch (err) {
      console.error("Failed to fetch cash balances", err);
      showToast("Network error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const filteredBalances = useMemo(() => {
    if (!searchTerm.trim()) return balances;
    return balances.filter(b => 
      b.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone?.includes(searchTerm)
    );
  }, [balances, searchTerm]);

  // Calculations for top metrics
  const grandTotalCollected = balances.reduce((acc, curr) => acc + (curr.total_collected || 0), 0);
  const grandTotalHandedOver = balances.reduce((acc, curr) => acc + (curr.total_handed_over || 0), 0);
  const grandTotalInHand = balances.reduce((acc, curr) => acc + (curr.current_cash_in_hand || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            Employee Cash Balances
          </h1>
          <p className="text-xs text-slate-500">Live custody overview of all staff collections</p>
        </div>
      </div>

      {/* Global Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total System Collection</p>
            <p className="text-2xl font-black text-slate-900">{fmtMoney(grandTotalCollected)}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Handed Over (Bank)</p>
            <p className="text-2xl font-black text-slate-900">{fmtMoney(grandTotalHandedOver)}</p>
          </div>
        </div>
        
        <div className="bg-indigo-600 p-5 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-200 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Live Cash In Custody</p>
            <p className="text-2xl font-black">{fmtMoney(grandTotalInHand)}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4 text-right">Collected (Dr)</th>
                <th className="p-4 text-right">Handed Over (Cr)</th>
                <th className="p-4 text-right">Current Cash</th>
                <th className="p-4 text-center">Last Activity</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-slate-500 mt-2">Loading cash balances...</p>
                  </td>
                </tr>
              ) : filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-bold">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredBalances.map((b, i) => (
                  <tr key={b.employee_id || b.ledger_id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-900">{b.employee_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                          {b.role?.replace(/_/g, ' ') || 'Staff'}
                        </span>
                        {b.phone && <span className="text-[10px] text-slate-500">{b.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-slate-500">
                      {fmtMoney(b.total_collected)}
                    </td>
                    <td className="p-4 text-right font-black text-slate-500">
                      {fmtMoney(b.total_handed_over)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-3 py-1 rounded-lg font-black text-sm border ${
                        b.current_cash_in_hand > 0 
                          ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {fmtMoney(b.current_cash_in_hand)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-[10px] font-semibold text-slate-400">
                      {b.last_activity_date ? fmt(b.last_activity_date) : '-'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.current_cash_in_hand > 0 && (
                          <button 
                            onClick={() => setHandoverEmployee(b)} 
                            title="Record Handover"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <HandCoins className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedEmployeeId(b.employee_id || b.ledger_id)} 
                          title="View Summary"
                          className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal for single employee cash summary */}
      <EmployeeCashSummaryModal employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
      
      {/* Modal for recording cash handover */}
      {handoverEmployee && (
        <EmployeeCashHandoverModal 
          employee={handoverEmployee} 
          onClose={() => setHandoverEmployee(null)} 
          onSuccess={() => {
            setHandoverEmployee(null);
            showToast("Handover recorded successfully!");
            fetchBalances();
          }}
        />
      )}
    </div>
  );
}
