import React, { useState, useEffect } from 'react';
import { Package, Search, Building2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function WarehouseInventoryPage() {
  const { showToast } = useOutletContext();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [wRes, pRes] = await Promise.all([
        fetch('/warehouses/get', { headers }).catch(() => null),
        fetch('/products/products/v1?limit=100', { headers }).catch(() => null)
      ]);

      if (wRes && wRes.ok) {
        const wJson = await wRes.json();
        setWarehouses(wJson.data || []);
      }
      
      if (pRes && pRes.ok) {
        const pJson = await pRes.json();
        setProducts(pJson.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, limit, searchQuery, warehouseId, productId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Build query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      if (warehouseId) {
        queryParams.append('warehouse_id', warehouseId);
      }
      if (productId) {
        queryParams.append('product_id', productId);
      }

      const res = await fetch(`/inventory/warehouse-inventory?${queryParams.toString()}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setInventory(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.total_pages || 1);
        }
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading warehouse inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInventory();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">View stock levels across all warehouses</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto">
          <select
            value={warehouseId}
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
            className="w-full lg:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
            ))}
          </select>

          <select
            value={productId}
            onChange={(e) => { setProductId(e.target.value); setPage(1); }}
            className="w-full lg:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
            ))}
          </select>

          <form onSubmit={handleSearch} className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Warehouse</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Product Info</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">In Qty</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Out Qty</th>
                <th className="p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading inventory data...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <span>No inventory records found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                inventory.map((item, idx) => (
                  <tr key={`${item.warehouse_id}-${item.variant_id}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-900">
                          {item.warehouse_name || 'Unassigned'}
                        </span>
                      </div>
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
                      <span className="text-sm font-semibold text-slate-600">
                        {item.warehouse_in_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-semibold text-slate-600">
                        {item.warehouse_out_quantity}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        {item.available_quantity} {item.package}
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
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
