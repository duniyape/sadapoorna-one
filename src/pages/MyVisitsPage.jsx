import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, Search, Navigation, UserCircle, Map, Building2, Smartphone } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_URL = getApiBaseUrl();

export default function MyVisitsPage() {
  const { showToast, user } = useOutletContext();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [day, setDay] = useState('');
  const [stats, setStats] = useState({ total: 0, visited: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [outcome, setOutcome] = useState('Order Taken');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const OUTCOME_OPTIONS = [
    "Order Taken",
    "Payment Collected",
    "Shop Closed",
    "Owner Not Available",
    "Not Interested",
    "Follow-up Later",
    "Other"
  ];

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/visits/my-tasks-today`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.data || []);
        setDay(data.day || '');
        setStats({ total: data.total_customers || 0, visited: data.visited_count || 0 });
      } else {
        showToast(data.detail || data.message || "Failed to fetch tasks", "error");
      }
    } catch (err) {
      showToast("Network error while fetching tasks", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, []);

  const handleRecordVisit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: selectedTask.customer_id,
        outcome: outcome,
        remark: remark,
        lat: currentLocation?.lat || null,
        lng: currentLocation?.lng || null
      };
      
      const res = await fetch(`${API_URL}/visits/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Visit recorded successfully!", "success");
        setSelectedTask(null);
        setOutcome('Order Taken');
        setRemark('');
        fetchTasks();
      } else {
        showToast(data.detail || data.message || "Failed to record visit", "error");
      }
    } catch (err) {
      showToast("Error recording visit", "error");
    }
    setIsSubmitting(false);
  };

  const filteredTasks = tasks.filter(t => {
    const term = searchQuery.toLowerCase();
    return (
      (t.company_name || '').toLowerCase().includes(term) ||
      (t.customer_name || '').toLowerCase().includes(term) ||
      (t.phone || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* Header section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-600" />
            My Daily Beats
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {day ? `Today is ${day}` : 'Loading schedule...'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-orange-50 px-5 py-3 rounded-2xl border border-orange-100">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Total</p>
            <p className="text-xl font-black text-orange-700">{stats.total}</p>
          </div>
          <div className="w-px h-8 bg-orange-200"></div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Visited</p>
            <p className="text-xl font-black text-emerald-700">{stats.visited}</p>
          </div>
          <div className="w-px h-8 bg-orange-200"></div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending</p>
            <p className="text-xl font-black text-slate-700">{Math.max(0, stats.total - stats.visited)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Clock className="w-8 h-8 animate-spin mb-4 text-orange-500" />
            <p className="font-bold">Loading your beat plan...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Map className="w-12 h-12 mb-4 text-slate-200" />
            <p className="font-bold text-lg text-slate-500">No customers found</p>
            <p className="text-sm">You either have no beats assigned for today, or search returned no results.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div key={task.customer_id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50 ${task.visited_today ? 'bg-slate-50/50' : ''}`}>
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${task.visited_today ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {task.visited_today ? <CheckCircle className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-base truncate flex items-center gap-2">
                      {task.company_name ? (
                        <>
                          <span className="text-slate-900">{task.company_name}</span>
                          {task.customer_name && <span className="text-slate-400 text-xs">({task.customer_name})</span>}
                        </>
                      ) : (
                        <span className="text-slate-900">{task.customer_name || 'Unknown'}</span>
                      )}
                      {task.visited_today && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] uppercase tracking-wider font-black shrink-0">Done</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                      {task.phone && (
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" /> {task.phone}
                        </span>
                      )}
                      {task.address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]" title={typeof task.address === 'object' ? task.address.address : task.address}>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                          {typeof task.address === 'object' ? [task.address.address, task.address.city].filter(Boolean).join(', ') : task.address}
                        </span>
                      )}
                      {task.total_due !== undefined && task.total_due !== null && (
                        <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          Due: ₹{task.total_due}
                        </span>
                      )}
                      {task.max_dpd !== undefined && task.max_dpd !== null && task.max_dpd > 0 && (
                        <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          DPD: {task.max_dpd}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button 
                    onClick={() => navigate(`/view-customer/${task.customer_id}`)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <UserCircle className="w-4 h-4" /> Profile
                  </button>
                  {!task.visited_today && (
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-orange-200 transition-colors flex items-center gap-1"
                    >
                      <Navigation className="w-4 h-4" /> Mark Visit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Visit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800">Record Visit</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {selectedTask.company_name || selectedTask.customer_name}
              </p>
            </div>
            
            <form onSubmit={handleRecordVisit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visit Outcome *</label>
                <select 
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  {OUTCOME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks / Notes</label>
                <textarea 
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Any details about the visit..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                ></textarea>
              </div>

              {(!currentLocation?.lat) && (
                <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Location is not available. Please allow location access for accurate check-ins.</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-200 transition-colors flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isSubmitting ? 'Saving...' : 'Save Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
