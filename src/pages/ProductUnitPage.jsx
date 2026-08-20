import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Edit2, Search, Trash2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function ProductUnitPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: ''
  });

  const [productUnits, setProductUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProductUnits();
  }, []);

  const fetchProductUnits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/product-units/v1');
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setProductUnits(items);
        } else {
          console.warn("API returned HTML instead of JSON. Check your proxy config.");
        }
      }
    } catch (error) {
      console.error("Failed to fetch product units", error);
      showToast("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUnits = productUnits.filter(unit => 
    unit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        symbol: formData.symbol
      };

      if (editingId) {
        const res = await fetch(`/product-units/update/${editingId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          showToast(`Product Unit '${formData.name}' updated successfully!`);
          fetchProductUnits();
          setEditingId(null);
          setFormData({ name: '', symbol: '' });
        } else {
          showToast(`Failed to update product unit.`);
        }
      } else {
        const res = await fetch('/product-units/v1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          showToast(`Product Unit '${formData.name}' created successfully!`);
          fetchProductUnits();
          setFormData({ name: '', symbol: '' });
        } else {
          const errData = await res.json().catch(() => null);
          showToast(errData?.detail || `Failed to create product unit.`);
        }
      }
    } catch (error) {
       console.error("API Error:", error);
       showToast("Network error occurred.");
    } finally {
       setIsLoading(false);
    }
  };

  const handleDelete = async (unitId, unitName) => {
    if (!window.confirm(`Are you sure you want to delete Product Unit '${unitName}'?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/product-units/delete/${unitId}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        showToast(`Product Unit deleted successfully!`);
        fetchProductUnits();
      } else {
        showToast(`Failed to delete product unit.`);
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setFormData({ name: unit.name || '', symbol: unit.symbol || '' });
    setEditingId(unit.id || unit._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', symbol: '' });
  };

  return (
    <div className="max-w-7xl mx-auto mt-2 pb-10">
      <div className="flex items-center gap-2.5 mb-4">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Product Units</h1>
          <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10">
            {editingId ? 'Edit Product Unit' : 'Add New Unit'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              {/* Unit Name */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Unit Name *</label>
                <div className="relative group">
                  <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder="e.g. Kilogram, Box, Litre"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Unit Symbol */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Symbol *</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">#</span>
                  <input
                    type="text" required placeholder="e.g. kg, box"
                    value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.symbol.trim()}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? 'Saving...' : (editingId ? 'Update Unit' : 'Create Unit')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: List View */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" /> Existing Units
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px] ml-1">
                {productUnits.length}
              </span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table List */}
          <div className="flex-1 overflow-auto p-3">
            {isLoading && productUnits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Loading units...</p>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Package className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">No units found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredUnits.map((unit) => (
                  <div 
                    key={unit.id || unit._id} 
                    className={`group bg-white border ${editingId === (unit.id || unit._id) ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'} rounded-xl p-3 transition-all relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${editingId === (unit.id || unit._id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'} transition-colors`}>
                        {unit.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-bold text-slate-900 truncate" title={unit.name}>{unit.name}</h3>
                        {unit.symbol && (
                          <p className="text-[10px] text-slate-500 font-medium truncate uppercase">{unit.symbol}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1 py-1 rounded-lg border border-slate-100 shadow-sm transition-all duration-200 ${editingId === (unit.id || unit._id) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                      <button 
                        onClick={() => handleEdit(unit)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(unit.id || unit._id, unit.name)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
