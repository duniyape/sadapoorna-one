import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Search, Building2, Truck, Calendar, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';

function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

export default function BatchStockPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext() || { showToast: console.log };
  
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [productId, setProductId] = useState('');
  const [locationType, setLocationType] = useState('');
  
  // Metadata for dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ total_batches: 0, total_available_quantity: 0, total_valuation: 0 });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [wRes, pRes, vRes] = await Promise.all([
        fetch('/warehouses/get', { headers }).catch(() => null),
        fetch('/products/products/v1?limit=100', { headers }).catch(() => null),
        fetch('/vehicles/get', { headers }).catch(() => null)
      ]);

      if (wRes && wRes.ok) {
        const wJson = await wRes.json();
        setWarehouses(wJson.data || []);
      }
      
      if (pRes && pRes.ok) {
        const pJson = await pRes.json();
        setProducts(pJson.data || []);
      }

      if (vRes && vRes.ok) {
        const vJson = await vRes.json();
        setVehicles(vJson.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async (currentPage = page, currentSearch = searchQuery) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });

      if (currentSearch) queryParams.append('search', currentSearch);
      if (warehouseId) queryParams.append('warehouse_id', warehouseId);
      if (vehicleId) queryParams.append('vehicle_id', vehicleId);
      if (productId) queryParams.append('product_id', productId);
      if (locationType) queryParams.append('location_type', locationType);

      const res = await fetch(`/inventory/batch-stock?${queryParams.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setBatches(json.data || []);
          if (json.pagination) {
            setTotalPages(json.pagination.total_pages || 1);
          }
          if (json.summary) {
            setSummary(json.summary);
          }
        }
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading batch stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches(page, searchQuery);
  }, [page, warehouseId, vehicleId, productId, locationType]);

  const debouncedSearch = useDebounce((value) => {
    setSearchQuery(value);
    setPage(1);
    fetchBatches(1, value);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Batch Stock</h1>
            <p className="text-sm text-slate-500 mt-1">Track inventory across all batches</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Batches</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total_batches}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Physical Qty</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total_available_quantity}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Available to Sale</p>
            <p className="text-2xl font-bold text-slate-900">{summary.total_available_to_sale ?? summary.total_available_for_sale ?? '-'}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="text-xl font-bold font-serif">₹</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Valuation</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total_valuation)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by batch no, sku, invoice..."
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <select
            value={locationType}
            onChange={(e) => { setLocationType(e.target.value); setPage(1); }}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Locations</option>
            <option value="warehouse">Warehouse</option>
            <option value="vehicle">Vehicle</option>
            <option value="unallocated">Unallocated</option>
          </select>

          <select
            value={warehouseId}
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
            disabled={locationType === 'vehicle' || locationType === 'unallocated'}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
            ))}
          </select>

          <select
            value={vehicleId}
            onChange={(e) => { setVehicleId(e.target.value); setPage(1); }}
            disabled={locationType === 'warehouse' || locationType === 'unallocated'}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id || v._id} value={v.id || v._id}>{v.vehicle_number || v.name}</option>
            ))}
          </select>

          <select
            value={productId}
            onChange={(e) => { setProductId(e.target.value); setPage(1); }}
            className="w-full md:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Batch Details</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Info</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Qty (In / Out / Avail)</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Value</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">Loading batch stock data...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>No batches found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.batch_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-indigo-600">{batch.batch_no}</p>
                        <div className="flex items-center text-xs text-slate-500 gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{batch.purchase_date?.split(' ')[0]}</span>
                        </div>
                        <p className="text-xs text-slate-400">Inv: {batch.invoice_no}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {batch.location_type === 'warehouse' ? (
                          <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : batch.location_type === 'vehicle' ? (
                          <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <span className="text-sm font-medium text-slate-900 capitalize block">
                            {batch.location_type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {batch.location_type === 'warehouse' ? batch.warehouse_name : 
                             batch.location_type === 'vehicle' ? batch.vehicle_number : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{batch.product_name}</p>
                          <p className="text-xs text-slate-500">{batch.variant_name} • {batch.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500">
                          In: {batch.purchase_quantity} | Out: {batch.sold_quantity}
                        </span>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          {batch.available_quantity} {batch.package}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(batch.remaining_value)}</p>
                        <p className="text-xs text-slate-500">Rate: {formatCurrency(batch.purchase_rate)}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        batch.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {batch.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
