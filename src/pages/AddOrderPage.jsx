import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Calendar, FileText, ShoppingCart, CheckCircle2, Plus, Trash2, Search, X } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export default function AddOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useOutletContext();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    type: 'sale',
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'including',
    payment_mode: 'Cash on Delivery',
    branch_id: '',
    warehouse_id: '',
    assigned_employee_id: '',
    items: [
      {
        id: Date.now(),
        product_id: '',
        variant_id: '',
        quantity: 1,
        rate: 0,
        investors: []
      }
    ],
    discount: 0,
    other_charges: 0,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState({});
  const [employees, setEmployees] = useState([]);
  const [stockInventory, setStockInventory] = useState({});
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };



        const pRes = await fetch('/products/products/v1?limit=100', { headers });
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.data) setProducts(pData.data);
        }

        const eRes = await fetch('/users/get', { headers });
        if (eRes.ok) {
          const eData = await eRes.json();
          if (eData.data) setEmployees(eData.data);
        }

        const bRes = await fetch('/branches/v1', { headers });
        if (bRes.ok) {
          const bData = await bRes.json();
          setBranches(Array.isArray(bData) ? bData : (bData.data || bData.branches || []));
        }

        const wRes = await fetch('/warehouses/get', { headers });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.data) setWarehouses(wData.data);
        }
      } catch (err) {
        console.error("Failed to fetch reference data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (customerSearchTerm.trim().length > 0 && !selectedCustomerObj) {
        setIsSearchingCustomer(true);
        try {
          const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
          const cRes = await fetch(`/customer/list?search=${encodeURIComponent(customerSearchTerm)}&limit=10`, { headers });
          if (cRes.ok) {
            const cData = await cRes.json();
            setCustomerSuggestions(cData.data || []);
            setShowCustomerDropdown(true);
          }
        } catch(e) {
          console.error(e);
        } finally {
          setIsSearchingCustomer(false);
        }
      } else {
        setCustomerSuggestions([]);
        setShowCustomerDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [customerSearchTerm, selectedCustomerObj]);

  useEffect(() => {
    formData.items.forEach(async (item) => {
      if (item.variant_id && stockInventory[item.variant_id] === undefined) {
        setStockInventory(prev => ({ ...prev, [item.variant_id]: 'loading' }));
        try {
          const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
          const res = await fetch(`/inventory/inventory/unblocked?variant_id=${item.variant_id}&limit=100`, { headers });
          if (res.ok) {
            const json = await res.json();
            const records = json.data || (Array.isArray(json) ? json : []);
            const totalStock = records.reduce((sum, r) => sum + (parseFloat(r.unblocked_quantity) || parseFloat(r.available_quantity) || 0), 0);
            setStockInventory(prev => ({ ...prev, [item.variant_id]: totalStock }));
          } else {
            setStockInventory(prev => ({ ...prev, [item.variant_id]: 0 }));
          }
        } catch (err) {
          console.error("Failed to fetch stock", err);
          setStockInventory(prev => ({ ...prev, [item.variant_id]: 0 }));
        }
      }
    });
  }, [formData.items, stockInventory]);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/orders/v1/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const ord = json.data;

            let invDate = '';
            if (ord.invoice_date) {
              const d = new Date(ord.invoice_date);
              if (!isNaN(d.getTime())) {
                invDate = d.toISOString().split('T')[0];
              }
            }

            // Fetch variants for all products in this order
            if (ord.items && ord.items.length > 0) {
              const variantPromises = ord.items.map(async (item) => {
                if (!item.product_id) return;
                try {
                  const vRes = await fetch(`/products/products/${item.product_id}/variants`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                  });
                  if (vRes.ok) {
                    const vData = await vRes.json();
                    if (vData.success && vData.data) {
                      setVariants(prev => ({ ...prev, [item.product_id]: vData.data }));
                    }
                  }
                } catch (e) {
                  console.error(e);
                }
              });
              await Promise.all(variantPromises);
            }

            if (ord.customer) {
              setSelectedCustomerObj(ord.customer);
              setCustomerSearchTerm(ord.customer.company_name || ord.customer.name || '');
            }

            setFormData({
              type: ord.type || 'sale',
              customer_id: ord.customer_id || ord.customer?._id || ord.customer?.id || '',
              invoice_date: invDate,
              gst_type: ord.gst_type || 'including',
              payment_mode: ord.payment_mode || 'Cash on Delivery',
              branch_id: ord.branch_id || ord.branch || '',
              assigned_employee_id: ord.assigned_employee_id || ord.assigned_employee || '',
              items: ord.items?.map(item => ({
                id: Math.random(),
                product_id: item.product_id || '',
                variant_id: item.variant_id || '',
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                investors: []
              })) || [],
              discount: ord.discount || 0,
              other_charges: ord.other_charges || 0,
              notes: ord.notes || ''
            });
          }
        } else {
          showToast('Failed to fetch order details');
          navigate('/orders');
        }
      } catch (error) {
        console.error(error);
        showToast('Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, isEditMode, navigate, showToast]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = async (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === 'product_id') {
        newItems[index].variant_id = '';
      }

      return { ...prev, items: newItems };
    });

    if (field === 'product_id' && value) {
      if (!variants[value]) {
        try {
          const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
          const res = await fetch(`/products/products/${value}/variants`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setVariants(prev => ({ ...prev, [value]: data.data }));
              if (data.data.length === 1) {
                setFormData(prev => {
                  const newItems = [...prev.items];
                  newItems[index].variant_id = data.data[0].id || data.data[0]._id;
                  return { ...prev, items: newItems };
                });
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch variants", err);
        }
      } else {
        const productVariants = variants[value];
        if (productVariants && productVariants.length === 1) {
          setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index].variant_id = productVariants[0].id || productVariants[0]._id;
            return { ...prev, items: newItems };
          });
        }
      }
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          product_id: '',
          variant_id: '',
          quantity: 1,
          rate: 0,
          investors: []
        }
      ]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = { ...formData };

      if (payload.invoice_date) {
        payload.invoice_date = new Date(payload.invoice_date).toISOString();
      } else {
        delete payload.invoice_date;
      }

      delete payload.vendor_id;

      payload.discount = parseFloat(payload.discount) || 0;
      payload.other_charges = parseFloat(payload.other_charges) || 0;

      payload.items = payload.items.map(item => {
        const { id, ...rest } = item;
        return {
          ...rest,
          quantity: parseFloat(rest.quantity) || 0,
          rate: parseFloat(rest.rate) || 0,
          investors: []
        };
      });

      if (!payload.customer_id) {
        showToast("Customer is required");
        setIsSaving(false);
        return;
      }
      if (payload.items.length === 0) {
        showToast("At least one item is required");
        setIsSaving(false);
        return;
      }

      console.log(payload)

      const endpoint = isEditMode ? `/orders/update/v1/${id}` : '/orders/v1';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.status)) {
        showToast(`Sales order ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/orders');
      } else {
        let errMsg = data.message || data.detail || `Failed to ${isEditMode ? 'update' : 'create'} order`;
        if (Array.isArray(data.detail)) {
          errMsg = data.detail.map(err => `${err.loc?.join('.') || 'Field'}: ${err.msg}`).join(' | ');
        }
        showToast(errMsg);
      }
    } catch (err) {
      console.error(err);
      showToast('Network error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors bg-white hover:bg-slate-50 placeholder:text-slate-400";
  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5";
  const cardClass = "bg-white rounded-[1.5rem] border border-slate-200/80 shadow-sm overflow-hidden mb-5";
  const cardHeaderClass = "px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-slate-500">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-20 py-3 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} type="button" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Sales & Billing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Order')}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Building2 className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Order Details</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2 relative">
              <label className={labelClass}>Customer *</label>
              {!selectedCustomerObj ? (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search customer by name..."
                    value={customerSearchTerm}
                    onChange={(e) => {
                      setCustomerSearchTerm(e.target.value);
                      if (!e.target.value) setShowCustomerDropdown(false);
                    }}
                    onFocus={() => { if(customerSuggestions.length > 0) setShowCustomerDropdown(true); }}
                    className={`${inputClass} pl-9`}
                  />
                  {isSearchingCustomer && (
                    <div className="absolute right-3 top-2.5 w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  )}
                  {showCustomerDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                      {customerSuggestions.length > 0 ? (
                        customerSuggestions.map(c => (
                          <div
                            key={c.mongo_id || c._id || c.id}
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                            onClick={() => {
                              setSelectedCustomerObj(c);
                              setCustomerSearchTerm(c.company_name || c.business_name || c.name || 'Unnamed Customer');
                              handleChange('customer_id', c.mongo_id || c._id || c.id);
                              setShowCustomerDropdown(false);
                            }}
                          >
                            <div className="font-bold text-slate-800 text-sm">{c.company_name || c.business_name || c.name || 'Unnamed Customer'}</div>
                            <div className="text-xs text-slate-500">{c.email || c.phone || 'No contact info'}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-slate-500 text-center">No customers found</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 border border-indigo-200 bg-indigo-50/50 rounded-xl">
                  <div>
                    <div className="font-bold text-indigo-900 text-sm">{selectedCustomerObj.company_name || selectedCustomerObj.business_name || selectedCustomerObj.name || 'Unnamed Customer'}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomerObj(null);
                      setCustomerSearchTerm('');
                      handleChange('customer_id', '');
                    }}
                    className="p-1 rounded-md text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>Invoice Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input type="date" value={formData.invoice_date} onChange={e => handleChange('invoice_date', e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>GST Calculation</label>
              <select disabled value={formData.gst_type} onChange={e => handleChange('gst_type', e.target.value)} className={`${inputClass} opacity-70 bg-slate-50 cursor-not-allowed text-slate-500`}>
                <option value="including">Including GST (Rate includes GST)</option>
                <option value="excluding">Excluding GST (Rate doesn't include GST)</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className={labelClass}>Payment Mode *</label>
              <select required value={formData.payment_mode} onChange={e => handleChange('payment_mode', e.target.value)} className={inputClass}>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Credit">Credit</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className={labelClass}>Branch / Hub *</label>
              <select required value={formData.branch_id} onChange={e => handleChange('branch_id', e.target.value)} className={inputClass}>
                <option value="">Select Branch...</option>
                {branches.map(b => <option key={b.id || b._id} value={b.id || b._id}>{b.name || b.branch_name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-1">
              <label className={labelClass}>Warehouse *</label>
              <select required value={formData.warehouse_id} onChange={e => handleChange('warehouse_id', e.target.value)} className={inputClass}>
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>Assigned Employee *</label>
              <select required value={formData.assigned_employee_id} onChange={e => handleChange('assigned_employee_id', e.target.value)} className={inputClass}>
                <option value="">Select Employee...</option>
                {employees.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name || e.first_name || 'Unnamed Employee'}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-emerald-100 rounded-lg"><ShoppingCart className="w-4 h-4 text-emerald-600" /></div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex-1">2. Order Items</h2>
            <button type="button" onClick={addItem} className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-emerald-200">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="p-3 w-1/3 min-w-[200px]">Product *</th>
                  <th className="p-3 w-1/3 min-w-[200px]">Variant *</th>
                  <th className="p-3 w-24">Qty *</th>
                  <th className="p-3 w-28">Rate (₹) *</th>
                  <th className="p-3 w-32 text-right">Total (₹)</th>
                  <th className="p-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.items.map((item, index) => {
                  const itemVariants = variants[item.product_id] || [];
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 align-top transition-colors">
                      <td className="p-3">
                        <select required value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} className={`${inputClass} !py-2`}>
                          <option value="">Select Product...</option>
                          {products.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <select required value={item.variant_id} onChange={e => handleItemChange(index, 'variant_id', e.target.value)} className={`${inputClass} !py-2`} disabled={!item.product_id}>
                          <option value="">Select Variant...</option>
                          {itemVariants.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.name} ({v.sku})</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <input type="number" min="0.01" step="0.01" required value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className={`${inputClass} !py-2`} />
                        {item.variant_id && stockInventory[item.variant_id] !== undefined && (
                          <div className={`text-[10px] mt-1 font-semibold ${stockInventory[item.variant_id] > 0 || stockInventory[item.variant_id] === 'loading' ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {stockInventory[item.variant_id] === 'loading' ? 'Loading stock...' : `Stock: ${stockInventory[item.variant_id]}`}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <input type="number" min="0" step="0.01" required value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className={`${inputClass} !py-2`} />
                      </td>
                      <td className="p-3 font-black text-slate-800 text-right">
                        ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        {formData.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-1" title="Remove Item">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-amber-100 rounded-lg"><FileText className="w-4 h-4 text-amber-600" /></div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Totals & Notes</h2>
          </div>
          <div className="p-5 flex flex-col lg:flex-row gap-5">
            <div className="w-full lg:w-2/3">
              <label className={labelClass}>Order Notes</label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Any special instructions..."
                className={inputClass}
              />
            </div>

            <div className="w-full lg:w-1/3 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-end">
              <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3">
                <span className="font-bold text-sm uppercase tracking-wider">Grand Total</span>
                <span className="font-black text-2xl text-emerald-600">
                  ₹{formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
