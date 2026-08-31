import React, { useState } from 'react';
import { ArrowLeft, Building2, Calendar, FileText, ShoppingCart, CheckCircle2, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function CreateReturnOrderPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [originalOrder, setOriginalOrder] = useState(null);

  const [formData, setFormData] = useState({
    type: 'sale_return',
    parent_order_id: '',
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'including',
    items: [],
    discount: 0,
    other_charges: 0,
    notes: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const searchOrder = async () => {
    if (!searchQuery.trim()) {
      showToast('Please enter an Order ID or Invoice Number');
      return;
    }

    setIsSearching(true);
    setOriginalOrder(null);
    try {
      let foundOrder = null;
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

      if (/^[0-9a-fA-F]{24}$/.test(searchQuery.trim()) || searchQuery.length > 20) {
        try {
          const res = await fetch(`/orders/v1/${searchQuery.trim()}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              foundOrder = data.data;
            }
          }
        } catch (e) {
          console.error("Fetch by ID failed, falling back to search", e);
        }
      }

      if (!foundOrder) {
        const res = await fetch(`/orders/v1?search=${encodeURIComponent(searchQuery.trim())}&limit=5`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const exactMatch = data.data.find(o => o.invoice_no === searchQuery.trim() || o.id === searchQuery.trim() || o._id === searchQuery.trim());
            foundOrder = exactMatch || data.data[0];
          }
        }
      }

      if (foundOrder) {
        setOriginalOrder(foundOrder);
        setFormData({
          type: 'sale_return',
          parent_order_id: foundOrder._id || foundOrder.id,
          customer_id: foundOrder.customer_id || foundOrder.customer?._id || foundOrder.customer?.id || '',
          invoice_date: new Date().toISOString().split('T')[0],
          gst_type: foundOrder.gst_type || 'including',
          items: (foundOrder.items || []).map(item => ({
            ...item,
            id: item.id || Math.random(),
            original_quantity: item.quantity,
            return_quantity: 0
          })),
          discount: 0,
          other_charges: 0,
          notes: ''
        });
        showToast('Order found. Select quantities to return.');
      } else {
        showToast('No order found with this ID or Invoice Number');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while searching for order');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReturnQuantityChange = (index, value) => {
    const val = parseFloat(value) || 0;
    setFormData(prev => {
      const newItems = [...prev.items];
      const maxReturn = newItems[index].original_quantity;
      newItems[index].return_quantity = Math.min(Math.max(0, val), maxReturn);
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalOrder) {
      showToast("Please search and select an order first");
      return;
    }

    const itemsToReturn = formData.items.filter(item => item.return_quantity > 0);

    if (itemsToReturn.length === 0) {
      showToast("Please specify return quantity for at least one item");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        type: 'sale_return',
        parent_order_id: formData.parent_order_id,
        customer_id: formData.customer_id,
        invoice_date: new Date(formData.invoice_date).toISOString(),
        gst_type: formData.gst_type,
        notes: formData.notes,
        discount: 0,
        other_charges: 0,
        items: itemsToReturn.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.return_quantity,
          rate: item.rate,
          investors: []
        }))
      };

      const res = await fetch('/orders/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success || data.status)) {
        showToast(`Return order created successfully!`);
        navigate('/orders');
      } else {
        let errMsg = data.message || data.detail || 'Failed to create return order';
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

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-20 py-3 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/orders')} type="button" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Create Return Order
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
            disabled={isSaving || !originalOrder}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Submit Return'}
            {!isSaving && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className={cardClass}>
        <div className={cardHeaderClass}>
          <div className="p-1.5 bg-indigo-100 rounded-lg"><Search className="w-4 h-4 text-indigo-600" /></div>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Find Original Order</h2>
        </div>
        <div className="p-5">
          <div className="flex items-end gap-4 max-w-xl">
            <div className="flex-1">
              <label className={labelClass}>Order ID or Invoice Number</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g. INV-1234 or MongoDB ID"
                className={inputClass}
                onKeyDown={e => e.key === 'Enter' && searchOrder()}
              />
            </div>
            <button
              type="button"
              onClick={searchOrder}
              disabled={isSearching}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {originalOrder && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
              <div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Order Found</div>
                <div className="font-bold text-slate-800 mt-1">Invoice: {originalOrder.invoice_no || originalOrder.id || originalOrder._id}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Customer: {originalOrder.customer?.company_name || originalOrder.customer?.name || 'Unknown'} | Date: {new Date(originalOrder.invoice_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {originalOrder && (
        <form onSubmit={handleSubmit}>
          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <div className="p-1.5 bg-emerald-100 rounded-lg"><ShoppingCart className="w-4 h-4 text-emerald-600" /></div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex-1">2. Select Items to Return</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="p-3 w-1/3 min-w-[200px]">Product</th>
                    <th className="p-3 w-1/4">Variant</th>
                    <th className="p-3 w-24 text-right">Original Qty</th>
                    <th className="p-3 w-28 text-right">Rate (₹)</th>
                    <th className="p-3 w-32 text-center">Return Qty *</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 align-middle transition-colors">
                      <td className="p-3 font-semibold text-slate-800 text-xs">
                        {item.product_name || 'Product'}
                      </td>
                      <td className="p-3 text-xs text-slate-600">
                        {item.variant_name || 'Variant'} {item.sku ? `(${item.sku})` : ''}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700 text-xs">
                        {item.original_quantity}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-700 text-xs">
                        ₹{item.rate}
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max={item.original_quantity}
                          step="0.01"
                          value={item.return_quantity}
                          onChange={e => handleReturnQuantityChange(index, e.target.value)}
                          className={`${inputClass} !py-2 text-center border-indigo-200 focus:border-indigo-500`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={cardClass}>
            <div className={cardHeaderClass}>
              <div className="p-1.5 bg-amber-100 rounded-lg"><FileText className="w-4 h-4 text-amber-600" /></div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Return Details & Notes</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Return Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="date" value={formData.invoice_date} onChange={e => handleChange('invoice_date', e.target.value)} className={`${inputClass} pl-9`} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Return Notes / Reason</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="Reason for return..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
