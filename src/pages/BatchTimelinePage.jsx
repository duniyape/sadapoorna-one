import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Clock, Box, MapPin, TrendingUp, TrendingDown, Package, FileText } from "lucide-react";

export default function BatchTimelinePage() {
  const { batch_no } = useParams();
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/inventory/inventory/batch-timeline/${batch_no}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          setTimelineData(json.data || json);
        } else {
          showToast("Failed to load batch timeline");
        }
      } catch (err) {
        showToast("Network error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, [batch_no, showToast]);

  const getEventIcon = (action) => {
    if (!action) return <Box className="w-5 h-5 text-slate-500" />;
    const act = action.toUpperCase();
    if (act.includes("INWARD") || act.includes("PURCHASE")) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (act.includes("SALE") || act.includes("OUTWARD")) return <TrendingDown className="w-5 h-5 text-rose-500" />;
    if (act.includes("TRANSFER") || act.includes("VEHICLE")) return <MapPin className="w-5 h-5 text-indigo-500" />;
    return <Clock className="w-5 h-5 text-slate-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-500">Loading 360° Batch Journey...</p>
      </div>
    );
  }

  // Handle both array response or object with timeline array
  const events = Array.isArray(timelineData) 
    ? timelineData 
    : (timelineData?.timeline || timelineData?.events || timelineData?.movements || []);
  
  const summary = !Array.isArray(timelineData) ? timelineData?.summary || timelineData : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-7 h-7 text-indigo-500" />
              Batch 360° Journey
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Tracking lifecycle for Batch: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded ml-1">{batch_no}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary Cards (If available) ─────────────────────── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product</div>
            <div className="text-lg font-black text-slate-800">{summary.product_name || "Unknown"}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Initial Qty</div>
            <div className="text-lg font-black text-slate-800">{summary.initial_qty || "N/A"}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Stock</div>
            <div className="text-lg font-black text-emerald-600">{summary.remaining_qty || summary.current_stock || "N/A"}</div>
          </div>
        </div>
      )}

      {/* ── Vertical Timeline ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" /> Lifecycle Events
        </h3>

        {events.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-bold">No events recorded for this batch.</div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-3 md:ml-4 space-y-8">
            {events.map((ev, idx) => (
              <div key={idx} className="relative pl-8 md:pl-10">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] bg-white p-1 rounded-full">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center shadow-sm">
                    {getEventIcon(ev.action || ev.type)}
                  </div>
                </div>

                {/* Event Content */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-white border border-slate-200 shadow-sm text-slate-700">
                      {ev.action_label || ev.action || ev.type || "Activity"}
                    </span>
                    <span className="text-xs font-bold text-slate-400 mt-2 sm:mt-0 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {ev.date || ev.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document</div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> {ev.document_no || ev.ref_no || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location (From → To)</div>
                      <div className="text-sm font-bold text-slate-800 truncate" title={`${ev.from_location} → ${ev.to_location}`}>
                        {ev.from_location || "N/A"} → {ev.to_location || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Movement</div>
                      <div className="text-sm font-black flex items-center gap-2">
                        {ev.inward_quantity > 0 && <span className="text-emerald-600 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1"/> +{ev.inward_quantity}</span>}
                        {ev.outward_quantity > 0 && <span className="text-rose-600 flex items-center"><TrendingDown className="w-3.5 h-3.5 mr-1"/> -{ev.outward_quantity}</span>}
                        {(!ev.inward_quantity && !ev.outward_quantity) && <span className="text-slate-400">0</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Done By</div>
                      <div className="text-sm font-bold text-slate-600">
                        {ev.done_by || ev.user || "System"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
