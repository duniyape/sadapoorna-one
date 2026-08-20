import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Phone, FileText, Edit2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

export default function CustomersDirectoryPage() {
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
  const limit = 5;

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
      if (!user) return;
      setIsLoading(true);
      try {
        let url = `/customer/list?limit=${limit}&page=${page}`;
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (selectedBranchFilter !== 'all') {
          url += `&branch_id=${selectedBranchFilter}`;
        }

        if (selectedEmployeeFilter !== 'all') {
          url += `&assigned_employee_id=${selectedEmployeeFilter}`;
        } else {
          // Flatten access_tree to get all allowed IDs for "all" selection
          const allowedIds = new Set();
          allowedIds.add(user.id || user._id);
          
          const traverse = (nodes) => {
            if (!nodes || !Array.isArray(nodes)) return;
            nodes.forEach(node => {
              allowedIds.add(node.id);
              if (node.children && node.children.length > 0) {
                traverse(node.children);
              }
            });
          };
          
          if (user.access_tree && user.access_tree.access) {
            traverse(user.access_tree.access);
          }
          
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
            setCustomers([]); // Clear if no data
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
    fetchCustomers();
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
    
    // Remove duplicates
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
  
  const branchEmployeeIds = new Set(
    allEmployees
      .filter(emp => {
        const empBranchId = emp.branch?.id || emp.branch?._id || emp.branch || emp.branch_id;
        return empBranchId === selectedBranchFilter;
      })
      .map(emp => emp.id || emp._id)
  );

  const filterOptions = selectedBranchFilter === 'all'
    ? rawFilterOptions
    : rawFilterOptions.filter(opt => branchEmployeeIds.has(opt.id));

  // Use server-side filtered customers directly
  const filteredCustomers = customers;

  const customerAccess = user?.access?.frontend_icons?.find(item => item.icon === 'customers')?.buttons || [];
  const canEdit = customerAccess.includes('Edit');
  const canView = customerAccess.includes('View');
  const canPhone = customerAccess.includes('Phone');
  const canFilterBranch = customerAccess.includes('Branch Filter');
  const canFilterEmployee = customerAccess.includes('Employee Filter');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer List</h1>
            <p className="text-xs text-slate-500">Registered grain buyers and accounts ledger</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/add-customer')}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Create Customer
        </button>
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

        {branches.length > 0 && canFilterBranch && (
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

        {filterOptions.length > 0 && canFilterEmployee && (
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
              <option value="all">All Employees</option>
              {user && (selectedBranchFilter === 'all' || branchEmployeeIds.has(user.id || user._id)) && (
                <option value={user.id || user._id}>Me ({user.name})</option>
              )}
              {filterOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
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
            {/* Header Row (Hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="w-8 shrink-0"></div>
              <div className="w-48 shrink-0">Customer</div>
              <div className="w-32 shrink-0">Customer ID</div>
              <div className="w-20 shrink-0">Status</div>
              <div className="w-24 shrink-0">Type</div>
              <div className="flex-1 min-w-[150px]">Email</div>
              <div className="w-28 shrink-0 text-right">Actions</div>
            </div>
            
            {filteredCustomers.map((c, i) => (
              <div key={c.id || i} className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-3 px-4 py-3 lg:py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-xs">
                
                {/* Mobile Top Row / Desktop Left side */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  {/* Avatar */}
                  <div className="w-10 h-10 lg:w-8 lg:h-8 rounded-lg bg-red-100 text-red-600 font-bold flex items-center justify-center text-sm shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  
                  {/* Name & Mobile Customer ID */}
                  <div className="flex-1 min-w-0 lg:w-48 lg:shrink-0 lg:flex-none">
                    <div className="font-bold text-slate-900 truncate text-sm lg:text-xs" title={c.name}>
                      {c.name}
                    </div>
                    <div className="lg:hidden text-slate-500 font-medium truncate mt-0.5 text-[10px]">
                      ID: {c.customer_id}
                    </div>
                  </div>

                  {/* Mobile Status */}
                  <div className="lg:hidden shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
                
                {/* Mobile Details Row / Desktop Middle */}
                <div className="flex items-center justify-between lg:justify-start lg:contents w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  <div className="flex items-center gap-4 lg:gap-3 lg:contents w-full">
                    {/* Type */}
                    <div className="w-auto lg:w-24 shrink-0 text-slate-600 capitalize font-medium truncate text-[11px] lg:text-xs">
                      <span className="lg:hidden text-slate-400 mr-1">Type:</span>{c.type}
                    </div>
                    
                    {/* Email */}
                    <div className="flex-1 lg:min-w-[150px] truncate text-slate-500 text-[11px] lg:text-xs" title={c.email}>
                      {c.email !== 'N/A' ? c.email : '-'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-auto lg:w-28 shrink-0 flex items-center justify-end gap-1">
                    {canPhone && (
                      <button onClick={() => showToast(`Dialed ${c.phone}`)} className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors" title="Call Client">
                        <Phone className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    )}
                    {canEdit && (
                      <button onClick={() => navigate(`/edit-customer/${c.id}`)} className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors" title="Edit Customer">
                        <Edit2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    )}
                    {canView && (
                      <button onClick={() => navigate(`/view-customer/${c.id}`)} className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600" title="View Details">
                        <FileText className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
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
    </div>
  );
}
