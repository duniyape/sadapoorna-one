import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, FolderLock, Save, Users, CheckSquare, Search, Briefcase, ChevronRight, UserCog, Network } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const TreeNode = ({ node, designationMap, isRoot = false }) => {
  const desigId = typeof node.designation === 'object' ? (node.designation?.id || node.designation?._id) : node.designation;
  const desig = designationMap ? designationMap.get(desigId) : null;
  const roleName = desig ? (desig.name || desig.title) : (node.designation || 'No Role');

  return (
    <div className={`${!isRoot ? 'ml-6 mt-4 border-l-2 border-indigo-200 pl-6' : ''} relative`}>
      {!isRoot && <div className="absolute w-6 h-0.5 bg-indigo-200 -left-0.5 top-6"></div>}
      <div className={`flex items-center gap-3 p-3 bg-white border ${isRoot ? 'border-indigo-400 shadow-md ring-2 ring-indigo-50' : 'border-slate-200 shadow-sm'} rounded-xl w-[250px] hover:border-indigo-300 transition-all`}>
        {node.profile_photo ? (
          <img src={node.profile_photo} alt={node.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
        ) : (
          <div className={`w-10 h-10 rounded-full ${isRoot ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center font-bold text-sm shrink-0 shadow-inner`}>
            {(node.name || '?')[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-800 truncate">{node.name}</p>
          {node.email && <p className="text-[10px] text-slate-500 truncate">{node.email}</p>}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{roleName}</span>
            {desig && <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded shrink-0">Lvl {desig.level}</span>}
          </div>
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-1 relative">
          {node.children.map(child => <TreeNode key={child.id || child._id} node={child} designationMap={designationMap} />)}
        </div>
      )}
    </div>
  );
};

export default function DataAccessPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [designations, setDesignations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [selectedDesignationId, setSelectedDesignationId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedSubordinates, setSelectedSubordinates] = useState({});
  const [searchSubordinates, setSearchSubordinates] = useState('');
  const [hierarchyTree, setHierarchyTree] = useState(null);

  // Fallback mock data in case API is not available
  const MOCK_DESIGNATIONS = [
    { master_id: 'd1', title: 'Super Admin', level: 5 },
    { master_id: 'd2', title: 'Admin', level: 4 },
    { master_id: 'd3', title: 'Manager', level: 3 },
    { master_id: 'd4', title: 'Staff', level: 2 },
  ];

  const MOCK_USERS = [
    { user_id: 'u1', name: 'Alice Founder', email: 'alice@corp.com', designation: 'd1' },
    { user_id: 'u2', name: 'Bob Director', email: 'bob@corp.com', designation: 'd2' },
    { user_id: 'u3', name: 'Charlie Lead', email: 'charlie@corp.com', designation: 'd2' },
    { user_id: 'u4', name: 'Dave Manager', email: 'dave@corp.com', designation: 'd3' },
    { user_id: 'u5', name: 'Eve Manager', email: 'eve@corp.com', designation: 'd3' },
    { user_id: 'u6', name: 'Frank Worker', email: 'frank@corp.com', designation: 'd4' },
    { user_id: 'u7', name: 'Grace Worker', email: 'grace@corp.com', designation: 'd4' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [desigRes, usersRes] = await Promise.all([
        fetch('/masters/v1/Designation').catch(() => null),
        fetch('/users/get').catch(() => null)
      ]);

      if (desigRes && desigRes.ok) {
        const dData = await desigRes.json();
        const parsed = Array.isArray(dData) ? dData : (dData.data || dData.masters || []);
        setDesignations(parsed.length > 0 ? parsed : MOCK_DESIGNATIONS);
      } else {
        setDesignations(MOCK_DESIGNATIONS);
      }

      if (usersRes && usersRes.ok) {
        const uData = await usersRes.json();
        const parsed = Array.isArray(uData) ? uData : (uData.data || uData.users || []);
        setAllUsers(parsed.length > 0 ? parsed : MOCK_USERS);
      } else {
        setAllUsers(MOCK_USERS);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      // Fallback to mock data on error
      setDesignations(MOCK_DESIGNATIONS);
      setAllUsers(MOCK_USERS);
      showToast("Using local mock data (API unavailable)");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper map for designation levels
  const designationMap = useMemo(() => {
    const map = new Map();
    designations.forEach(d => {
      const id = d.master_id || d.id || d._id;
      // Extract numeric grade/level, defaulting to 0
      const level = parseInt(d.grade || d.level || 0, 10);
      map.set(id, { ...d, level: isNaN(level) ? 0 : level });
    });
    return map;
  }, [designations]);

  // Derived data
  const selectedUserManager = useMemo(() => {
    if (!selectedUserId) return null;
    return allUsers.find(u => (u.user_id || u.id || u._id) === selectedUserId);
  }, [selectedUserId, allUsers]);

  const usersForSelectedDesignation = useMemo(() => {
    if (!selectedDesignationId) return [];
    return allUsers.filter(u => {
      const uDesigId = typeof u.designation === 'object' ? (u.designation?.id || u.designation?._id) : u.designation;
      return uDesigId === selectedDesignationId;
    });
  }, [selectedDesignationId, allUsers]);

  const subordinateCandidates = useMemo(() => {
    if (!selectedUserId) return [];
    const manager = allUsers.find(u => (u.user_id || u.id || u._id) === selectedUserId);
    if (!manager) return [];

    const managerDesigId = typeof manager.designation === 'object' ? (manager.designation?.id || manager.designation?._id) : manager.designation;
    const managerDesig = designationMap.get(managerDesigId);
    if (!managerDesig) return [];

    const managerLevel = managerDesig.level;

    // Find all users strictly below this level
    const lowerLevelUsers = allUsers.filter(u => {
      // Don't include the manager themselves
      if ((u.user_id || u.id || u._id) === selectedUserId) return false;
      const uDesigId = typeof u.designation === 'object' ? (u.designation?.id || u.designation?._id) : u.designation;
      const uDesig = designationMap.get(uDesigId);
      if (!uDesig) return false;
      return uDesig.level < managerLevel;
    });

    if (lowerLevelUsers.length === 0) return [];

    // Find the next highest available level among these lower users
    const maxLowerLevel = Math.max(...lowerLevelUsers.map(u => {
      const uDesigId = typeof u.designation === 'object' ? (u.designation?.id || u.designation?._id) : u.designation;
      return designationMap.get(uDesigId).level;
    }));

    // Return only the users at that exact next highest level
    return lowerLevelUsers.filter(u => {
      const uDesigId = typeof u.designation === 'object' ? (u.designation?.id || u.designation?._id) : u.designation;
      return designationMap.get(uDesigId).level === maxLowerLevel;
    });
  }, [selectedUserId, allUsers, designationMap]);

  // Handle Designation Click
  const handleSelectDesignation = (id) => {
    setSelectedDesignationId(id);
    setSelectedUserId(null); // Reset user when designation changes
  };

  const handleSelectUser = async (id) => {
    setSelectedUserId(id);
    setSelectedSubordinates({}); 
    setHierarchyTree(null);

    // Fetch existing hierarchy mapping so we can view tree without saving
    try {
      const res = await fetch(`/data-access-hierarchy/tree/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status && Array.isArray(data.access)) {
          const preSelected = {};
          data.access.forEach(sub => {
            preSelected[sub.id] = true;
          });
          setSelectedSubordinates(preSelected);
          setHierarchyTree(data.access);
        }
      }
    } catch (err) {
      // Silently ignore if no hierarchy exists yet (e.g. 404)
      console.log("No existing hierarchy found for this user");
    }
  };

  const toggleSubordinate = (id) => {
    setSelectedSubordinates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllSubordinates = (selectAll) => {
    const updated = {};
    subordinateCandidates.forEach(u => {
      updated[u.user_id || u.id || u._id] = selectAll;
    });
    setSelectedSubordinates(prev => ({ ...prev, ...updated }));
  };

  const handleSaveMapping = async () => {
    if (!selectedUserId) {
      showToast("Please select a manager first");
      return;
    }

    const assignedIds = Object.keys(selectedSubordinates).filter(k => selectedSubordinates[k]);
    
    try {
      setIsSaving(true);
      const payload = {
        manager_id: selectedUserId,
        subordinate_ids: assignedIds
      };
      
      console.log("Saving hierarchy payload:", payload);

      // Attempt to save to API.
      const res = await fetch('/data-access-hierarchy/hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }); 

      if (res.ok) {
        showToast("Hierarchy saved successfully!");
        
        // As requested: Call GET API after submit
        try {
          const getRes = await fetch(`/data-access-hierarchy/tree/${selectedUserId}`);
          if (getRes.ok) {
            const treeData = await getRes.json();
            console.log("Tree fetched after submit:", treeData);
            setHierarchyTree(treeData.access || []);
          }
        } catch (getErr) {
          console.error("Failed to fetch GET API after submit", getErr);
        }
        
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Error: ${errData.detail || errData.message || 'Failed to save hierarchy'}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save data access mapping.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCandidates = subordinateCandidates.filter(u => 
    (u.name || '').toLowerCase().includes(searchSubordinates.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchSubordinates.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto mt-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Data Access & Hierarchy</h1>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Master Configuration</p>
          </div>
        </div>
        
        {selectedUserId && (
          <button
            onClick={handleSaveMapping}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Top Controls: Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Designation Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              1. Select Role
            </label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
              value={selectedDesignationId || ''}
              onChange={(e) => handleSelectDesignation(e.target.value)}
            >
              <option value="" disabled>-- Choose a Designation --</option>
              {designations.map(d => {
                const dId = d.master_id || d.id || d._id;
                const level = parseInt(d.grade || d.level || 0, 10);
                return (
                  <option key={dId} value={dId}>
                    {d.name || d.title} (Level {level})
                  </option>
                );
              })}
            </select>
          </div>

          {/* User Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-blue-500" />
              2. Select Manager
            </label>
            <select
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedUserId || ''}
              onChange={(e) => handleSelectUser(e.target.value)}
              disabled={!selectedDesignationId}
            >
              <option value="" disabled>
                {!selectedDesignationId ? 'Select a role first...' : '-- Choose a Manager --'}
              </option>
              {usersForSelectedDesignation.map(u => {
                const uId = u.user_id || u.id || u._id;
                return (
                  <option key={uId} value={uId}>
                    {u.name} ({u.email || u.employee_id})
                  </option>
                );
              })}
            </select>
            {selectedDesignationId && usersForSelectedDesignation.length === 0 && (
              <p className="text-[10px] text-rose-500 font-semibold mt-1">No users found for this role.</p>
            )}
          </div>
        </div>

        {/* Panel 3: Subordinates Mapping */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
              <Users className="w-4 h-4 text-blue-500" />
              3. Map Subordinates
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold mt-1 ml-6">
              Automatically shows users from the next highest available level below the manager.
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
            {!selectedUserId ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50 px-4">
                <FolderLock className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-[13px] text-slate-600 font-bold uppercase tracking-widest">Select a manager first</p>
                <p className="text-xs text-slate-400 mt-2 max-w-[250px]">Choose a user from the dropdown above to view and map their direct subordinates.</p>
              </div>
            ) : subordinateCandidates.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <FolderLock className="w-12 h-12 text-blue-200 mb-4" />
                <p className="text-[13px] text-slate-600 font-bold">No Lower Levels Found</p>
                <p className="text-xs text-slate-400 mt-2 max-w-[300px]">There are no users in the system with a designation level strictly lower than this manager.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Search & Bulk Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search subordinates..."
                      value={searchSubordinates}
                      onChange={(e) => setSearchSubordinates(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all bg-white shadow-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAllSubordinates(true)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-colors">Select All</button>
                    <button onClick={() => toggleAllSubordinates(false)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors">Clear</button>
                  </div>
                </div>

                {/* Subordinates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredCandidates.map(u => {
                    const uId = u.user_id || u.id || u._id;
                    const uDesigId = typeof u.designation === 'object' ? (u.designation?.id || u.designation?._id) : u.designation;
                    const uDesig = designationMap.get(uDesigId);
                    const isChecked = selectedSubordinates[uId] || false;
                    
                    return (
                      <label 
                        key={uId}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all group ${
                          isChecked 
                            ? 'bg-blue-50/80 border-blue-300 shadow-sm ring-2 ring-blue-500/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => toggleSubordinate(uId)} 
                            className="w-5 h-5 appearance-none border-2 border-slate-300 rounded-[6px] checked:bg-blue-600 checked:border-blue-600 transition-colors group-hover:border-blue-400" 
                          />
                          {isChecked && (
                            <CheckSquare className="absolute w-3.5 h-3.5 text-white pointer-events-none" />
                          )}
                        </div>
                        
                        {u.profile_photo ? (
                          <img src={u.profile_photo} alt={u.name} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${isChecked ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                            {(u.name || '?')[0].toUpperCase()}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-extrabold truncate ${isChecked ? 'text-blue-900' : 'text-slate-800'}`}>
                            {u.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-slate-500 truncate">{uDesig?.name || 'No Role'}</span>
                            <span className="text-[9px] font-extrabold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded shrink-0">Lvl {uDesig?.level}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                
                {filteredCandidates.length === 0 && searchSubordinates && (
                  <p className="text-center text-sm font-semibold text-slate-400 py-12">No subordinates match your search.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Panel 4: Saved Hierarchy Tree View */}
        {hierarchyTree !== null && selectedUserManager && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
               <Network className="w-6 h-6 text-indigo-500" />
               <div>
                 <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Access Hierarchy</h2>
                 <p className="text-[10px] text-slate-500 font-bold mt-0.5">Live view of data access chain</p>
               </div>
             </div>
             <div className="p-2 overflow-x-auto custom-scrollbar">
                <TreeNode 
                  node={{ ...selectedUserManager, children: hierarchyTree }} 
                  designationMap={designationMap} 
                  isRoot={true} 
                />
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
