import React, { useState, useEffect } from "react";
import { 
  FileText, Truck, MapPin, Package, Calendar, ChevronDown, 
  ChevronUp, IndianRupee, Map, Search, ArrowLeft
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function ManifestsPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [manifests, setManifests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchManifests();
  }, []);

  const fetchManifests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/orders/manifests/v1?page=1&limit=50", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const json = await res.json();
        setManifests(json.data || []);
      } else {
        showToast("Failed to fetch manifests");
      }
    } catch (err) {
      showToast("Network error while fetching manifests");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredManifests = manifests.filter(m => 
    m.manifest_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vehicle?.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/orders")}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Map className="w-7 h-7 text-indigo-500" />
              Trip Sheets (Manifests)
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1">
              View all dispatched bulk orders and vehicle trips
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <input
            type="text"
            placeholder="Search manifest, vehicle, warehouse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* ── Manifests List ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-slate-500">Loading trip sheets...</p>
        </div>
      ) : filteredManifests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Manifests Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredManifests.map((manifest) => (
            <div 
              key={manifest.id} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header (Always Visible) */}
              <div 
                className="p-5 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                onClick={() => toggleExpand(manifest.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{manifest.manifest_no}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(manifest.dispatch_date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Warehouse</span>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {manifest.warehouse?.name || "N/A"}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Vehicle</span>
                    <span className="text-sm font-bold text-slate-700">
                      {manifest.vehicle?.vehicle_number || "Unknown"}
                      {manifest.vehicle?.model && <span className="text-xs text-slate-500 ml-1">({manifest.vehicle.model})</span>}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-emerald-600 flex items-center">
                      <IndianRupee className="w-5 h-5" />
                      {manifest.total_trip_amount?.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {manifest.total_orders} Orders
                    </span>
                  </div>
                  <button className="ml-2 p-1 text-slate-400 hover:text-slate-700 transition-colors">
                    {expandedId === manifest.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {/* Card Expanded Area (Customer Stops) */}
              {expandedId === manifest.id && (
                <div className="bg-slate-50 border-t border-slate-100 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" /> Customer Delivery Stops
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/manifests/${manifest.id}`);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      View Full Sheet & Print <ArrowLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {manifest.customer_stops?.map((stop, idx) => (
                      <div key={stop.order_id || idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {stop.order_no}
                          </span>
                          <span className="text-sm font-black text-emerald-600 flex items-center">
                            ₹{stop.grand_total?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-bold text-slate-800">{stop.customer_name}</p>
                          {stop.customer_phone && (
                            <p className="text-xs font-bold text-slate-500">{stop.customer_phone}</p>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500">
                            {stop.item_count} {stop.item_count === 1 ? 'Item' : 'Items'}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-600 rounded">
                            {stop.payment_mode || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!manifest.customer_stops || manifest.customer_stops.length === 0) && (
                      <p className="text-sm text-slate-500 font-medium italic">No stops recorded.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
