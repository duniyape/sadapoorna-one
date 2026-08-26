import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Package, Building2, Truck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function VehicleInPage() {
  const { showToast } = useOutletContext();
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);

  const [selections, setSelections] = useState({});
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [targetVehicleId, setTargetVehicleId] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (sourceWarehouseId) {
      fetchWarehouseInventory(sourceWarehouseId);
    } else {
      setItems([]);
      setSelectedVariantIds([]);
      setSelections({});
    }
  }, [sourceWarehouseId]);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [wRes, vRes] = await Promise.all([
        fetch('/warehouses/get', { headers }).catch(() => null),
        fetch('/vehicles/get', { headers }).catch(() => null)
      ]);

      if (wRes && wRes.ok) {
        const json = await wRes.json();
        setWarehouses(json.data || []);
      }
      if (vRes && vRes.ok) {
        const json = await vRes.json();
        setVehicles(json.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading metadata");
    }
  };

  const fetchWarehouseInventory = async (warehouseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const res = await fetch(`/inventory/warehouse-inventory?warehouse_id=${warehouseId}&limit=20`, { headers });
      if (res.ok) {
        const json = await res.json();
        const invData = json.data || [];
        // Only show items with available quantity > 0
        const availableItems = invData.filter(i => i.available_quantity > 0);
        setItems(availableItems);
        
        const initialSelections = {};
        availableItems.forEach(item => {
          initialSelections[item.variant_id] = {
            quantity: item.available_quantity
          };
        });
        setSelections(initialSelections);
        setSelectedVariantIds([]);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading warehouse inventory");
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
    if (!sourceWarehouseId) {
      showToast("Please select a source warehouse");
      return;
    }
    if (!targetVehicleId) {
      showToast("Please select a target vehicle");
      return;
    }
    if (selectedVariantIds.length === 0) {
      showToast("Please select at least one product to transfer");
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
      const invoiceNo = `VINV-${now.getTime()}`;
      const invoiceDate = now.toISOString().split('T')[0];
      
      const payload = {
        type: "Vehicle_IN",
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        vendor_id: "",
        customer_id: "",
        warehouse_id: sourceWarehouseId,
        vehicle_id: targetVehicleId,
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
        status: "Confirmed",
        record_status: "active",
        notes: "warehouse to vehicle transfer"
      };

      const res = await fetch('/orders/v1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        showToast("Inventory transferred to vehicle successfully");
        setTargetVehicleId('');
        fetchWarehouseInventory(sourceWarehouseId);
      } else {
        let errMsg = "Failed to transfer inventory";
        if (data.detail && Array.isArray(data.detail)) {
          errMsg = data.detail.map(err => `${err.loc?.join('.') || 'Field'}: ${err.msg}`).join(' | ');
        } else if (data.message || data.detail) {
          errMsg = data.message || data.detail;
        }
        showToast(`Error: ${errMsg}`);
        console.error("422 Validation Error:", data);
      }
    } catch (err) {
      console.error(err);
      showToast("Error submitting transfer");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle In</h1>
          <p className="text-sm text-slate-500 mt-1">Transfer inventory from warehouse to vehicle</p>
        </div>
        <div className="flex flex-col xl:flex-row items-center gap-3">
          <div className="relative w-full xl:w-56">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={sourceWarehouseId}
              onChange={(e) => setSourceWarehouseId(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 pl-9 pr-8 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none shadow-sm"
            >
              <option value="">1. Select Warehouse</option>
              {warehouses.map(w => (
                <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          
          <ArrowRightLeft className="w-5 h-5 text-slate-300 hidden xl:block shrink-0" />
          
          <div className="relative w-full xl:w-56">
            <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={targetVehicleId}
              onChange={(e) => setTargetVehicleId(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 pl-9 pr-8 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none shadow-sm"
            >
              <option value="">2. Select Target Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id || v._id} value={v.id || v._id}>{v.name || v.vehicle_number}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGlobalSubmit}
            disabled={submittingId === 'global' || selectedVariantIds.length === 0 || !sourceWarehouseId || !targetVehicleId}
            className={`w-full xl:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              submittingId === 'global' || selectedVariantIds.length === 0 || !sourceWarehouseId || !targetVehicleId
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            {submittingId === 'global' ? 'Processing...' : 'Transfer Selected'}
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
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Available in Warehouse</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Transfer Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">Loading warehouse inventory...</td>
                </tr>
              ) : !sourceWarehouseId ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="w-8 h-8 text-slate-300" />
                      <span>Please select a source warehouse first.</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>No available inventory in this warehouse.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={`${item.variant_id}-${idx}`} className={`hover:bg-slate-50/50 transition-colors ${selectedVariantIds.includes(item.variant_id) ? 'bg-indigo-50/30' : ''}`}>
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
                    <td className="p-4 text-right">
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
                        className={`w-full text-sm text-right rounded-xl border px-3 py-2 transition-all ${
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
