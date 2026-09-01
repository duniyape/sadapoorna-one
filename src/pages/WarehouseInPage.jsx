import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, Package, Building2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function WarehouseInPage() {
  const { showToast } = useOutletContext();
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const [selections, setSelections] = useState({});
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [globalWarehouseId, setGlobalWarehouseId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const invRes = await fetch('/inventory/get_unallocated_inventory?page=1&limit=20', { headers });
      let invData = [];
      if (invRes.ok) {
        const json = await invRes.json();
        invData = json.data || [];
      }

      const wRes = await fetch('/warehouses/get', { headers });
      let wData = [];
      if (wRes.ok) {
        const json = await wRes.json();
        wData = json.data || [];
      }

      setItems(invData);
      setWarehouses(wData);
      
      const initialSelections = {};
      invData.forEach(item => {
        initialSelections[item.variant_id] = {
          quantity: item.available_quantity || 0
        };
      });
      setSelections(initialSelections);
      setSelectedVariantIds([]);
      setGlobalWarehouseId('');

    } catch (err) {
      console.error(err);
      showToast("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (variantId, field, value) => {
    setSelections(prev => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value
      }
    }));
  };

  const toggleSelectAll = () => {
    if (selectedVariantIds.length === items.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(items.map(i => i.variant_id));
    }
  };

  const toggleSelectOne = (variantId) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds(prev => prev.filter(id => id !== variantId));
    } else {
      setSelectedVariantIds(prev => [...prev, variantId]);
    }
  };

  const handleGlobalSubmit = async () => {
    if (selectedVariantIds.length === 0) {
      showToast("Please select at least one product");
      return;
    }
    if (!globalWarehouseId) {
      showToast("Please select a target warehouse");
      return;
    }

    const itemsToSubmit = items.filter(i => selectedVariantIds.includes(i.variant_id));
    
    for (const item of itemsToSubmit) {
      const qty = Number(selections[item.variant_id]?.quantity);
      if (!qty || qty <= 0 || qty > item.available_quantity) {
        showToast(`Invalid quantity for ${item.product_name}`);
        return;
      }
    }

    setSubmittingId('global');
    try {
      const token = localStorage.getItem('token');
      const now = new Date();
      const invoiceNo = `WINV-${now.getTime()}`;
      const invoiceDate = now.toISOString().split('T')[0];
      
      const payload = {
        type: "Warehouse_IN",
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        vendor_id: "",
        customer_id: "",
        warehouse_id: globalWarehouseId,
        gst_type: "excluding",
        items: itemsToSubmit.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: Number(selections[item.variant_id].quantity),
          rate: 0,
          investors: []
        })),
        discount: 0,
        other_charges: 0,
        status: "Completed",
        record_status: "active",
        notes: "warehouse in"
      };

      const res = await fetch('/orders/v1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast("Selected inventory added to warehouse successfully");
        fetchData(); 
      } else {
        showToast("Failed to inward selected items");
      }
    } catch (err) {
      console.error(err);
      showToast("Error submitting data");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse In</h1>
          <p className="text-sm text-slate-500 mt-1">Allocate unallocated inventory to warehouses in bulk</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={globalWarehouseId}
              onChange={(e) => setGlobalWarehouseId(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 pl-9 pr-8 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none shadow-sm"
            >
              <option value="">Select Target Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGlobalSubmit}
            disabled={submittingId === 'global' || selectedVariantIds.length === 0 || !globalWarehouseId}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              submittingId === 'global' || selectedVariantIds.length === 0 || !globalWarehouseId
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            {submittingId === 'global' ? 'Processing...' : 'Inward Selected'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedVariantIds.length === items.length}
                    onChange={toggleSelectAll}
                    disabled={loading || items.length === 0}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Info</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Available Qty</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">In Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">Loading unallocated inventory...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>No unallocated inventory found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.variant_id} className={`hover:bg-slate-50/50 transition-colors ${selectedVariantIds.includes(item.variant_id) ? 'bg-indigo-50/30' : ''}`}>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedVariantIds.includes(item.variant_id)}
                        onChange={() => toggleSelectOne(item.variant_id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-500">{item.variant_name} • {item.sku}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                            {item.variant_qty} {item.unit} = 1 {item.package}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        {item.available_quantity} {item.package}
                      </span>
                    </td>
                    <td className="p-4 w-40">
                      <input
                        type="number"
                        min="1"
                        max={item.available_quantity}
                        value={selections[item.variant_id]?.quantity || ''}
                        onChange={(e) => handleSelectionChange(item.variant_id, 'quantity', e.target.value)}
                        disabled={!selectedVariantIds.includes(item.variant_id)}
                        className={`w-full text-sm rounded-xl border px-3 py-2 transition-all ${
                          selectedVariantIds.includes(item.variant_id) 
                            ? 'border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500' 
                            : 'border-transparent bg-transparent text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
