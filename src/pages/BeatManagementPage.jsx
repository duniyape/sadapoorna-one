import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Plus, Edit2, Search, Filter, X, Save, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function BeatManagementPage() {
  const { showToast } = useOutletContext();
  const [beats, setBeats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dayFilter, setDayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBeatId, setCurrentBeatId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    beat_name: '',
    day: '',
    user_id: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchBeats();
  }, [dayFilter, statusFilter, userFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/users/get', { headers });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBeats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      let url = '/beats/beats/?';
      if (dayFilter) url += `day=${dayFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (userFilter) url += `user_id=${userFilter}&`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        setBeats(json.data || []);
      } else {
        showToast("Failed to load beats");
      }
    } catch (error) {
      console.error(error);
      showToast("Error fetching beats");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      beat_name: '',
      day: '',
      user_id: '',
      status: 'ACTIVE'
    });
    setIsEditing(false);
    setCurrentBeatId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (beat) => {
    setFormData({
      beat_name: beat.beat_name || '',
      day: beat.day || '',
      user_id: beat.user_id || '',
      status: beat.status || 'ACTIVE'
    });
    setIsEditing(true);
    setCurrentBeatId(beat.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.beat_name || !formData.day || !formData.user_id) {
      showToast("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const url = isEditing ? `/beats/beats/${currentBeatId}` : `/beats/beats/create`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast(isEditing ? "Beat updated successfully" : "Beat created successfully");
        closeModal();
        fetchBeats();
      } else {
        const errMsg = json.detail ? (Array.isArray(json.detail) ? json.detail[0]?.msg : json.detail) : "Validation failed";
        showToast(`Failed: ${errMsg}`);
      }
    } catch (error) {
      console.error(error);
      showToast("Error saving beat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-6 h-6 text-indigo-600" />
            Beat Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage sales routes for field executives</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Beat
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
          <Filter className="w-4 h-4" /> Filters:
        </div>

        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Days</option>
          {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by User ID"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Beat Name</th>
                <th className="p-4">Day</th>
                <th className="p-4">Assigned User</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading beats...</td>
                </tr>
              ) : beats.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No beats found matching the criteria.</td>
                </tr>
              ) : (
                beats.map((beat) => (
                  <tr key={beat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{beat.beat_name}</td>
                    <td className="p-4">{beat.day}</td>
                    <td className="p-4 text-slate-700 font-semibold text-xs">
                      {beat.user_name || beat.user_id}
                    </td>
                    <td className="p-4">
                      {beat.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                          <XCircle className="w-3 h-3" /> INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEditModal(beat)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Beat"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Beat' : 'Create New Beat'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Beat Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="beat_name"
                  value={formData.beat_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. North Zone Route A"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Day <span className="text-rose-500">*</span>
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>Select Day</option>
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned User <span className="text-rose-500">*</span>
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
                >
                  <option value="" disabled>Select User</option>
                  {users.map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name || u.first_name || 'Unnamed'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-bold"
                >
                  <option value="ACTIVE" className="text-emerald-600 font-bold">ACTIVE</option>
                  <option value="INACTIVE" className="text-rose-600 font-bold">INACTIVE</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed inline-flex justify-center items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Beat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
