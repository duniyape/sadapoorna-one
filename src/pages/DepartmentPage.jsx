import React, { useState } from 'react';
import { ArrowLeft, Briefcase, User, Mail, CheckCircle, Save, Eye, Edit2, FileText, X, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function DepartmentPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    hod: '',
    email: '',
    description: '',
    status: 'Active'
  });

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Sales & Operations', hod: 'Ravi Kumar', email: 'sales@sadapoorna.com', description: 'Handles field sales and beat operations.', status: 'Active' },
    { id: 2, name: 'Human Resources', hod: 'Priya Sharma', email: 'hr@sadapoorna.com', description: 'Staff, payroll, and fleet management.', status: 'Active' },
    { id: 3, name: 'IT Support', hod: 'Vikram Singh', email: 'it@sadapoorna.com', description: 'Technical support and internal tooling.', status: 'Inactive' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [viewingDept, setViewingDept] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.hod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDepartments(departments.map(d => d.id === editingId ? { ...formData, id: editingId } : d));
      showToast(`Department '${formData.name}' updated successfully!`);
      setEditingId(null);
    } else {
      const newDept = { ...formData, id: Date.now() };
      setDepartments([...departments, newDept]);
      showToast(`Department '${formData.name}' created successfully!`);
    }
    setFormData({ name: '', hod: '', email: '', description: '', status: 'Active' });
  };

  const handleEdit = (dept) => {
    setFormData(dept);
    setEditingId(dept.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', hod: '', email: '', description: '', status: 'Active' });
  };

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Department Management</h1>
          <p className="text-[9px] text-orange-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10">
            {editingId ? 'Edit Department' : 'Add New Department'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              {/* Department Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Department Name *</label>
                <div className="relative group">
                  <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. Sales & Marketing"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Head of Department */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Head of Department *</label>
                <div className="relative group">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="Manager Name"
                    value={formData.hod} onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Department Email *</label>
                <div className="relative group">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <input
                    type="email" required placeholder="dept@sadapoorna.com"
                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Description</label>
                <div className="relative group">
                  <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <textarea
                    rows="3" placeholder="Brief role of the department..."
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <div className="relative group">
                  <CheckCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
                  <select
                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none bg-slate-50 focus:bg-white transition-all appearance-none"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] shadow-sm shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {editingId ? 'Update Department' : 'Save Department'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Department List */}
        <div className="lg:flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Existing Departments</h2>
              <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold border border-slate-200">
                {departments.length}
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider first:rounded-tl-lg">Department Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Head of Dept</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right last:rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{dept.name}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{dept.hod}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{dept.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${dept.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewingDept(dept)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(dept)}
                        className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded border border-orange-100 transition-colors" 
                        title="Update"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDepartments.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                {searchQuery ? 'No departments match your search.' : 'No departments found. Add a new department using the form.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-orange-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Department Details</h3>
              </div>
              <button onClick={() => setViewingDept(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Department Name</p>
                <p className="text-sm font-bold text-slate-900">{viewingDept.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Head of Dept</p>
                  <p className="text-xs font-semibold text-slate-700">{viewingDept.hod}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Contact Email</p>
                  <p className="text-xs text-slate-700">{viewingDept.email}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Description</p>
                <p className="text-xs text-slate-700">{viewingDept.description || 'No description provided.'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${viewingDept.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                  {viewingDept.status}
                </span>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={() => setViewingDept(null)} className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-sm">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
