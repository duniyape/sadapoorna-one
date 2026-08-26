import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, UserCog, Layers, CheckSquare, ShieldCheck, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function DataAccessPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [allUsers, setAllUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // States for the 3-Dropdown Flow
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  
  // Stores ALL assigned subordinate IDs for the selected user across ALL designations
  const [assignedSubordinates, setAssignedSubordinates] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [usersRes, desigRes] = await Promise.all([
          fetch('/users/get').catch(() => null),
          fetch('/masters/v1/Designation').catch(() => null)
        ]);

        if (usersRes && usersRes.ok) {
          const uData = await usersRes.json();
          const parsed = Array.isArray(uData) ? uData : (uData.data || uData.users || []);
          setAllUsers(parsed);
        }

        if (desigRes && desigRes.ok) {
          const dData = await desigRes.json();
          const parsed = Array.isArray(dData) ? dData : (dData.data || dData.masters || []);
          setDesignations(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        showToast("Error loading users and designations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  // Compute Target User's Level
  const targetLevel = useMemo(() => {
    if (!selectedUserId) return 0;
    const targetUser = allUsers.find(u => String(u.user_id || u.id || u._id) === String(selectedUserId));
    if (!targetUser) return 0;
    
    const targetDesigId = typeof targetUser.designation === 'object' && targetUser.designation !== null
      ? (targetUser.designation.master_id || targetUser.designation.id || targetUser.designation._id)
      : targetUser.designation;
      
    const d = designations.find(des => String(des.master_id || des.id || des._id) === String(targetDesigId));
    if (!d) return 0;
    
    return parseInt(d.grade || d.level || 0, 10);
  }, [selectedUserId, allUsers, designations]);

  // Derived state: Unique Levels (Strictly less than Target User's Level)
  const uniqueLevels = useMemo(() => {
    if (!selectedUserId || targetLevel === 0) return [];
    
    const levels = new Set();
    designations.forEach(d => {
      const level = parseInt(d.grade || d.level || 0, 10);
      if (!isNaN(level) && level < targetLevel) levels.add(level);
    });
    return Array.from(levels).sort((a, b) => b - a); // Highest level first
  }, [designations, selectedUserId, targetLevel]);

  // Derived state: Users that belong to the selected level (excluding the target user)
  const thirdDropdownOptions = useMemo(() => {
    if (selectedLevelFilter === '') return [];
    
    return allUsers.filter(u => {
      const uId = u.user_id || u.id || u._id;
      // Exclude target user
      if (String(uId) === String(selectedUserId)) return false;
      
      const uDesigId = typeof u.designation === 'object' && u.designation !== null
        ? (u.designation.master_id || u.designation.id || u.designation._id) 
        : u.designation;
        
      const d = designations.find(des => String(des.master_id || des.id || des._id) === String(uDesigId));
      if (!d) return false;
      
      const level = parseInt(d.grade || d.level || 0, 10);
      return level === parseInt(selectedLevelFilter, 10);
    }).filter(u => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (u.name || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search);
    });
  }, [selectedLevelFilter, allUsers, selectedUserId, searchQuery, designations]);

  // Handle Fetching API and Updating Graph
  const handleSelectUser = async (userId) => {
    setSelectedUserId(userId);
    setSelectedLevelFilter('');
    setAssignedSubordinates([]);
    setSearchQuery('');

    if (!userId) return;

    try {
      const res = await fetch(`/data-access-hierarchy/tree/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status && Array.isArray(data.access)) {
          const existingIds = data.access.map(sub => String(sub.id));
          setAssignedSubordinates(existingIds);
        }
      }
    } catch (err) {
      console.log("No existing hierarchy found or API failed", err);
    }
  };

  // Group Assigned Subordinates for the Hierarchy Graph View
  const hierarchyGraph = useMemo(() => {
    if (assignedSubordinates.length === 0) return null;
    
    const grouped = {};
    assignedSubordinates.forEach(subId => {
      const u = allUsers.find(user => String(user.user_id || user.id || user._id) === String(subId));
      if (!u) return;
      
      const uDesigId = typeof u.designation === 'object' && u.designation !== null
        ? (u.designation.master_id || u.designation.id || u.designation._id)
        : u.designation;
        
      const d = designations.find(des => String(des.master_id || des.id || des._id) === String(uDesigId));
      const level = d ? parseInt(d.grade || d.level || 0, 10) : 0;
      
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push({ ...u, desigName: d ? (d.name || d.title) : 'Unknown Role' });
    });
    
    const sortedLevels = Object.keys(grouped).sort((a, b) => b - a);
    return { grouped, sortedLevels };
  }, [assignedSubordinates, allUsers, designations]);

  // Handle Select/Deselect all for the CURRENT designation level view
  const handleToggleSelectAll = (selectAll) => {
    const currentViewIds = thirdDropdownOptions.map(opt => String(opt.user_id || opt.id || opt._id));
    
    setAssignedSubordinates(prev => {
      if (selectAll) {
        // Add all currentViewIds to assignedSubordinates
        const newSet = new Set([...prev, ...currentViewIds]);
        return Array.from(newSet);
      } else {
        // Remove all currentViewIds from assignedSubordinates
        return prev.filter(id => !currentViewIds.includes(id));
      }
    });
  };

  const handleToggleValue = (id) => {
    const strId = String(id);
    setAssignedSubordinates(prev => {
      if (prev.includes(strId)) {
        return prev.filter(val => val !== strId);
      }
      return [...prev, strId];
    });
  };

  // Handle Save
  const handleSaveMapping = async () => {
    if (!selectedUserId) {
      showToast("Please select a target user first.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        manager_id: selectedUserId,
        subordinate_ids: assignedSubordinates
      };
      
      console.log("Saving real hierarchy payload:", JSON.stringify(payload, null, 2));

      const res = await fetch('/data-access-hierarchy/hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Access mapped successfully!");
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Failed to save access mapping: ${errData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const getDesignationName = (id) => {
    const d = designations.find(des => String(des.master_id || des.id || des._id) === String(id));
    if (!d) return 'Unknown Role';
    const level = parseInt(d.grade || d.level || 0, 10);
    return `${d.name || d.title} (Level ${level})`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Data Access Allocation</h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Employee Data Visibility</p>
          </div>
        </div>
        
        <button
          onClick={handleSaveMapping}
          disabled={isSaving || !selectedUserId}
          className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Allocation'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
        
        {/* Dropdown 1: Select User */}
        <div>
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <UserCog className="w-4 h-4 text-indigo-500" />
            1. Target Employee (Who gets access?)
          </label>
          <p className="text-[11px] text-slate-400 mb-2">Select the employee who will be granted data visibility over others.</p>
          <select
            className="w-full p-2.5 rounded border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors cursor-pointer"
            value={selectedUserId}
            onChange={(e) => handleSelectUser(e.target.value)}
          >
            <option value="" disabled>-- Choose Target Employee --</option>
            {allUsers.map(u => {
              const uDesigId = typeof u.designation === 'object' && u.designation !== null
                ? (u.designation.master_id || u.designation.id || u.designation._id) 
                : u.designation;
              return (
                <option key={u.user_id || u.id || u._id} value={u.user_id || u.id || u._id}>
                  {u.name} {u.email ? `(${u.email})` : ''} - {getDesignationName(uDesigId)}
                </option>
              );
            })}
          </select>
        </div>

        <hr className="border-slate-100" />

        {/* Dropdown 2: Select Role/Level */}
        <div>
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            2. Designation Level (Whose data will they access?)
          </label>
          <p className="text-[11px] text-slate-400 mb-2">Select the role/level of the users you want to grant access to.</p>
          <select
            className="w-full p-2.5 rounded border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors cursor-pointer disabled:opacity-50"
            value={selectedLevelFilter}
            onChange={(e) => {
              setSelectedLevelFilter(e.target.value);
              setSearchQuery('');
            }}
            disabled={!selectedUserId}
          >
            <option value="" disabled>-- Choose a Level --</option>
            {uniqueLevels.map(lvl => (
              <option key={lvl} value={lvl}>
                Level {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Multi-Select Values */}
        {selectedLevelFilter !== '' && (
          <>
            <hr className="border-slate-100" />
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    3. Select Specific Employees
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Select the employees from this level to grant access.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name/email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleSelectAll(true)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 transition-colors">Select All</button>
                    <button onClick={() => handleToggleSelectAll(false)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors">Clear</button>
                  </div>
                </div>
              </div>

              {thirdDropdownOptions.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm font-semibold text-slate-500">
                    {searchQuery ? 'No employees match your search.' : 'No available employees found for this designation.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto p-2 border border-slate-100 rounded-lg bg-slate-50/50 custom-scrollbar">
                  {thirdDropdownOptions.map(opt => {
                    const uId = String(opt.user_id || opt.id || opt._id);
                    const isSelected = assignedSubordinates.includes(uId);
                    return (
                      <div
                        key={uId}
                        onClick={() => handleToggleValue(uId)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                          {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {opt.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{opt.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Hierarchy Graph Section */}
      {selectedUserId && hierarchyGraph && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6 transition-all">
          <h2 className="text-xs font-extrabold text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-500" />
            Active Hierarchy Graph
          </h2>
          
          <div className="space-y-6 relative before:absolute before:inset-y-2 before:left-[15px] before:w-[2px] before:bg-slate-200">
            {hierarchyGraph.sortedLevels.map(level => (
              <div key={level} className="relative pl-12">
                <div className="absolute left-0 top-0 w-[32px] h-[32px] rounded-full bg-white border-[3px] border-indigo-500 flex items-center justify-center z-10 shadow-sm">
                  <span className="text-[10px] font-bold text-indigo-700">L{level}</span>
                </div>
                
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1.5">Level {level} Access</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {hierarchyGraph.grouped[level].map(emp => (
                    <div key={emp.user_id || emp.id || emp._id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-md transition-all">
                      <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                      <p className="text-[10px] font-semibold text-indigo-600 mt-1 truncate">{emp.desigName}</p>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">{emp.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
