import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Save, ShieldCheck, CheckSquare, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { SALES_OPERATIONS, HR_FLEET_MODULES, MASTER_MODULES } from '../utils/constants';

const ALL_MODULES_CATEGORIZED = [
  { category: 'Customer & Sales Operations', items: SALES_OPERATIONS },
  { category: 'HR, Staff & Fleet Management', items: HR_FLEET_MODULES },
  { category: 'Master Configurations', items: MASTER_MODULES }
];

export default function AccessibilityPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [designations, setDesignations] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mapping of module ID to boolean permission
  const [permissions, setPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDesignations();
  }, []);

  useEffect(() => {
    if (selectedDesignation) {
      fetchPermissions(selectedDesignation);
    } else {
      setPermissions({});
    }
  }, [selectedDesignation]);

  const fetchDesignations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/masters/v1/Designation');
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.data || data.masters || []);
          if (items.length > 0) {
            setDesignations(items);
          } else {
            // Fallback if API is successful but returns empty
            setDesignations([
              { _id: '1', name: 'Super Admin' },
              { _id: '2', name: 'Sales Manager' },
              { _id: '3', name: 'HR Executive' }
            ]);
          }
        }
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error("Failed to fetch designations", error);
      showToast("Failed to fetch designations, using fallbacks");
      setDesignations([
        { _id: '1', name: 'Super Admin' },
        { _id: '2', name: 'Sales Manager' },
        { _id: '3', name: 'HR Executive' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async (designationId) => {
    try {
      const initialPermissions = {};
      ALL_MODULES_CATEGORIZED.forEach(group => {
        group.items.forEach(item => {
          initialPermissions[item.id] = false;
          if (item.key) {
            item.key.forEach(k => initialPermissions[`${item.id}-${k}`] = false);
          }
        });
      });

      const res = await fetch(`/access/${designationId}`);
      if (res.ok) {
        const data = await res.json();
        const savedIcons = data.frontend_icons || data.permissions;
        
        // If the backend returns an array of allowed module objects/strings
        if (Array.isArray(savedIcons)) {
          const loadedPerms = { ...initialPermissions };
          savedIcons.forEach(item => {
            if (typeof item === 'string') {
              if (item in loadedPerms) loadedPerms[item] = true;
            } else if (item && typeof item === 'object') {
              if (item.icon in loadedPerms) loadedPerms[item.icon] = true;
              if (Array.isArray(item.buttons)) {
                item.buttons.forEach(btn => {
                  const subId = `${item.icon}-${btn}`;
                  if (subId in loadedPerms) loadedPerms[subId] = true;
                });
              }
            }
          });
          setPermissions(loadedPerms);
        } else if (savedIcons && typeof savedIcons === 'object') {
          // If it returns an object map
          setPermissions({ ...initialPermissions, ...savedIcons });
        } else {
          setPermissions(initialPermissions);
        }
      } else {
        setPermissions(initialPermissions);
      }
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      const fallback = {};
      ALL_MODULES_CATEGORIZED.forEach(g => g.items.forEach(i => fallback[i.id] = false));
      setPermissions(fallback);
    }
  };

  const handleTogglePermission = (moduleId) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    ALL_MODULES_CATEGORIZED.forEach(group => {
      group.items.forEach(item => {
        allSelected[item.id] = true;
        if (item.key) {
          item.key.forEach(k => allSelected[`${item.id}-${k}`] = true);
        }
      });
    });
    setPermissions(allSelected);
  };

  const handleDeselectAll = () => {
    const allDeselected = {};
    ALL_MODULES_CATEGORIZED.forEach(group => {
      group.items.forEach(item => {
        allDeselected[item.id] = false;
        if (item.key) {
          item.key.forEach(k => allDeselected[`${item.id}-${k}`] = false);
        }
      });
    });
    setPermissions(allDeselected);
  };

  const handleSavePermissions = async () => {
    if (!selectedDesignation) {
      showToast("Please select a designation first");
      return;
    }

    try {
      setIsSaving(true);
      
      // We will send the frontend_icons as a list of objects { icon, buttons }
      const allowedModules = [];
      ALL_MODULES_CATEGORIZED.forEach(group => {
        group.items.forEach(item => {
          if (permissions[item.id]) {
            const buttons = [];
            if (item.key) {
              item.key.forEach(k => {
                if (permissions[`${item.id}-${k}`]) {
                  buttons.push(k);
                }
              });
            }
            allowedModules.push({ icon: item.id, buttons });
          }
        });
      });

      const res = await fetch('/access/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          designation_id: selectedDesignation, 
          frontend_icons: allowedModules 
        })
      });
      
      if (res.ok) {
        showToast(`Permissions updated successfully!`);
        // Redirect/Reset the page as requested
        setTimeout(() => {
          navigate(0); // Reloads the current route
        }, 800);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Server validation error:", errData);
        let msg = "Failed to save permissions.";
        if (errData.detail) {
          msg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
        }
        showToast(`Validation Error: ${msg}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Failed to save permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter modules based on search
  const filteredModules = ALL_MODULES_CATEGORIZED.map(group => ({
    ...group,
    items: group.items.filter(item => 
      (item.title || item.label || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Accessibility & Permissions</h1>
          <p className="text-[9px] text-pink-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Designation Selection */}
        <div className="lg:w-[30%] bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              Select Role
            </h2>
            <p className="text-[10px] text-slate-500 mt-1">Choose a designation to manage its module access permissions.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider mb-2 block">Select Designation</label>
              {isLoading ? (
                <div className="text-xs text-slate-500 animate-pulse py-2">Loading designations...</div>
              ) : (
                <select
                  value={selectedDesignation}
                  onChange={(e) => setSelectedDesignation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[12px] font-bold border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                >
                  <option value="">-- Choose Designation --</option>
                  {designations.map(desig => {
                    const desigId = desig.master_id || desig.id || desig._id;
                    return (
                      <option key={desigId} value={desigId}>
                        {desig.name || desig.title}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>
            
            {selectedDesignation && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-pink-700 font-bold text-xs mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    Access Control Active
                  </div>
                  <p className="text-[10px] text-pink-600/80 leading-tight">
                    You are now managing permissions for the selected designation. Changes will take effect immediately upon saving.
                  </p>
                </div>
                
                <button
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="w-full mt-4 px-5 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-[11px] shadow-sm shadow-pink-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Permissions List */}
        <div className="lg:flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit min-h-[500px]">
          {!selectedDesignation ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
              <Lock className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700 mb-1">No Designation Selected</h3>
              <p className="text-[11px] text-slate-500 max-w-[250px]">Please select a designation from the left panel to view and edit its access permissions.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">Module Permissions</h2>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={handleSelectAll}
                      className="px-2 py-1 text-[10px] font-bold text-pink-600 bg-pink-100 hover:bg-pink-200 rounded transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-pink-500 focus:border-pink-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {filteredModules.map((group, idx) => (
                  <div key={idx}>
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3 px-1">
                      {group.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {group.items.map(item => {
                        const Icon = item.icon;
                        const isGranted = permissions[item.id] || false;
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`flex flex-col p-3 rounded-xl border transition-all ${
                              isGranted 
                                ? 'bg-pink-50/50 border-pink-200 shadow-sm' 
                                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between cursor-pointer" onClick={() => handleTogglePermission(item.id)}>
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isGranted ? 'bg-pink-100 text-pink-600' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className={`text-[11px] font-bold ${isGranted ? 'text-pink-900' : 'text-slate-700'}`}>
                                    {item.title || item.label}
                                  </h4>
                                  {item.badge && (
                                    <span className="text-[8px] mt-0.5 inline-block px-1.5 rounded bg-slate-200 text-slate-500 font-bold">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isGranted ? 'bg-pink-500 text-white shadow-sm' : 'bg-slate-200 text-transparent'
                              }`}>
                                <CheckSquare className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            
                            {item.key && isGranted && (
                              <details className="mt-3 bg-white/60 rounded-lg border border-pink-100/50 group/details" onClick={(e) => e.stopPropagation()}>
                                <summary className="text-[9px] font-bold text-pink-500 uppercase tracking-widest p-2.5 cursor-pointer flex items-center justify-between hover:bg-pink-50/50 rounded-lg list-none [&::-webkit-details-marker]:hidden select-none transition-colors">
                                  Granular Permissions
                                  <svg className="w-3.5 h-3.5 text-pink-400 transition-transform duration-300 group-open/details:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="flex flex-col gap-1 p-2 border-t border-pink-100/50">
                                  {item.key.map(k => {
                                    const subId = `${item.id}-${k}`;
                                    return (
                                      <label key={k} className="flex items-center gap-2.5 cursor-pointer group hover:bg-white p-1.5 rounded-md transition-colors">
                                        <div className="relative flex items-center justify-center shrink-0">
                                          <input 
                                            type="checkbox" 
                                            checked={permissions[subId] || false} 
                                            onChange={() => handleTogglePermission(subId)} 
                                            className="w-3.5 h-3.5 appearance-none border border-slate-300 rounded checked:bg-pink-500 checked:border-pink-500 transition-colors group-hover:border-pink-400" 
                                          />
                                          {(permissions[subId] || false) && (
                                            <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                        </div>
                                        <span className="text-[11px] text-slate-700 font-semibold group-hover:text-pink-700 transition-colors">
                                          {k}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </details>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {filteredModules.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    No modules match your search.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
