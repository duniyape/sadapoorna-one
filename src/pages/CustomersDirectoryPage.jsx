import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Phone, FileText, Edit2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function CustomersDirectoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/customer/list?limit=100');
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            setCustomers(json.data.map(c => ({
              id: c.id || c.mongo_id,
              name: c.company_name || c.name || 'Unknown',
              owner: c.name || 'N/A',
              beat: c.branch_id || 'N/A', 
              phone: c.mobile || 'N/A',
              limit: '₹0', 
              balance: '₹0',
              status: c.status || 'Active'
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Directory</h1>
            <p className="text-xs text-slate-500">Registered grain buyers and accounts ledger</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-customer')}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500 font-bold text-sm">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="py-10 text-center text-slate-500 font-bold text-sm bg-slate-50 rounded-2xl border border-slate-200">No customers found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {customers.map((c, i) => (
            <div key={c.id || i} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 font-bold flex items-center justify-center text-base">
                {c.name.charAt(0)}
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {c.status}
              </span>
            </div>

            <h3 className="font-bold text-sm text-slate-900 truncate">{c.name}</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">{c.owner} • {c.beat}</p>

            <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-500">
                <span>Credit Limit:</span>
                <span className="font-bold text-slate-800">{c.limit}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Outstanding:</span>
                <span className="font-bold text-rose-600">{c.balance}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => showToast(`Dialed ${c.phone}`)} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Call Client
              </button>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/edit-customer/${c.id}`)} className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors" title="Edit Customer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/edit-customer/${c.id}?view=true`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="View Details">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
