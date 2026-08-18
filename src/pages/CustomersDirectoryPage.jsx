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

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        let url = '/customer/list?limit=100';
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
              beat: c.branch_id || 'N/A', 
              phone: c.mobile || 'N/A',
              email: c.email || 'N/A',
              status: c.status || 'active',
              assigned_employee_id: c.assigned_employee_id || null
            })));
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
  }, [selectedEmployeeFilter, user]);

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
  
  const filterOptions = user?.access_tree?.access ? getFilterOptions(user.access_tree.access) : [];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployeeFilter === 'all' || c.assigned_employee_id === selectedEmployeeFilter;
    return matchesSearch && matchesEmployee;
  });

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        {filterOptions.length > 0 && (
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer relative"
            >
              <option value="all">All Employees</option>
              {user && <option value={user.id || user._id}>Me ({user.name})</option>}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCustomers.map((c, i) => (
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
                <span>Type:</span>
                <span className="font-bold text-slate-800 capitalize">{c.type}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Email:</span>
                <span className="font-bold text-slate-800 truncate ml-2" title={c.email}>{c.email}</span>
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
                <button onClick={() => navigate(`/view-customer/${c.id}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600" title="View Details">
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
