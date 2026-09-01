import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import WarehouseInventoryPage from './WarehouseInventoryPage';

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

export default function MainInventoryPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('main');
  const limit = 20;

  const fetchInventory = async (currentPage, currentSearch) => {
    setIsLoading(true);
    try {
      let url = `/inventory/main_inventory?page=${currentPage}&limit=${limit}`;
      if (currentSearch) {
        url += `&search=${encodeURIComponent(currentSearch)}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setInventory(json.data || []);
          setTotalPages(json.pagination?.total_pages || 1);
          setTotalItems(json.pagination?.total || 0);
        } else {
          showToast('Failed to load inventory data');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(page, searchTerm);
  }, [page, searchTerm]);

  // Debounced search to avoid too many API calls while typing
  const debouncedSearch = useDebounce((value) => {
    setSearchTerm(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Inventory Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Consolidated view of all your inventory</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('main')} 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'main' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Main Inventory
        </button>
        <button 
          onClick={() => setActiveTab('warehouse')} 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'warehouse' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Warehouse Inventory
        </button>
        <button 
          onClick={() => setActiveTab('sales_stock')} 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sales_stock' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Stock Available for Sales
        </button>
        <button 
          onClick={() => setActiveTab('dummy')} 
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'dummy' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Coming Soon
        </button>
      </div>

      {activeTab === 'main' && (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Inventory Levels</h2>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search product, variant or SKU..." 
              onChange={handleSearchChange}
              className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Product Details</th>
                <th className="p-4">Packaging</th>
                <th className="p-4 text-right text-emerald-600">Purchase</th>
                <th className="p-4 text-right text-rose-600">Purchase Ret.</th>
                <th className="p-4 text-right text-sky-600">Sale</th>
                <th className="p-4 text-right text-amber-600">Sale Ret.</th>
                <th className="p-4 text-right font-black text-indigo-700 bg-indigo-50/50">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500 font-bold">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      Loading inventory data...
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500 font-bold">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                inventory.map((item, idx) => (
                  <tr key={`${item.product_id}-${item.variant_id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{item.product_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.variant_name || 'N/A'} {item.sku ? `(${item.sku})` : ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-semibold">{item.package || '-'}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{item.unit || '-'}</div>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      {item.purchase_quantity || 0}
                    </td>
                    <td className="p-4 text-right font-semibold text-rose-500">
                      {item.purchase_return_quantity || 0}
                    </td>
                    <td className="p-4 text-right font-bold text-sky-600">
                      {item.sale_quantity || 0}
                    </td>
                    <td className="p-4 text-right font-semibold text-amber-500">
                      {item.sale_return_quantity || 0}
                    </td>
                    <td className="p-4 text-right font-black text-indigo-700 text-sm bg-indigo-50/30">
                      {item.available_quantity || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevPage} 
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-bold text-slate-700 px-2">
                Page {page} of {totalPages}
              </div>
              <button 
                onClick={handleNextPage} 
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {activeTab === 'warehouse' && (
        <div className="pt-2">
          <WarehouseInventoryPage />
        </div>
      )}

      {activeTab === 'sales_stock' && (
        <div className="pt-2">
          <UnblockedInventoryTab />
        </div>
      )}

      {activeTab === 'dummy' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-20 text-center mt-4">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Coming Soon</h2>
          <p className="text-slate-500 font-medium">This inventory view is currently under development.</p>
        </div>
      )}

    </div>
  );
}

function UnblockedInventoryTab() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [warehouseId, setWarehouseId] = useState('');
  const [productId, setProductId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  
  const limit = 20;

  useEffect(() => {
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
    fetchMetadata();
  }, []);

  const fetchInventory = async (currentPage, currentSearch, currentWarehouse, currentProduct) => {
    setIsLoading(true);
    try {
      let url = `/inventory/inventory/unblocked?page=${currentPage}&limit=${limit}`;
      if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
      if (currentWarehouse) url += `&warehouse_id=${currentWarehouse}`;
      if (currentProduct) url += `&product_id=${currentProduct}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const json = await response.json();
        setInventory(json.data || []);
        setTotalPages(json.pagination?.total_pages || 1);
        setTotalItems(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(page, searchTerm, warehouseId, productId);
  }, [page, searchTerm, warehouseId, productId]);

  const debouncedSearch = useDebounce((value) => {
    setSearchTerm(value);
    setPage(1);
  }, 500);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">Stock Available for Sales</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select 
            value={warehouseId} 
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>)}
          </select>
          
          <select 
            value={productId} 
            onChange={(e) => { setProductId(e.target.value); setPage(1); }}
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products or SKU..." 
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-4">Product Details</th>
              <th className="p-4 text-right text-slate-600">Total Stock</th>
              <th className="p-4 text-right text-rose-600">Blocked (Orders)</th>
              <th className="p-4 text-right font-black text-emerald-700 bg-emerald-50/50">Unblocked (Available)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
               <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-bold">Loading...</td></tr>
            ) : inventory.length === 0 ? (
               <tr><td colSpan="4" className="p-10 text-center text-slate-500 font-bold">No stock available</td></tr>
            ) : (
               inventory.map((item, idx) => (
                 <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                   <td className="p-4">
                     <div className="font-bold text-slate-900 text-sm">{item.product_name || 'N/A'}</div>
                     <div className="text-xs text-slate-500 mt-0.5">{item.variant_name || 'N/A'} {item.sku ? `(${item.sku})` : ''}</div>
                   </td>
                   <td className="p-4 text-right font-bold text-slate-600 text-sm">{item.available_quantity || 0}</td>
                   <td className="p-4 text-right font-semibold text-rose-500">{item.blocked_quantity || 0}</td>
                   <td className="p-4 text-right font-black text-emerald-700 text-sm bg-emerald-50/30">{item.unblocked_quantity || 0}</td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && totalPages > 0 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevPage} 
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold text-slate-700 px-2">
              Page {page} of {totalPages}
            </div>
            <button 
              onClick={handleNextPage} 
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
