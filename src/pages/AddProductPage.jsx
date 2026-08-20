import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Save, Plus, Package, ChevronRight,
  Search, RefreshCw, Edit2, Layers, DollarSign, BoxSelect,
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

// ─── Design tokens ────────────────────────────────────────────────────────────
const inputClass =
  'w-full px-2.5 py-1.5 rounded border border-slate-200 text-[12px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400';
const selectClass =
  'w-full px-2.5 py-1.5 rounded border border-slate-200 text-[12px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 appearance-none cursor-pointer';
const labelClass =
  'block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5';
const cardClass =
  'bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden';
const cardHeaderClass =
  'px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5';

// ─── Auth header helper ───────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Empty form states ────────────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: '', category_id: '', subcategory_id: '',
  brand_id: '', description: '', hsn_code: '', base_unit: '',
};
const EMPTY_VARIANT = {
  name: '', packaging_type: '', quantity: '',
  unit: '', sku: '', selling_price: '', purchase_price: '', gst_percent: '',
};

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT FORM
// ═══════════════════════════════════════════════════════════════════════════════
function ProductForm({ initial, onSave, isSaving, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_PRODUCT);
  const [categories, setCategories]     = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands]             = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [attrLoading, setAttrLoading]   = useState(true);

  // Sync form when editing a different product
  useEffect(() => { setForm(initial || EMPTY_PRODUCT); }, [initial]);

  // Fetch all dropdowns ONCE — no showToast in deps to avoid loops
  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      fetch('/attributes/category/v1',     { headers }).then(r => r.json()).catch(() => ({})),
      fetch('/attributes/sub-category/v1', { headers }).then(r => r.json()).catch(() => ({})),
      fetch('/attributes/brand/v1',        { headers }).then(r => r.json()).catch(() => ({})),
      fetch('/product-units/v1',           { headers }).then(r => r.json()).catch(() => ({})),
    ]).then(([cats, subs, brs, units]) => {
      setCategories(cats.data    || []);
      setSubCategories(subs.data || []);
      setBrands(brs.data         || []);
      setProductUnits(Array.isArray(units) ? units : (units.data || []));
    }).finally(() => setAttrLoading(false));
  }, []); // ← empty deps: runs once only, no loop

  const handle = (field, val) => {
    if (field === 'category_id') {
      setForm(p => ({ ...p, category_id: val, subcategory_id: '' }));
    } else {
      setForm(p => ({ ...p, [field]: val }));
    }
  };

  const filteredSubs = form.category_id
    ? subCategories.filter(s => s.category_id === form.category_id)
    : subCategories;

  const handleSubmit = e => { e.preventDefault(); onSave(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-20">
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <div className="p-1 bg-indigo-100 rounded-md">
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Product Information
          </h2>
          {attrLoading && (
            <span className="ml-auto text-[9px] text-indigo-500 font-semibold animate-pulse">
              Loading dropdowns...
            </span>
          )}
        </div>

        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Product Name */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Product Name *</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => handle('name', e.target.value)}
              placeholder="e.g. Basmati Rice"
              className={inputClass}
            />
          </div>

          {/* HSN Code */}
          <div>
            <label className={labelClass}>HSN Code</label>
            <input
              type="text"
              value={form.hsn_code}
              onChange={e => handle('hsn_code', e.target.value)}
              placeholder="e.g. 100630"
              className={inputClass}
            />
          </div>

          {/* Base Unit */}
          <div>
            <label className={labelClass}>Base Unit *</label>
            <select
              required
              value={form.base_unit}
              onChange={e => handle('base_unit', e.target.value)}
              disabled={attrLoading}
              className={selectClass}
            >
              <option value="">{attrLoading ? 'Loading...' : '-- Select Unit --'}</option>
              {productUnits.map(u => (
                <option key={u.id || u._id} value={u.symbol || u.name}>
                  {u.name}{u.symbol ? ` (${u.symbol})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category_id}
              onChange={e => handle('category_id', e.target.value)}
              disabled={attrLoading}
              className={selectClass}
            >
              <option value="">{attrLoading ? 'Loading...' : '-- Select Category --'}</option>
              {categories.map(c => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sub-Category */}
          <div>
            <label className={labelClass}>Sub-Category</label>
            <select
              value={form.subcategory_id}
              onChange={e => handle('subcategory_id', e.target.value)}
              disabled={attrLoading || !form.category_id}
              className={selectClass}
            >
              <option value="">
                {attrLoading ? 'Loading...' : !form.category_id ? '-- Select Category first --' : '-- Select Sub-Category --'}
              </option>
              {filteredSubs.map(s => (
                <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className={labelClass}>Brand</label>
            <select
              value={form.brand_id}
              onChange={e => handle('brand_id', e.target.value)}
              disabled={attrLoading}
              className={selectClass}
            >
              <option value="">{attrLoading ? 'Loading...' : '-- Select Brand --'}</option>
              {brands.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => handle('description', e.target.value)}
              placeholder="Short product description..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-64 p-2 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-end gap-2 z-50">
        <button type="button" onClick={onCancel}
          className="px-5 py-2 rounded border border-slate-200 font-bold text-[11px] text-slate-600 hover:bg-slate-50 bg-white shadow-sm transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT FORM
// ═══════════════════════════════════════════════════════════════════════════════
function VariantForm({ initial, baseUnit, onSave, isSaving, onCancel }) {
  const [form, setForm] = useState(initial || { ...EMPTY_VARIANT, unit: baseUnit || '' });
  const [packingTypes, setPackingTypes] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [attrLoading, setAttrLoading]   = useState(true);

  // Fetch dropdowns ONCE
  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      fetch('/packing-types/get/v1', { headers }).then(r => r.json()).catch(() => ({})),
      fetch('/product-units/v1',     { headers }).then(r => r.json()).catch(() => ({})),
    ]).then(([packTypes, units]) => {
      setPackingTypes(Array.isArray(packTypes) ? packTypes : (packTypes.data || []));
      setProductUnits(Array.isArray(units) ? units : (units.data || []));
    }).finally(() => setAttrLoading(false));
  }, []);

  useEffect(() => {
    if (initial) {
      setForm({
        ...initial,
        packaging_type_id: initial.packaging_type_id || initial.packaging_type || '',
        unit: initial.unit || baseUnit || ''
      });
    } else {
      setForm({ ...EMPTY_VARIANT, unit: baseUnit || '' });
    }
  }, [initial, baseUnit]);

  const handle = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const handleSubmit = e => {
    e.preventDefault();
    // Find unit_id matching form.unit (which is locked to baseUnit string)
    const matchingUnit = productUnits.find(u => u.name === form.unit || u.symbol === form.unit);
    const unit_id = matchingUnit ? (matchingUnit.id || matchingUnit._id) : '';
    onSave({ ...form, unit_id });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pb-20">
      {/* Variant Details */}
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <div className="p-1 bg-purple-100 rounded-md">
            <BoxSelect className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Variant Details</h2>
          {attrLoading && (
            <span className="ml-auto text-[9px] text-purple-500 font-semibold animate-pulse">
              Loading dropdowns...
            </span>
          )}
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Variant Name *</label>
            <input type="text" required value={form.name}
              onChange={e => handle('name', e.target.value)}
              placeholder="e.g. 1 KG Pack" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>SKU *</label>
            <input type="text" required value={form.sku}
              onChange={e => handle('sku', e.target.value)}
              placeholder="e.g. RICE-1KG-001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Packaging Type *</label>
            <select required value={form.packaging_type_id || form.packaging_type}
              onChange={e => handle('packaging_type_id', e.target.value)}
              disabled={attrLoading} className={selectClass}>
              <option value="">{attrLoading ? 'Loading...' : '-- Select Packing Type --'}</option>
              {packingTypes.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Quantity *</label>
            <input type="number" required min="0.01" step="0.01" value={form.quantity}
              onChange={e => handle('quantity', e.target.value)}
              placeholder="e.g. 1" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unit (Locked to Base Unit) *</label>
            <select required value={form.unit}
              disabled={true} className={`${selectClass} bg-slate-100 cursor-not-allowed opacity-80 text-slate-500`}>
              <option value={form.unit}>{form.unit || 'Loading...'}</option>
              {productUnits.map(u => (
                <option key={u.id || u._id} value={u.symbol || u.name}>
                  {u.name}{u.symbol ? ` (${u.symbol})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <div className="p-1 bg-emerald-100 rounded-md">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pricing & Tax</h2>
        </div>
        <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Selling Price (₹) *</label>
            <input type="number" required min="0" step="0.01" value={form.selling_price}
              onChange={e => handle('selling_price', e.target.value)}
              placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Purchase Price (₹) *</label>
            <input type="number" required min="0" step="0.01" value={form.purchase_price}
              onChange={e => handle('purchase_price', e.target.value)}
              placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>GST % *</label>
            <input type="number" required min="0" max="100" step="0.01" value={form.gst_percent}
              onChange={e => handle('gst_percent', e.target.value)}
              placeholder="e.g. 18" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-64 p-2 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-end gap-2 z-50">
        <button type="button" onClick={onCancel}
          className="px-5 py-2 rounded border border-slate-200 font-bold text-[11px] text-slate-600 hover:bg-slate-50 bg-white shadow-sm transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isSaving}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save Variant'}
        </button>
      </div>
    </form>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTS LIST  — infinite-loop-free fetch
// ═══════════════════════════════════════════════════════════════════════════════
function ProductsList({ showToast, onAddVariant, onEditProduct }) {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [variants, setVariants]     = useState({});
  const [variantLoading, setVariantLoading] = useState({});

  // Use a ref for showToast so it's never a stale/changing dep
  const toastRef = useRef(showToast);
  useEffect(() => { toastRef.current = showToast; }, [showToast]);

  const LIMIT = 20;

  // ── Fetch products — stable deps: only page and search ──────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search.trim()) params.set('search', search.trim());
      const res  = await fetch(`/products/products/v1?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.data || []);
        setTotal(data.pagination?.total || 0);
      } else {
        toastRef.current(data.detail || 'Failed to load products');
      }
    } catch {
      toastRef.current('Network error while fetching products');
    } finally {
      setLoading(false);
    }
  }, [page, search]); // ← showToast NOT here — prevents infinite loop

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Expand / fetch variants ─────────────────────────────────────────────────
  const fetchVariants = async productId => {
    // Toggle if already loaded
    if (variants[productId]) {
      setExpandedId(prev => (prev === productId ? null : productId));
      return;
    }
    setVariantLoading(p => ({ ...p, [productId]: true }));
    try {
      const res  = await fetch(`/products/products/${productId}/variants?limit=50`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setVariants(p => ({ ...p, [productId]: data.data || [] }));
        setExpandedId(productId);
      } else {
        toastRef.current(data.detail || 'Failed to load variants');
      }
    } catch {
      toastRef.current('Network error while fetching variants');
    } finally {
      setVariantLoading(p => ({ ...p, [productId]: false }));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-3">
      {/* Search bar + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-[12px] font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
          />
        </div>
        <button onClick={fetchProducts}
          className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-[10px] text-slate-500 font-semibold">
        {total} product{total !== 1 ? 's' : ''} found
      </p>

      {/* Product list */}
      {loading && products.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
          <Package className="w-8 h-8 opacity-30" />
          No products found
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className={cardClass}>
              {/* Row */}
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-500">
                      Unit: <span className="font-semibold text-slate-700">{p.base_unit}</span>
                      {p.status && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {p.status}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => onAddVariant(p)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition-colors border border-indigo-200">
                    <Plus className="w-3 h-3" /> Variant
                  </button>
                  <button onClick={() => onEditProduct(p)}
                    className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => fetchVariants(p.id)}
                    className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors">
                    {variantLoading[p.id]
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : <ChevronRight className={`w-3 h-3 transition-transform ${expandedId === p.id ? 'rotate-90' : ''}`} />}
                  </button>
                </div>
              </div>

              {/* Variants accordion */}
              {expandedId === p.id && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 space-y-1.5">
                  {!variants[p.id] || variants[p.id].length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-2 text-center">No variants yet</p>
                  ) : (
                    variants[p.id].map(v => (
                      <div key={v.id} className="bg-white rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{v.name}</p>
                          <p className="text-[10px] text-slate-500 flex flex-wrap gap-2">
                            <span>SKU: <b>{v.sku}</b></span>
                            <span>Qty: <b>{v.quantity} {v.unit}</b></span>
                            <span>₹{v.selling_price}</span>
                            <span>GST: {v.gst_percent}%</span>
                            <span className="text-emerald-600 font-bold">Stock: {v.stock_quantity}</span>
                          </p>
                        </div>
                        <button onClick={() => onAddVariant(p, v)}
                          className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shrink-0">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 rounded border border-slate-200 text-[11px] font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 bg-white">
            Prev
          </button>
          <span className="text-[11px] text-slate-500 font-semibold">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded border border-slate-200 text-[11px] font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 bg-white">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddProductPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [activeTab, setActiveTab]       = useState('list');
  const [isSaving, setIsSaving]         = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [variantPanel, setVariantPanel] = useState(null); // { product, variant? }

  // ── Save product (create or update) ────────────────────────────────────────
  const handleSaveProduct = async formData => {
    setIsSaving(true);
    try {
      const isEdit = !!editingProduct?.id;
      const url = isEdit ? `/products/get/${editingProduct.id}` : '/products/products/v1';
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name:           formData.name,
          category_id:    formData.category_id    || null,
          subcategory_id: formData.subcategory_id || null,
          brand_id:       formData.brand_id       || null,
          description:    formData.description    || null,
          hsn_code:       formData.hsn_code       || null,
          base_unit:      formData.base_unit,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
        setActiveTab('list');
        setEditingProduct(null);
      } else {
        showToast(data.detail || `Failed to ${isEdit ? 'update' : 'create'} product`);
      }
    } catch {
      showToast('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save variant (create or update) ────────────────────────────────────────
  const handleSaveVariant = async formData => {
    if (!variantPanel?.product?.id) return;
    setIsSaving(true);
    const { product, variant } = variantPanel;
    const isEdit = !!variant?.id;
    try {
      const url = isEdit
        ? `/products/get/${product.id}/variants/${variant.id}`
        : `/products/products/${product.id}/variants`;
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name:           formData.name,
          packaging_type_id: formData.packaging_type_id || formData.packaging_type, // fallback in case of old data
          quantity:       parseFloat(formData.quantity),
          unit_id:        formData.unit_id,
          sku:            formData.sku,
          selling_price:  parseFloat(formData.selling_price),
          purchase_price: parseFloat(formData.purchase_price),
          gst_percent:    parseFloat(formData.gst_percent),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Variant ${isEdit ? 'updated' : 'created'} successfully!`);
        setVariantPanel(null);
        setActiveTab('list');
      } else {
        showToast(data.detail || 'Failed to save variant');
      }
    } catch {
      showToast('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddVariant = (product, variant = null) => {
    setVariantPanel({ product, variant });
    setActiveTab('variant');
  };

  const handleEditProduct = product => {
    setEditingProduct(product);
    setActiveTab('create');
  };

  const isVariantTab = activeTab === 'variant';
  const isCreateTab  = activeTab === 'create';
  const isListTab    = activeTab === 'list';

  const pageTitle = isVariantTab
    ? `${variantPanel?.variant ? 'Edit' : 'Add'} Variant — ${variantPanel?.product?.name}`
    : isCreateTab
    ? editingProduct ? `Edit — ${editingProduct.name}` : 'Add New Product'
    : 'Products';

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-white/90 backdrop-blur-md z-10 py-1.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isVariantTab || isCreateTab) {
                setActiveTab('list');
                setVariantPanel(null);
                setEditingProduct(null);
              } else {
                navigate('/');
              }
            }}
            className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-bold text-slate-900 leading-tight">{pageTitle}</h1>
            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
              Product Master
            </span>
          </div>
        </div>

        {/* Tab switcher — hidden on variant panel */}
        {!isVariantTab && (
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[{ id: 'list', label: 'Products List', icon: Package }, { id: 'create', label: 'Add Product', icon: Plus }].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setEditingProduct(null); setVariantPanel(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-800'
                  }`}>
                  <Icon className="w-3 h-3" /> {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content panels */}
      {isListTab && (
        <ProductsList
          showToast={showToast}
          onAddVariant={handleOpenAddVariant}
          onEditProduct={handleEditProduct}
        />
      )}

      {isCreateTab && (
        <ProductForm
          initial={editingProduct}
          onSave={handleSaveProduct}
          isSaving={isSaving}
          onCancel={() => { setActiveTab('list'); setEditingProduct(null); }}
        />
      )}

      {isVariantTab && variantPanel && (
        <>
          <div className="mb-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-[11px] text-indigo-700 font-semibold">
              {variantPanel.variant ? 'Editing variant of' : 'Adding variant to'}{' '}
              <span className="font-bold">{variantPanel.product.name}</span>
              <span className="text-indigo-400 font-normal"> · Base unit: {variantPanel.product.base_unit}</span>
            </p>
          </div>
          <VariantForm
            initial={variantPanel.variant}
            baseUnit={variantPanel.product.base_unit}
            onSave={handleSaveVariant}
            isSaving={isSaving}
            onCancel={() => { setVariantPanel(null); setActiveTab('list'); }}
          />
        </>
      )}
    </div>
  );
}
