import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, AlertCircle, Wallet, 
  ArrowUpRight, ArrowDownLeft, Clock, FileText,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { authHdr, fmt, fmtMoney, Skeleton } from '../utils/customerHelpers';

export default function DueCollectionsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('total_outstanding');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchDueCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        include_bills: 'false'
      });
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/accounting/customers/due?${params}`, {
        headers: authHdr()
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        setData(json.data || []);
        setSummary(json.summary || null);
        setPagination(json.pagination || null);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to fetch due customers", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDueCustomers();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchDueCustomers]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && (!pagination || newPage <= pagination.total_pages)) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-600" />
              Due Collections
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Portfolio Receivables & Outstanding
            </p>
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Receivables</p>
            <div className="flex items-end gap-2">
              <Wallet className="w-8 h-8 text-indigo-500 mb-1 opacity-20 absolute right-6" />
              <p className="text-3xl font-black text-indigo-700">{fmtMoney(summary.total_receivables)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Overdue</p>
            <div className="flex items-end gap-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-1 opacity-20 absolute right-6" />
              <p className="text-3xl font-black text-rose-600">{fmtMoney(summary.total_overdue)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Open Invoices</p>
            <p className="text-3xl font-black text-slate-800">{summary.total_open_invoices}</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-3xl shadow-xl flex flex-col gap-2 text-white relative overflow-hidden">
            <div className="absolute -bottom-2 -right-2 opacity-10">
              <Clock className="w-24 h-24 text-white" />
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Customers in Deficit</p>
            <p className="text-3xl font-black text-white">{summary.total_customers_with_dues}</p>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search customer name, phone, ID..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-transparent border-none text-xs font-bold text-slate-700 py-1.5 pl-2 pr-6 focus:ring-0 cursor-pointer"
            >
              <option value="total_outstanding">Highest Outstanding</option>
              <option value="total_overdue">Highest Overdue</option>
              <option value="max_dpd">Max DPD (Days Past Due)</option>
              <option value="oldest_due_date">Oldest Due Date</option>
            </select>
          </div>
          
          <button 
            onClick={() => { setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); setPage(1); }}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 font-black text-xs px-4 transition-colors"
          >
            {sortOrder.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[9px] border-b-2 border-slate-100">
              <tr>
                <th className="p-5">Customer Info</th>
                <th className="p-5 text-right">Outstanding</th>
                <th className="p-5 text-center">Aging / Oldest Due</th>
                <th className="p-5 text-center">DPD</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-bold text-lg">No Due Customers Found</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                data.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Customer Info */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-inner shrink-0">
                          {c.customer_name?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 tracking-wide text-[13px]">{c.customer_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {c.custom_id && (
                              <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                                {c.custom_id}
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-slate-500">
                              {c.phone || c.company_name || 'No Phone'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Outstanding */}
                    <td className="p-5 text-right">
                      <p className="font-black text-lg text-slate-900">{fmtMoney(c.total_outstanding)}</p>
                      {c.total_overdue > 0 && (
                        <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                          {fmtMoney(c.total_overdue)} Overdue
                        </p>
                      )}
                    </td>

                    {/* Aging / Oldest Due */}
                    <td className="p-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                          Oldest Bill: {c.oldest_bill_date ? fmt(c.oldest_bill_date) : '-'}
                        </span>
                        {c.aging_buckets && (
                          <div className="flex items-center gap-1">
                            <span title={`Current: ${fmtMoney(c.aging_buckets.current)}`} className={`w-2 h-2 rounded-full ${c.aging_buckets.current > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            <span title={`1-30 Days: ${fmtMoney(c.aging_buckets.days_1_30)}`} className={`w-2 h-2 rounded-full ${c.aging_buckets.days_1_30 > 0 ? 'bg-amber-400' : 'bg-slate-200'}`} />
                            <span title={`31-60 Days: ${fmtMoney(c.aging_buckets.days_31_60)}`} className={`w-2 h-2 rounded-full ${c.aging_buckets.days_31_60 > 0 ? 'bg-orange-500' : 'bg-slate-200'}`} />
                            <span title={`61-90 Days: ${fmtMoney(c.aging_buckets.days_61_90)}`} className={`w-2 h-2 rounded-full ${c.aging_buckets.days_61_90 > 0 ? 'bg-rose-400' : 'bg-slate-200'}`} />
                            <span title={`90+ Days: ${fmtMoney(c.aging_buckets.days_90_plus)}`} className={`w-2 h-2 rounded-full ${c.aging_buckets.days_90_plus > 0 ? 'bg-rose-600' : 'bg-slate-200'}`} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DPD */}
                    <td className="p-5 text-center">
                      <div className="inline-block px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-black text-slate-700">{c.max_dpd}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-bold">Days</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => navigate(`/view-customer/${c.custom_id || c.customer_id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black tracking-wide shadow-md transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        LEDGER
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500">
              Showing Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.total_pages}</span>
              {' '} ({pagination.total_customers} Total)
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={!pagination.has_previous}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={!pagination.has_next}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-50 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
