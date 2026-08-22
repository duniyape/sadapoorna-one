import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Calendar, FileText, ShoppingCart, CheckCircle2, Plus, Trash2, Users } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

export default function AddPurchaseOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useOutletContext();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    type: 'purchase',
    vendor_id: '',
    warehouse_id: '',
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'excluding',
    items: [
      {
        id: Date.now(), // temp id for React key
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

  // Reference data for dropdowns
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState({}); // Maps product_id -> variants array
  const [users, setUsers] = useState([]);

  // Fetch reference data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        // Fetch vendors
        const vRes = await fetch('/vendors/v1', { headers });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.data) setVendors(vData.data);
        }

        // Fetch warehouses
        const wRes = await fetch('/warehouses/get', { headers });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.data) setWarehouses(wData.data);
        }

        // Fetch products
        const pRes = await fetch('/products/products/v1', { headers });
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.data) setProducts(pData.data);
        }

        // Fetch users (investors)
        const uRes = await fetch('/users/get?limit=500', { headers });
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData.data) setUsers(uData.data);
        }
      } catch (err) {
        console.error("Failed to fetch reference data", err);
      }
    };
    fetchData();
  }, []);

  // Fetch PO details if in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    
    const fetchPO = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/orders/v1/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const po = json.data;
            
            // Format date correctly
            let invDate = '';
            if (po.invoice_date) {
              const d = new Date(po.invoice_date);
              if (!isNaN(d.getTime())) {
                invDate = d.toISOString().split('T')[0];
              }
            }
            
            setFormData({
              type: po.type || 'purchase',
              vendor_id: po.vendor_id || '',
              warehouse_id: po.warehouse_id || '',
              invoice_no: po.invoice_no || '',
              invoice_date: invDate,
              gst_type: po.gst_type || 'excluding',
              items: po.items?.map(item => ({
                id: Math.random(),
                product_id: item.product_id || '',
                variant_id: item.variant_id || '',
                quantity: item.quantity || 1,
                rate: item.rate || 0,
                investors: item.investors?.map(inv => ({
                  id: Math.random(),
                  investor_id: inv.investor_id || '',
                  quantity: inv.quantity || 1
                })) || []
              })) || [],
              discount: po.discount || 0,
              other_charges: po.other_charges || 0,
              notes: po.notes || ''
            });
          }
        } else {
          showToast('Failed to fetch purchase order details');
          navigate('/purchase-orders');
        }
      } catch (error) {
        console.error(error);
        showToast('Network error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPO();
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

  const addInvestor = (itemIndex) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex].investors.push({
        id: Date.now(),
        investor_id: '',
        quantity: 1
      });
      return { ...prev, items: newItems };
    });
  };

  const removeInvestor = (itemIndex, investorIndex) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex].investors.splice(investorIndex, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleInvestorChange = (itemIndex, investorIndex, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[itemIndex].investors[investorIndex] = {
        ...newItems[itemIndex].investors[investorIndex],
        [field]: value
      };
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Clean up payload (remove temp ids)
      const payload = { ...formData };
      
      // Format the date properly for the backend if it's set
      if (payload.invoice_date) {
        payload.invoice_date = new Date(payload.invoice_date).toISOString();
      } else {
        delete payload.invoice_date;
      }
      
      payload.discount = parseFloat(payload.discount) || 0;
      payload.other_charges = parseFloat(payload.other_charges) || 0;
      
      payload.items = payload.items.map(item => {
        const { id, ...rest } = item;
        return {
          ...rest,
          quantity: parseFloat(rest.quantity) || 0,
          rate: parseFloat(rest.rate) || 0,
          investors: rest.investors.map(inv => ({
            investor_id: inv.investor_id,
            quantity: parseFloat(inv.quantity) || 0
          }))
        };
      });

      // Simple validation
      if (!payload.vendor_id || !payload.warehouse_id) {
        showToast("Vendor and Warehouse are required");
        setIsSaving(false);
        return;
      }
      if (!payload.invoice_no) {
        showToast("Invoice Number is required");
        setIsSaving(false);
        return;
      }
      if (payload.items.length === 0) {
        showToast("At least one item is required");
        setIsSaving(false);
        return;
      }
      
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
        showToast(`Purchase order ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/purchase-orders');
      } else {
        let errMsg = data.message || data.detail || `Failed to ${isEditMode ? 'update' : 'create'} purchase order`;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-20 py-3 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchase-orders')} type="button" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </h1>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Inventory & Logistics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/purchase-orders')}
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
        
        {/* Basic Details */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Building2 className="w-4 h-4 text-indigo-600" /></div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Order Details</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2">
              <label className={labelClass}>Vendor / Supplier *</label>
              <select required value={formData.vendor_id} onChange={e => handleChange('vendor_id', e.target.value)} className={inputClass}>
                <option value="">Select Vendor...</option>
                {vendors.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.business_name || v.name || 'Unnamed Vendor'}</option>)}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Destination Warehouse *</label>
              <select required value={formData.warehouse_id} onChange={e => handleChange('warehouse_id', e.target.value)} className={inputClass}>
                <option value="">Select Warehouse...</option>
                {warehouses.map(w => <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Invoice No. *</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input required type="text" value={formData.invoice_no} onChange={e => handleChange('invoice_no', e.target.value)} placeholder="e.g. INV-2024-001" className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Invoice Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input type="date" value={formData.invoice_date} onChange={e => handleChange('invoice_date', e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>GST Calculation</label>
              <select required value={formData.gst_type} onChange={e => handleChange('gst_type', e.target.value)} className={inputClass}>
                <option value="excluding">Excluding GST (Rate doesn't include GST)</option>
                <option value="including">Including GST (Rate includes GST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Order Items */}
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
                  <th className="p-3 w-1/4 min-w-[180px]">Product *</th>
                  <th className="p-3 w-1/4 min-w-[180px]">Variant *</th>
                  <th className="p-3 w-24">Qty *</th>
                  <th className="p-3 w-28">Rate (₹) *</th>
                  {/* <th className="p-3 min-w-[220px]">Investor Allocations</th> */}
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
                      </td>
                      <td className="p-3">
                        <input type="number" min="0" step="0.01" required value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className={`${inputClass} !py-2`} />
                      </td>
                      {/* <td className="p-3">
                        <div className="space-y-2">
                          {item.investors.map((inv, iIdx) => (
                            <div key={inv.id} className="flex items-center gap-1.5">
                              <select required value={inv.investor_id} onChange={e => handleInvestorChange(index, iIdx, 'investor_id', e.target.value)} className={`${inputClass} !py-1 !px-2 !text-[11px] flex-1`}>
                                <option value="">Select Investor...</option>
                                {users.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.first_name} {u.last_name}</option>)}
                              </select>
                              <input type="number" min="0.01" step="0.01" required placeholder="Qty" value={inv.quantity} onChange={e => handleInvestorChange(index, iIdx, 'quantity', e.target.value)} className={`${inputClass} !py-1 !px-2 !text-[11px] w-16`} />
                              <button type="button" onClick={() => removeInvestor(index, iIdx)} className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Remove Investor">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addInvestor(index)} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 w-full justify-center p-1.5 border border-dashed border-indigo-200 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                            <Plus className="w-3 h-3" /> Add Investor
                          </button>
                        </div>
                      </td> */}
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

        {/* Totals & Notes */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="p-1.5 bg-amber-100 rounded-lg"><FileText className="w-4 h-4 text-amber-600" /></div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Totals & Notes</h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Total Discount (₹)</label>
                <input type="number" min="0" step="0.01" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Other Charges (₹)</label>
                <input type="number" min="0" step="0.01" value={formData.other_charges} onChange={e => handleChange('other_charges', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Order Notes</label>
              <textarea 
                rows={4} 
                value={formData.notes} 
                onChange={e => handleChange('notes', e.target.value)} 
                placeholder="Any special instructions..." 
                className={inputClass}
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
