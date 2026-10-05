import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Activity, Calendar, Users, MapPin, CheckCircle, Navigation, Clock, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_URL = getApiBaseUrl();

export default function VisitReportsPage() {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();
  
  
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | logs
  
  // Format today's date as YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getTodayStr());
  
  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState([]);
  const [dashboardDay, setDashboardDay] = useState('');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  
  // Drill-down state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  
  // Logs state
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('');

  const fetchDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await fetch(`${API_URL}/visits/admin/dashboard?target_date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDashboardStats(data.data || []);
        setDashboardDay(data.day || '');
      } else {
        showToast(data.detail || data.message || "Failed to fetch dashboard", "error");
      }
    } catch (err) {
      showToast("Error fetching dashboard", "error");
    }
    setIsLoadingDashboard(false);
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`${API_URL}/visits/logs?start_date=${date}&end_date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      showToast("Error fetching logs", "error");
    }
    setIsLoadingLogs(false);
  };

  const fetchEmployeeDay = async (empId, empName) => {
    setIsLoadingEmployee(true);
    setSelectedEmployee({ id: empId, name: empName });
    try {
      const res = await fetch(`${API_URL}/visits/admin/employee-day?employee_id=${empId}&target_date=${date}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmployeeTasks(data.data || []);
      } else {
        showToast("Failed to fetch employee details", "error");
        setSelectedEmployee(null);
      }
    } catch (err) {
      showToast("Error fetching employee details", "error");
      setSelectedEmployee(null);
    }
    setIsLoadingEmployee(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      if (!selectedEmployee) fetchDashboard();
      else fetchEmployeeDay(selectedEmployee.id, selectedEmployee.name);
    } else {
      fetchLogs();
    }
  }, [activeTab, date]);

  const renderDashboard = () => {
    if (selectedEmployee) {
      return (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <button 
            onClick={() => setSelectedEmployee(null)}
            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Team
          </button>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">{selectedEmployee.name}'s Day</h2>
              <p className="text-slate-500 font-medium text-sm mt-1">{dashboardDay}, {date}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-100">
              {employeeTasks.filter(t => t.visited).length} / {employeeTasks.length} Completed
            </div>
          </div>

          {isLoadingEmployee ? (
            <div className="text-center py-10"><Clock className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></div>
          ) : employeeTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">No beats assigned for this day.</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
              {employeeTasks.map(task => (
                <div key={task.customer_id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${task.visited ? 'bg-emerald-50/30' : ''}`}>
                  <div className="flex-1 min-w-0 flex items-start gap-3">
                    <div className={`w-8 h-8 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${task.visited ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {task.visited ? <CheckCircle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate flex items-center gap-2">
                        {task.company_name ? `${task.company_name} (${task.customer_name})` : task.customer_name}
                      </h3>
                      {task.address && <p className="text-xs text-slate-500 font-medium mt-1 truncate max-w-[300px]">{typeof task.address === 'object' ? task.address.city : task.address}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {task.total_due !== undefined && task.total_due !== null && (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 text-[10px]">
                            Due: ₹{task.total_due}
                          </span>
                        )}
                        {task.max_dpd !== undefined && task.max_dpd !== null && task.max_dpd > 0 && (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px]">
                            DPD: {task.max_dpd}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {task.visited ? (
                    <div className="bg-white px-4 py-2 rounded-xl border border-emerald-100 shrink-0 min-w-[200px]">
                      <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">{task.visit_details?.outcome}</p>
                      <p className="text-xs font-medium text-slate-600">{task.visit_details?.remark || 'No remark'}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{task.visit_details?.time ? new Date(task.visit_details.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}</p>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold shrink-0">Pending</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {isLoadingDashboard ? (
          <div className="text-center py-20"><Clock className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>
        ) : dashboardStats.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100 font-bold">
            No beats scheduled for this date.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardStats.map(stat => (
              <div 
                key={stat.employee_id} 
                onClick={() => fetchEmployeeDay(stat.employee_id, stat.employee_name)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      {stat.employee_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{stat.employee_name}</h3>
                      <p className="text-xs font-medium text-slate-500">{stat.visited_customers} / {stat.total_customers} Done</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wider ${stat.completion_percentage === 100 ? 'bg-emerald-100 text-emerald-700' : stat.completion_percentage > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {stat.completion_percentage}%
                  </div>
                </div>
                
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${stat.completion_percentage === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${stat.completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const filteredLogs = logs.filter(l => 
    (l.employee_name || '').toLowerCase().includes(logFilter.toLowerCase()) ||
    (l.customer_name || '').toLowerCase().includes(logFilter.toLowerCase()) ||
    (l.outcome || '').toLowerCase().includes(logFilter.toLowerCase())
  );

  const renderLogs = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Filter by employee, customer, or outcome..."
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>
      
      {isLoadingLogs ? (
        <div className="text-center py-20"><Clock className="w-8 h-8 animate-spin mx-auto text-emerald-500" /></div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-bold">No visit logs found for this date.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Outcome</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-bold text-slate-600 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-700">
                    {log.employee_name}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-800">
                    {log.customer_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                      {log.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium min-w-[200px]">
                    {log.remark || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            Visit Reports
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Monitor team visit performance and activity logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedEmployee(null);
              }}
              className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {!selectedEmployee && (
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All Logs
          </button>
        </div>
      )}

      {activeTab === 'dashboard' ? renderDashboard() : renderLogs()}
      
    </div>
  );
}
