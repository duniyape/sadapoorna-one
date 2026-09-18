import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { BookOpen, Search, ArrowLeft, Filter, Download, FileSpreadsheet, ArrowRight, TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function StockLedgerPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [ledger, setLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Master Data
  const [warehouses, setWarehouses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const fetchMasters = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [wRes, vRes, pRes] = await Promise.all([
        fetch('/warehouses/get', { headers }).catch(() => null),
        fetch('/vehicles/get', { headers }).catch(() => null),
        fetch('/products/products/v1?limit=100', { headers }).catch(() => null)
      ]);

      if (wRes?.ok) {
        const json = await wRes.json();
        setWarehouses(json.data || []);
      }
      if (vRes?.ok) {
        const json = await vRes.json();
        setVehicles(json.data || []);
      }
      if (pRes?.ok) {
        const json = await pRes.json();
        setProducts(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load filter data", err);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  // Update variants when product changes
  useEffect(() => {
    setVariantId(""); // Reset variant when product changes
    if (!productId) {
      setVariants([]);
      return;
    }
    const fetchVariants = async () => {
      try {
        const res = await fetch(`/products/products/${productId}/variants`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setVariants(data.data || data || []);
        }
      } catch (err) {
        console.error("Failed to fetch variants", err);
      }
    };
    fetchVariants();
  }, [productId]);

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (fromDate) params.append("from_date", fromDate);
      if (toDate) params.append("to_date", toDate);
      if (warehouseId) params.append("warehouse_id", warehouseId);
      if (vehicleId) params.append("vehicle_id", vehicleId);
      if (productId) params.append("product_id", productId);
      if (variantId) params.append("variant_id", variantId);
      if (batchNo) params.append("batch_no", batchNo);

      const res = await fetch(`/inventory/inventory/ledger?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setLedger(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.total_pages || 1);
        }
      } else {
        showToast("Failed to load stock ledger");
      }
    } catch (err) {
      showToast("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, fromDate, toDate, warehouseId, vehicleId, productId, variantId, batchNo, showToast]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLedger();
  };

  const getActionColor = (action) => {
    if (!action) return "text-slate-600 bg-slate-50 border-slate-200";
    if (action.includes("SALE") || action.includes("OUTWARD")) return "text-rose-600 bg-rose-50 border-rose-200";
    if (action.includes("PURCHASE") || action.includes("INWARD") || action.includes("RETURN")) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    return "text-indigo-600 bg-indigo-50 border-indigo-200";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/main-inventory")}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-indigo-500" />
              Stock Ledger
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Chronological stock statement, movements, and running balance
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2 text-sm transition-colors shadow-lg shadow-slate-200">
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-indigo-500" /> Filter Ledger
        </h3>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Search Text</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Doc No, Keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            
            {/* Product */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Product</label>
              <select 
                value={productId} 
                onChange={(e) => setProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Products</option>
                {products.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Variant */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Variant</label>
              <select 
                value={variantId} 
                onChange={(e) => setVariantId(e.target.value)}
                disabled={!productId || variants.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              >
                <option value="">All Variants</option>
                {variants.map(v => (
                  <option key={v.id || v._id} value={v.id || v._id}>{v.name || v.sku}</option>
                ))}
              </select>
            </div>

            {/* Batch No */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Batch No</label>
              <input 
                type="text"
                placeholder="e.g. BAT-001"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Warehouse */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Warehouse</label>
                <select 
                  value={warehouseId} 
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.id || w._id} value={w.id || w._id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Vehicle</label>
                <select 
                  value={vehicleId} 
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Vehicles</option>
                  {vehicles.map(v => (
                    <option key={v.id || v._id} value={v.id || v._id}>{v.vehicle_number || v.name}</option>
                  ))}
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">From Date</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">To Date</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
            <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200/50">
              <Filter className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* ── Ledger Data Table ─────────────────────────────────── */}
      <div className="overflow-x-auto pb-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-3 whitespace-nowrap">Date & Time</th>
              <th className="px-3 py-3 whitespace-nowrap">Action / Reference</th>
              <th className="px-3 py-3 whitespace-nowrap">Product & Batch</th>
              <th className="px-3 py-3 whitespace-nowrap">Movement (From → To)</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Inward</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Outward</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Rate</th>
              <th className="px-3 py-3 text-right whitespace-nowrap">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm font-bold text-slate-500">Loading ledger data...</p>
                  </div>
                </td>
              </tr>
            ) : ledger.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-12 text-center">
                  <div className="inline-flex w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No records found</h3>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or dates.</p>
                </td>
              </tr>
            ) : (
              ledger.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  {/* Date */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {row.date.split(" ")[0]}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-0.5 ml-5">
                      {row.date.split(" ")[1]}
                    </div>
                  </td>
                  
                  {/* Action & Ref */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getActionColor(row.action)}`}>
                      {row.action_label}
                    </div>
                    <div className="text-xs font-bold text-slate-600 mt-1.5 font-mono">
                      {row.document_no}
                    </div>
                  </td>

                  {/* Product & Batch */}
                  <td className="px-3 py-3">
                    <div className="text-xs font-bold text-slate-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">
                      {row.product_name}
                    </div>
                    {row.batch_no && (
                      <Link 
                        to={`/batch-timeline/${row.batch_no}`}
                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5 inline-block"
                      >
                        {row.batch_no}
                      </Link>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold whitespace-nowrap">
                      <span className="text-slate-600 truncate max-w-[120px]" title={row.from_location}>{row.from_location}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-900 truncate max-w-[120px]" title={row.to_location}>{row.to_location}</span>
                    </div>
                  </td>

                  {/* Inward */}
                  <td className="px-3 py-3 text-right">
                    {row.inward_quantity > 0 ? (
                      <div className="text-sm font-black text-emerald-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3" /> +{row.inward_quantity}
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </td>

                  {/* Outward */}
                  <td className="px-3 py-3 text-right">
                    {row.outward_quantity > 0 ? (
                      <div className="text-sm font-black text-rose-600 flex items-center justify-end gap-1">
                        <TrendingDown className="w-3 h-3" /> -{row.outward_quantity}
                      </div>
                    ) : <span className="text-slate-300">-</span>}
                  </td>

                  {/* Rate */}
                  <td className="px-3 py-3 text-right">
                    <div className="text-sm font-bold text-slate-600">₹{row.unit_cost?.toLocaleString()}</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Val: ₹{row.total_value?.toLocaleString()}</div>
                  </td>

                  {/* Running Balance */}
                  <td className="px-3 py-3 text-right bg-slate-50/50">
                    <div className="text-base font-black text-slate-900">
                      {row.running_balance?.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 rounded-xl">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
