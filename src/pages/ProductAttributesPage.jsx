import React, { useState, useEffect } from 'react';
import { ArrowLeft, Tags, Layers, Tag, Edit2, Search, Trash2, ShieldCheck } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function ProductAttributesPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [activeTab, setActiveTab] = useState('category'); // 'category', 'sub-category', 'brand'
  
  const [formData, setFormData] = useState({ name: '', category_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/attributes/category/v1');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch('/attributes/sub-category/v1');
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch sub-categories", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/attributes/brand/v1');
      if (res.ok) {
        const data = await res.json();
        setBrands(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch brands", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ name: '', category_id: '' });
    setEditingId(null);
    setSearchQuery('');
  };

  // Helper config for the active tab
  const getTabConfig = () => {
    switch (activeTab) {
      case 'category':
        return {
          title: 'Category',
          icon: Layers,
          items: categories,
          fetchFn: fetchCategories,
          createUrl: '/attributes/category/v1',
          updateUrl: (id) => `/attributes/category/update/${id}`,
          deleteUrl: (id) => `/attributes/category/delete/${id}`,
        };
      case 'sub-category':
        return {
          title: 'Sub-Category',
          icon: Tags,
          items: subCategories,
          fetchFn: fetchSubCategories,
          createUrl: '/attributes/sub-category/v1',
          updateUrl: (id) => `/attributes/sub-category/update/${id}`,
          deleteUrl: (id) => `/attributes/sub-category/delete/${id}`,
        };
      case 'brand':
        return {
          title: 'Brand',
          icon: Tag,
          items: brands,
          fetchFn: fetchBrands,
          createUrl: '/attributes/brand/v1',
          updateUrl: (id) => `/attributes/brand/update/${id}`,
          deleteUrl: (id) => `/attributes/brand/delete/${id}`,
        };
      default: return {};
    }
  };

  const config = getTabConfig();
  const ActiveIcon = config.icon || Layers;

  const filteredItems = (config.items || []).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = { name: formData.name };
      if (activeTab === 'sub-category') {
        payload.category_id = formData.category_id;
      }

      const url = editingId ? config.updateUrl(editingId) : config.createUrl;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast(`${config.title} '${formData.name}' ${editingId ? 'updated' : 'created'} successfully!`);
        config.fetchFn();
        setEditingId(null);
        setFormData({ name: '', category_id: '' });
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.detail || `Failed to save ${config.title.toLowerCase()}.`);
      }
    } catch (error) {
       console.error("API Error:", error);
       showToast("Network error occurred.");
    } finally {
       setIsLoading(false);
    }
  };

  const handleDelete = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete ${config.title} '${itemName}'?`)) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(config.deleteUrl(itemId), { method: 'POST' });
      if (res.ok) {
        showToast(`${config.title} deleted successfully!`);
        config.fetchFn();
      } else {
        const errData = await res.json().catch(() => null);
        showToast(errData?.detail || `Failed to delete ${config.title.toLowerCase()}.`);
      }
    } catch (error) {
      console.error("API Error:", error);
      showToast("Network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      name: item.name || '', 
      category_id: item.category_id || '' 
    });
    setEditingId(item.id || item._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', category_id: '' });
  };

  // Helper to resolve category name for Sub-Categories
  const getCategoryName = (catId) => {
    const cat = categories.find(c => (c.id || c._id) === catId);
    return cat ? cat.name : 'Unknown Category';
  };

  return (
    <div className="max-w-7xl mx-auto mt-2 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Product Attributes</h1>
            <p className="text-[9px] text-fuchsia-600 font-bold uppercase tracking-widest">Master Configuration</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'category', label: 'Categories', icon: Layers },
            { id: 'sub-category', label: 'Sub-Categories', icon: Tags },
            { id: 'brand', label: 'Brands', icon: Tag },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-fuchsia-600' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Creation Form */}
        <div className="lg:w-[35%] xl:w-[30%] bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm relative overflow-hidden h-fit transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

          <h2 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 relative z-10 flex items-center gap-1.5">
            {editingId ? 'Edit' : 'Add New'} {config.title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="grid grid-cols-1 gap-3">
              
              {/* Name Field (Common to all) */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">{config.title} Name *</label>
                <div className="relative group">
                  <ActiveIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors pointer-events-none" />
                  <input
                    type="text" required placeholder={`e.g. ${activeTab === 'brand' ? 'Nike' : (activeTab === 'category' ? 'Electronics' : 'Mobile Phones')}`}
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Sub-Category specific field: Category ID */}
              {activeTab === 'sub-category' && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">Parent Category *</label>
                  <div className="relative group">
                    <Layers className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors pointer-events-none" />
                    <select
                      required
                      value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:outline-none transition-all bg-slate-50 focus:bg-white appearance-none"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(cat => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              )}

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
                disabled={isLoading || !formData.name.trim() || (activeTab === 'sub-category' && !formData.category_id)}
                className="px-4 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-1.5"
              >
                {isLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {isLoading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: List View */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 rounded-t-xl transition-colors duration-300">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ActiveIcon className="w-4 h-4 text-fuchsia-600" /> Existing {config.title}s
              <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-[10px] ml-1">
                {config.items.length}
              </span>
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${config.title.toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table List */}
          <div className="flex-1 overflow-auto p-3">
            {isLoading && config.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10">
                <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-medium">Loading...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ActiveIcon className="w-8 h-8 opacity-20" />
                <p className="text-xs font-medium">No {config.title.toLowerCase()}s found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id || item._id} 
                    className={`group bg-white border ${editingId === (item.id || item._id) ? 'border-fuchsia-500 shadow-sm ring-1 ring-fuchsia-500/20' : 'border-slate-200 hover:border-fuchsia-300 hover:shadow-sm'} rounded-xl p-3 transition-all relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${editingId === (item.id || item._id) ? 'bg-fuchsia-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-fuchsia-50 group-hover:text-fuchsia-600'} transition-colors`}>
                        {item.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="text-[13px] font-bold text-slate-900 truncate" title={item.name}>{item.name}</h3>
                        {activeTab === 'sub-category' && item.category_id && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Layers className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] text-slate-500 font-medium truncate" title={getCategoryName(item.category_id)}>
                              {getCategoryName(item.category_id)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Overlay */}
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1 py-1 rounded-lg border border-slate-100 shadow-sm transition-all duration-200 ${editingId === (item.id || item._id) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id || item._id, item.name)}
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
