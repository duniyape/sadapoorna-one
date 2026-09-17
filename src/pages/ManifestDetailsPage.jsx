import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Printer, Truck, MapPin, Calendar, Package, IndianRupee, Clock, CheckCircle } from "lucide-react";

export default function ManifestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [manifest, setManifest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchManifestDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/orders/manifest/v1/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          // Adjust based on typical FastAPI response structure (json.data or direct object)
          setManifest(json.data || json);
        } else {
          showToast("Failed to fetch manifest details");
        }
      } catch (err) {
        showToast("Network error while fetching details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchManifestDetail();
  }, [id, showToast]);

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500">Loading Trip Sheet...</p>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-700">Manifest not found</h2>
        <button onClick={() => navigate("/manifests")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 print:p-0 print:bg-white print:space-y-4">
      {/* ── Header (Hidden on Print) ─────────────────────────────── */}
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-100 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/manifests")}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Trip Sheet Details</h1>
            <p className="text-sm font-bold text-slate-500">{manifest.manifest_no}</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-indigo-200"
        >
          <Printer className="w-4 h-4" /> Print Sheet
        </button>
      </div>

      {/* ── Printable Area ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Info Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-6 print:bg-slate-100 print:text-black">
          <div>
            <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest print:text-slate-500">Trip Manifest</div>
            <div className="text-3xl font-black mt-1 tracking-tight">{manifest.manifest_no}</div>
            <div className="flex items-center gap-2 mt-4 text-slate-300 font-medium text-sm print:text-slate-600">
              <Calendar className="w-4 h-4" />
              Dispatched: {formatDate(manifest.dispatch_date)}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest print:text-slate-500">Status</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold mt-2 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              {manifest.status?.toUpperCase() || "ACTIVE"}
            </div>
          </div>
        </div>

        {/* Logistics Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50 print:bg-white print:border-b-2 print:border-black">
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">
              <MapPin className="w-4 h-4" /> Source Warehouse
            </div>
            <div className="text-base font-bold text-slate-800">
              {manifest.warehouse?.name || "N/A"}
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">
              <Truck className="w-4 h-4" /> Delivery Vehicle
            </div>
            <div className="text-base font-bold text-slate-800">
              {manifest.vehicle?.vehicle_number || "No Vehicle Assigned"}
            </div>
            {manifest.vehicle?.model && (
              <div className="text-sm font-semibold text-slate-500 mt-1">
                Model: {manifest.vehicle.model}
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">
              <IndianRupee className="w-4 h-4" /> Total Value
            </div>
            <div className="text-2xl font-black text-indigo-600">
              ₹{manifest.total_trip_amount?.toLocaleString() || 0}
            </div>
            <div className="text-sm font-semibold text-slate-500 mt-1">
              Across {manifest.total_orders} Orders
            </div>
          </div>
        </div>

        {/* Consolidated Items (If available in API) */}
        {manifest.consolidated_items && manifest.consolidated_items.length > 0 && (
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> Consolidated Packing List
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Variant</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Total Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manifest.consolidated_items.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-3 font-bold text-slate-800 text-sm">{item.product_name}</td>
                      <td className="p-3 text-slate-600 text-sm font-medium">{item.variant_name}</td>
                      <td className="p-3 text-slate-500 text-xs font-mono">{item.sku}</td>
                      <td className="p-3 text-right font-black text-slate-900">{item.total_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivery Stops */}
        <div className="p-6 sm:p-8">
          <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Delivery Stops ({manifest.customer_stops?.length || 0})
          </h3>
          <div className="grid gap-4">
            {manifest.customer_stops?.map((stop, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden print:border-slate-300">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                <div className="pl-3 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black px-2 py-1 bg-indigo-50 text-indigo-700 rounded uppercase tracking-widest">
                      {stop.order_no}
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      ₹{stop.grand_total?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-base font-bold text-slate-800">{stop.customer_name}</div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    {stop.customer_phone && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
                        <span className="font-bold text-slate-600">{stop.customer_phone}</span>
                      </div>
                    )}
                    {stop.address && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Address</span>
                        <span className="font-bold text-slate-600 max-w-[200px] truncate" title={stop.address}>{stop.address}</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Items</span>
                      <span className="font-bold text-slate-600">{stop.item_count} {stop.item_count === 1 ? 'Item' : 'Items'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Payment Mode</span>
                      <span className="font-black text-slate-700">{stop.payment_mode || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer for print */}
        <div className="hidden print:block p-8 border-t-2 border-black mt-8 text-center text-xs font-bold text-slate-500">
          Generated from Sadapoorna Distribution Platform • {new Date().toLocaleString()}
          <div className="mt-8 flex justify-between px-10">
            <div className="border-t border-black w-40 pt-2">Driver Signature</div>
            <div className="border-t border-black w-40 pt-2">Warehouse Manager</div>
          </div>
        </div>

      </div>
    </div>
  );
}
