import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Navigate } from 'react-router-dom';
import { ArrowLeft, Search, Truck, ChevronLeft, ChevronRight, Calendar, Filter, Lock } from 'lucide-react';
import { usePermissions } from '../utils/permissions';

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

export default function VehicleAllocationsPage() {
  const { vehicle_id: paramVehicleId } = useParams();
  const navigate = useNavigate();
  const { showToast, user } = useOutletContext();
  const { isAllowed } = usePermissions(user);
  const [vehicle_id, setVehicleId] = useState(paramVehicleId || '');

  // Allow access if they have permission to 'allocations' (the wrapper) OR 'vehicle-allocations'
  if (!isAllowed({ id: 'vehicle-allocations' }) && !isAllowed({ id: 'allocations' })) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 mt-2">You do not have permission to view vehicle allocations.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm">
          Go Back
        </button>
      </div>
    );
  }

  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Products & Variants Data
  const [products, setProducts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [variants, setVariants] = useState([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [manifestIdOrNo, setManifestIdOrNo] = useState('');
  const [allocationType, setAllocationType] = useState('');
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  
  const totalPages = Math.ceil(totalItems / limit);

  // Fetch Products and Vehicles on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [pRes, vRes] = await Promise.all([
          fetch('/products/products/v1?limit=100', { headers }).catch(() => null),
          fetch('/vehicles/get', { headers }).catch(() => null)
        ]);

        if (pRes && pRes.ok) {
          const data = await pRes.json();
          setProducts(data.data || []);
        }
        if (vRes && vRes.ok) {
          const data = await vRes.json();
          setVehicles(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch metadata", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Variants when product changes
  useEffect(() => {
    setVariantId(''); // Reset variant when product changes
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

  const fetchAllocations = async (currentPage, currentManifest, currentAllocType, currentProductId, currentVariantId, targetVehicleId) => {
    const vId = targetVehicleId || vehicle_id || 'all';
    if (vId === 'all') {
      setIsLoading(false);
      setAllocations([]);
      setTotalItems(0);
      return;
    }
    
    setIsLoading(true);
    try {
      let url = `/orders/vehicle-allocations/v1/${vId}?page=${currentPage}&limit=${limit}`;
      if (currentManifest) url += `&manifest_id_or_no=${encodeURIComponent(currentManifest)}`;
      if (currentAllocType) url += `&allocation_type=${encodeURIComponent(currentAllocType)}`;
      if (currentProductId) url += `&product_id=${encodeURIComponent(currentProductId)}`;
      if (currentVariantId) url += `&variant_id=${encodeURIComponent(currentVariantId)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setAllocations(json.allocations || []);
          setTotalItems(json.total || 0);
        } else {
          showToast('Failed to load vehicle allocations');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Network error while fetching allocations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentVehicleId = vehicle_id || 'all';
    fetchAllocations(page, manifestIdOrNo, allocationType, productId, variantId, currentVehicleId);
  }, [vehicle_id, page, manifestIdOrNo, allocationType, productId, variantId, limit]);

  const debouncedManifestSearch = useDebounce((value) => {
    setManifestIdOrNo(value);
    setPage(1);
  }, 500);

  const getDirectionBadge = (direction, label) => {
    if (direction === 'INWARD') {
      return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">{label || direction}</span>;
    }
    if (direction === 'OUTWARD') {
      return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded uppercase">{label || direction}</span>;
    }
    return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">{label || direction}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Vehicle Allocations</h1>
            <p className="text-xs text-slate-500 font-medium">Stock history & transfers for this vehicle</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Allocation Records</h2>
          </div>
          
          <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 w-full md:w-auto">
            
            <div className="relative w-full md:w-48">
              <Truck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={vehicle_id}
                onChange={(e) => setVehicleId(e.target.value)}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs font-bold text-indigo-700 bg-indigo-50/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id || v._id} value={v.id || v._id}>{v.vehicle_number || v.name}</option>
                ))}
              </select>
            </div>
            
            <div className="relative w-full md:w-40">
              <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={allocationType}
                onChange={(e) => { setAllocationType(e.target.value); setPage(1); }}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
              >
                <option value="">All Types</option>
                <option value="warehouse_to_vehicle">Warehouse To Vehicle</option>
                <option value="vehicle_to_warehouse">Vehicle To Warehouse</option>
                <option value="vehicle_to_vehicle">Vehicle To Vehicle</option>
              </select>
            </div>

            <div className="relative w-full md:w-40">
              <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={productId}
                onChange={(e) => { setProductId(e.target.value); setPage(1); }}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
              >
                <option value="">All Products</option>
                {products.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-40">
              <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={variantId}
                onChange={(e) => { setVariantId(e.target.value); setPage(1); }}
                disabled={!productId}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">All Variants</option>
                {variants.map(v => (
                  <option key={v.id || v._id} value={v.id || v._id}>{v.name} {v.sku ? `(${v.sku})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Manifest No..." 
                onChange={(e) => debouncedManifestSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
              />
            </div>
            
            <div className="relative w-full md:w-32">
              <Filter className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <select 
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all bg-white"
              >
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
                <option value="200">200 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Movement / Type</th>
                <th className="p-4">Product Details</th>
                <th className="p-4 text-center">Qty / Batch</th>
                <th className="p-4 text-center">Direction</th>
                <th className="p-4 text-center">Manifest / Order</th>
                <th className="p-4 text-right">Allocated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-bold">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      Loading allocations...
                    </div>
                  </td>
                </tr>
              ) : allocations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-bold">
                    No allocation records found for this vehicle.
                  </td>
                </tr>
              ) : (
                allocations.map((a, idx) => (
                  <tr key={a._id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-800">
                            {new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          a.direction === 'INWARD' ? 'bg-emerald-100 text-emerald-600' : 
                          a.direction === 'OUTWARD' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-0.5">
                            {a.direction_label || a.allocation_type?.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 capitalize">
                            {a.allocation_type?.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium">
                            From: {a.from_location?.type || 'N/A'} → To: {a.to_location?.type || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{a.product_name || '-'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{a.variant_name || '-'} {a.sku ? `(${a.sku})` : ''}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-black text-indigo-700">{a.quantity || 0}</div>
                      {a.batch_no && <div className="text-[10px] text-slate-500 font-mono mt-0.5 px-1.5 py-0.5 bg-slate-100 rounded inline-block">{a.batch_no}</div>}
                    </td>
                    <td className="p-4 text-center">
                      {getDirectionBadge(a.direction, a.direction_label)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-semibold text-slate-700">{a.manifest_no || '-'}</div>
                      {a.order_no && <div className="text-[10px] text-indigo-600 font-bold mt-0.5">Order: {a.order_no}</div>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm font-semibold text-slate-700">{a.allocated_by_name || '-'}</div>
                    </td>
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
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-xs font-bold text-slate-700 px-2">
                Page {page} of {totalPages || 1}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
