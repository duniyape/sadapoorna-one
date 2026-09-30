import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Phone, FileText, Edit2, ShieldAlert, ShieldCheck, Search, Filter, ChevronRight, Users } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function BulkCustomerTransferPage() {
  const navigate = useNavigate();
  const { showToast, user } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [branches, setBranches] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; // Use a higher limit for bulk operations

  const [selectedCustomerIds, setSelectedCustomerIds] = useState(new Set());
  const [showBulkTransferModal, setShowBulkTransferModal] = useState(false);
  const [bulkTransferEmployeeId, setBulkTransferEmployeeId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const [branchRes, empRes] = await Promise.all([
          fetch('/branches/v1', { headers }),
          fetch('/users/get', { headers })
        ]);
        if (branchRes.ok) {
          const data = await branchRes.json();
          setBranches(data.data || data || []);
        }
        if (empRes.ok) {
          const data = await empRes.json();
          setAllEmployees(data.data || data.users || data || []);
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        let url = `/customer/list?limit=${limit}&page=${page}&sort=created_at&order=desc`;
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        if (selectedBranchFilter !== 'all') {
          url += `&branch_id=${selectedBranchFilter}`;
        }

        let allowedIds = new Set();
        if (user && selectedEmployeeFilter === 'all') {
          const rawOptions = user.access_tree?.access ? getFilterOptions(user.access_tree.access) : [];
          rawOptions.forEach(opt => allowedIds.add(opt.id));
          if (user.id || user._id) allowedIds.add(user.id || user._id);
        } else if (selectedEmployeeFilter !== 'all') {
          allowedIds.add(selectedEmployeeFilter);
        }

        if (allowedIds.size > 0) {
          const commaSeparatedIds = Array.from(allowedIds).join(',');
          url += `&assigned_employee_id=${commaSeparatedIds}`;
        }
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.status && json.data) {
            setCustomers(json.data.map(c => ({
              mongo_id: c._id || c.mongo_id || (c.id && c.id.length === 24 ? c.id : null), // strictly capture 24-char hex if possible
              id: c.id || c.mongo_id,
              name: c.company_name || c.name || 'Unknown',
              owner: c.name || 'N/A',
              type: c.customer_type || 'business',
              customer_id: c.id || c.customer_id || 'N/A', 
              phone: c.mobile || 'N/A',
              email: c.email || 'N/A',
              status: c.status || 'active',
              assigned_employee_id: c.assigned_employee_id || null
            })));
            if (json.pagination) {
              setTotalPages(json.pagination.total_pages || 1);
            }
          } else {
            setCustomers([]);
          }
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error("Failed to fetch customers", err);
      } finally {
        setIsLoading(false);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedEmployeeFilter, selectedBranchFilter, user, page, searchTerm]);

  const getFilterOptions = (accessList) => {
    if (!accessList || !Array.isArray(accessList)) return [];
    let result = [];
    const traverse = (nodes) => {
      nodes.forEach(node => {
        result.push({ id: node.id, name: node.name });
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(accessList);
    const unique = [];
    const seen = new Set();
    for (const item of result) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  };
  
  const rawFilterOptions = user?.access_tree?.access ? getFilterOptions(user.access_tree.access) : [];
  
  // We will simply use allEmployees for the filter dropdown
  const filterOptions = selectedBranchFilter === 'all'
    ? allEmployees
    : allEmployees.filter(emp => {
        const empBranchId = emp.branch?.id || emp.branch?._id || emp.branch || emp.branch_id;
        return empBranchId === selectedBranchFilter;
      });

  const filteredCustomers = customers;

  const handleToggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds(prev => {
      const next = new Set(prev);
      if (next.has(customerId)) next.delete(customerId);
      else next.add(customerId);
      return next;
    });
  };

  const handleBulkTransferSubmit = async () => {
    if (!bulkTransferEmployeeId) {
      showToast('Please select a new assigned employee', 'error');
      return;
    }
    setIsTransferring(true);
    try {
      const payload = {
        customer_ids: Array.from(selectedCustomerIds),
        new_employee_id: bulkTransferEmployeeId
      };
      console.log('Sending bulk transfer payload:', payload);
      const res = await fetch('/customer/bulk-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        showToast('Customers transferred successfully', 'success');
        setSelectedCustomerIds(new Set());
        setShowBulkTransferModal(false);
        setPage(1); 
        setSearchTerm(searchTerm + ' '); setTimeout(() => setSearchTerm(searchTerm), 10);
      } else {
        showToast(data?.detail || 'Failed to transfer customers', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error transferring customers', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bulk Customer Transfer</h1>
            <p className="text-xs text-slate-500">Select customers and assign them to a different associate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {branches.length > 0 && (
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => {
                setSelectedBranchFilter(e.target.value);
                setSelectedEmployeeFilter('all');
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        {allEmployees.length > 0 && (
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => {
                setSelectedEmployeeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
            >
              <option value="all">All Associates</option>
              {filterOptions.map(opt => (
                <option key={opt.id || opt._id} value={opt.id || opt._id}>{opt.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-slate-500 font-bold text-sm">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-10 text-center text-slate-500 font-bold text-sm bg-slate-50 rounded-2xl border border-slate-200">No customers found.</div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {/* Header Row */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0">
                <input
                  type="checkbox"
                  checked={filteredCustomers.length > 0 && selectedCustomerIds.size === filteredCustomers.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = filteredCustomers.map(c => c.mongo_id || c.id).filter(Boolean);
                      setSelectedCustomerIds(new Set(allIds));
                    } else {
                      setSelectedCustomerIds(new Set());
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
              <div className="w-48 shrink-0">Customer</div>
              <div className="w-32 shrink-0">Customer ID</div>
              <div className="w-20 shrink-0">Status</div>
              <div className="w-24 shrink-0">Phone</div>
              <div className="flex-1 min-w-[150px]">Current Associate</div>
            </div>
            
            {filteredCustomers.map((c, i) => {
              const currentEmployee = allEmployees.find(emp => (emp.id || emp._id) === c.assigned_employee_id);
              
              return (
                <div 
                  key={c.mongo_id || c.id || i} 
                  className={`flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl border shadow-sm hover:shadow-md transition-all text-xs group ${
                    c.status === 'inactive' ? 'bg-slate-50 border-slate-200 opacity-75 grayscale-[20%]' : 'bg-white border-slate-100'
                  } ${selectedCustomerIds.has(c.mongo_id || c.id) ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/10' : ''}`}
                >
                  
                  {/* Checkbox (Desktop & Mobile) */}
                  <div className="w-full lg:w-8 shrink-0 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.has(c.mongo_id || c.id)}
                      onChange={() => handleToggleCustomerSelection(c.mongo_id || c.id)}
                      className="w-5 h-5 lg:w-4 lg:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Mobile Top Row / Desktop Left side */}
                  <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-[150px] lg:w-[150px] overflow-hidden">
                      <div className="font-bold text-slate-800 text-xs truncate" title={c.name}>{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate" title={c.owner}>{c.owner}</div>
                    </div>

                    <div className="lg:hidden shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 
                        c.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Only Customer ID & Status */}
                  <div className="hidden lg:block w-32 shrink-0 text-slate-500 font-medium truncate" title={c.customer_id}>
                    {c.customer_id}
                  </div>

                  <div className="hidden lg:block w-20 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 
                      c.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  
                  {/* Phone */}
                  <div className="hidden lg:block w-24 shrink-0 text-slate-600 font-medium">
                    {c.phone}
                  </div>

                  {/* Current Associate */}
                  <div className="hidden lg:flex items-center gap-1.5 flex-1 min-w-[150px] text-slate-600 text-[11px] truncate">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {currentEmployee ? currentEmployee.name : 'Unassigned'}
                  </div>
                  
                  {/* Mobile View Additions */}
                  <div className="flex flex-col gap-1 lg:hidden w-full pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">ID:</span>
                      <span className="font-bold text-slate-700">{c.customer_id}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-bold text-slate-700">{c.phone}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Associate:</span>
                      <span className="font-bold text-slate-700">{currentEmployee ? currentEmployee.name : 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  Previous
                </button>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Bottom Bar when items are selected */}
      {selectedCustomerIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:left-64 z-40">
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl shadow-2xl shadow-indigo-900/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{selectedCustomerIds.size} Customers Selected</div>
                <div className="text-xs text-slate-400">Ready to transfer to new associate</div>
              </div>
            </div>
            <button
              onClick={() => setShowBulkTransferModal(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all text-sm"
            >
              Transfer Customers
            </button>
          </div>
        </div>
      )}

      {/* Bulk Transfer Modal */}
      {showBulkTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Transfer {selectedCustomerIds.size} Customers</h3>
              <button onClick={() => setShowBulkTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-5 h-5 rotate-180 opacity-0 hidden" /> {/* spacer */}
                &times;
              </button>
            </div>
            <div className="p-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                New Assigned Employee *
              </label>
              <select
                value={bulkTransferEmployeeId}
                onChange={(e) => setBulkTransferEmployeeId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select Employee...</option>
                {allEmployees.map(emp => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name} ({emp.branch?.name || emp.branch || 'No Branch'})
                  </option>
                ))}
              </select>
              
              <div className="mt-6 flex items-center gap-3 justify-end">
                <button
                  onClick={() => setShowBulkTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkTransferSubmit}
                  disabled={isTransferring || !bulkTransferEmployeeId}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  {isTransferring ? 'Transferring...' : 'Transfer Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
