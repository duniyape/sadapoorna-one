import React, { useState } from 'react';
import { ArrowLeft, BadgeCheck, Briefcase, FileText, CheckCircle, Save, Eye, Edit2, Shield, X, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function DesignationPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    department: '',
    responsibilities: '',
    status: 'Active'
  });

  const [designations, setDesignations] = useState([
    { id: 1, title: 'Area Sales Manager', grade: 'M2 - Manager', department: 'Sales & Operations', responsibilities: 'Oversees regional sales teams and targets.', status: 'Active' },
    { id: 2, title: 'Senior HR Executive', grade: 'E3 - Executive', department: 'Human Resources', responsibilities: 'Handles employee onboarding and payroll.', status: 'Active' },
    { id: 3, title: 'Support Specialist', grade: 'L1 - Staff', department: 'IT Support', responsibilities: 'Level 1 technical troubleshooting.', status: 'Inactive' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [viewingDesig, setViewingDesig] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDesignations = designations.filter(desig => 
    desig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    desig.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setDesignations(designations.map(d => d.id === editingId ? { ...formData, id: editingId } : d));
      showToast(`Designation '${formData.title}' updated successfully!`);
      setEditingId(null);
    } else {
      const newDesig = { ...formData, id: Date.now() };
      setDesignations([...designations, newDesig]);
      showToast(`Designation '${formData.title}' created successfully!`);
    }
    setFormData({ title: '', grade: '', department: '', responsibilities: '', status: 'Active' });
  };

  const handleEdit = (desig) => {
    setFormData(desig);
    setEditingId(desig.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', grade: '', department: '', responsibilities: '', status: 'Active' });
  };

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Designation Management</h1>
          <p className="text-[9px] text-rose-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10">
            {editingId ? 'Edit Designation' : 'Add New Designation'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              {/* Designation Title */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Designation Title *</label>
                <div className="relative group">
                  <BadgeCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. Sales Executive"
                    value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Department *</label>
                <div className="relative group">
                  <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. Sales & Operations"
                    value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Grade / Level */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Grade / Level *</label>
                <div className="relative group">
                  <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. L1, Executive"
                    value={formData.grade} onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Responsibilities</label>
                <div className="relative group">
                  <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                  <textarea
                    rows="3" placeholder="Brief outline of responsibilities..."
                    value={formData.responsibilities} onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all bg-slate-50 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>
              
              {/* Status */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <div className="relative group">
                  <CheckCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors pointer-events-none" />
                  <select
                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none bg-slate-50 focus:bg-white transition-all appearance-none"
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
                className="w-full sm:w-auto px-5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] shadow-sm shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {editingId ? 'Update Designation' : 'Save Designation'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Designation List */}
        <div className="lg:flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-800">Existing Designations</h2>
              <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold border border-slate-200">
                {designations.length}
              </div>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search designations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider first:rounded-tl-lg">Title</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right last:rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDesignations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3 px-3 text-[11px] font-bold text-slate-900">{desig.title}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{desig.department}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{desig.grade}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${desig.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                        {desig.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewingDesig(desig)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors" 
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(desig)}
                        className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-100 transition-colors" 
                        title="Update"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredDesignations.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs">
                {searchQuery ? 'No designations match your search.' : 'No designations found. Add a new designation using the form.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewingDesig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Designation Details</h3>
              </div>
              <button onClick={() => setViewingDesig(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Designation Title</p>
                <p className="text-sm font-bold text-slate-900">{viewingDesig.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Grade / Level</p>
                  <p className="text-xs font-semibold text-slate-700">{viewingDesig.grade}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Department</p>
                  <p className="text-xs text-slate-700">{viewingDesig.department}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Responsibilities</p>
                <p className="text-xs text-slate-700">{viewingDesig.responsibilities || 'No description provided.'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${viewingDesig.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                  {viewingDesig.status}
                </span>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
               <button onClick={() => setViewingDesig(null)} className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-sm">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
