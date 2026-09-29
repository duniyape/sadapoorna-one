import React, { useEffect, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { MapPin, Layers, RefreshCw, Users, Wifi, Clock, X, Navigation, AlertCircle } from "lucide-react";
import MapView from "../components/MapView";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// Auto-fit bounds to the route
function FitRoute({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [30, 30] });
    }
  }, [points, map]);
  return null;
}

// Snap GPS points to real roads using OSRM Map Matching API (free, no key needed)
async function snapToRoads(gpsPoints) {
  if (gpsPoints.length < 2) return { snapped: gpsPoints, fallback: false };

  // OSRM allows max 100 waypoints; sample if more
  let pts = gpsPoints;
  if (pts.length > 100) {
    const step = Math.ceil(pts.length / 100);
    pts = pts.filter((_, i) => i % step === 0);
    // Always include last point
    if (pts[pts.length - 1] !== gpsPoints[gpsPoints.length - 1]) {
      pts.push(gpsPoints[gpsPoints.length - 1]);
    }
  }

  // OSRM expects lng,lat (not lat,lng!)
  const coordStr = pts.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/match/v1/driving/${coordStr}?overview=full&geometries=geojson&tidy=true`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OSRM API error");
    const data = await res.json();

    if (data.code !== "Ok" || !data.matchings?.length) {
      return { snapped: gpsPoints, fallback: true };
    }

    // Combine all matching segments into one polyline (OSRM returns [lng, lat])
    const roadPoints = [];
    for (const matching of data.matchings) {
      const coords = matching.geometry.coordinates;
      for (const [lng, lat] of coords) {
        roadPoints.push([lat, lng]);
      }
    }
    return { snapped: roadPoints, fallback: false };
  } catch (e) {
    console.warn("OSRM map matching failed, falling back to direct line:", e);
    return { snapped: gpsPoints, fallback: true };
  }
}

// ── History Modal ─────────────────────────────────────────────────────────────
function HistoryModal({ userId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roadPath, setRoadPath] = useState([]);
  const [isFallback, setIsFallback] = useState(false);
  const [snapping, setSnapping] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/location/history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(async (data) => {
        if (data.success && data.data?.length > 0) {
          const hist = data.data;
          setHistory(hist);

          const rawPoints = hist
            .filter((h) => h.latitude && h.longitude)
            .map((h) => [h.latitude, h.longitude]);

          if (rawPoints.length >= 2) {
            setSnapping(true);
            const { snapped, fallback } = await snapToRoads(rawPoints);
            setRoadPath(snapped);
            setIsFallback(fallback);
            setSnapping(false);
          } else {
            setRoadPath(rawPoints);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const rawPoints = history
    .filter((h) => h.latitude && h.longitude)
    .map((h) => [h.latitude, h.longitude]);

  const mapCenter =
    roadPath.length > 0
      ? roadPath[roadPath.length - 1]
      : [20.5937, 78.9629];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800">
              Location History
              <span className="ml-2 text-xs font-normal text-slate-400">…{String(userId).slice(-8)}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
            <Clock className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-semibold">No history found</p>
            <p className="text-xs mt-1">This user has no recorded movement yet.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 min-h-0">

            {/* History Log (scrollable list) */}
            <div className="md:w-64 shrink-0 border-r border-slate-100 overflow-y-auto">
              <div className="p-3 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 pb-1">
                  {history.length} movements recorded
                </p>
                {[...history].reverse().map((h, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="text-[11px] font-mono text-slate-700">
                        {h.latitude?.toFixed(5)}, {h.longitude?.toFixed(5)}
                      </span>
                    </div>
                    <div className="flex gap-3 ml-5 text-[10px] text-slate-400">
                      <span>{new Date(h.recorded_at).toLocaleDateString()}</span>
                      <span>{new Date(h.recorded_at).toLocaleTimeString()}</span>
                    </div>
                    {h.speed != null && (
                      <span className="ml-5 text-[10px] text-slate-400">
                        {(h.speed * 3.6).toFixed(1)} km/h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Road-snapped Map */}
            <div className="flex-1 min-h-[300px] relative">
              {/* Snapping overlay spinner */}
              {snapping && (
                <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Snapping to roads...</p>
                </div>
              )}

              {/* Fallback badge */}
              {isFallback && !snapping && (
                <div className="absolute top-3 left-3 z-[9999] flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                  <AlertCircle className="w-3 h-3" />
                  Direct line (road snap unavailable)
                </div>
              )}
              {!isFallback && !snapping && roadPath.length > 1 && (
                <div className="absolute top-3 left-3 z-[9999] flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                  ✅ Road-snapped route
                </div>
              )}

              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%", minHeight: 300 }}
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitRoute points={roadPath.length > 1 ? roadPath : rawPoints} />

                {/* Road-snapped polyline (solid, following roads) */}
                {roadPath.length > 1 && (
                  <Polyline
                    positions={roadPath}
                    pathOptions={{ color: "#6366f1", weight: 5, opacity: 0.9 }}
                  />
                )}

                {/* Start marker (green) */}
                {rawPoints.length > 0 && (
                  <Marker position={rawPoints[0]}>
                    <Popup><b>🟢 Start</b><br />{new Date(history[0]?.recorded_at).toLocaleString()}</Popup>
                  </Marker>
                )}
                {/* End marker (latest) */}
                {rawPoints.length > 1 && (
                  <Marker position={rawPoints[rawPoints.length - 1]}>
                    <Popup>
                      <b>📍 Latest</b><br />
                      {new Date(history[history.length - 1]?.recorded_at).toLocaleString()}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LiveLocationPage() {
  const { user, liveLocations = [], currentUserId, trackingStarted } = useOutletContext();
  const resolvedUserId = currentUserId || user?.id || user?._id || localStorage.getItem("userId");

  const [restLocations, setRestLocations] = useState([]);
  const [historyUserId, setHistoryUserId] = useState(null); // which user's history modal is open

  const getToken = () => localStorage.getItem("token");

  const fetchAllUsersLocations = useCallback(async () => {
    try {
      const res = await fetch("/location/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setRestLocations(data.data || []);
    } catch (err) {
      console.error("Error fetching user locations:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllUsersLocations();
    const id = setInterval(fetchAllUsersLocations, 15000);
    return () => clearInterval(id);
  }, [fetchAllUsersLocations]);

  // Merge WebSocket live data with REST
  const mergedLocations = (() => {
    const map = new Map();
    restLocations.forEach((l) => map.set(l.user_id, l));
    liveLocations.forEach((l) => map.set(l.user_id, { ...(map.get(l.user_id) || {}), ...l }));
    return Array.from(map.values());
  })();

  const onlineCount = mergedLocations.filter((l) => l.tracking).length;
  const myLocation = mergedLocations.find((l) => l.user_id === resolvedUserId);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

      {/* History Modal */}
      {historyUserId && (
        <HistoryModal userId={historyUserId} onClose={() => setHistoryUserId(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" /> Live Location Tracking
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time team location monitoring.</p>
        </div>
        <button
          onClick={fetchAllUsersLocations}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1">My Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${trackingStarted ? "bg-emerald-500 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
            <span className={`font-bold text-sm ${trackingStarted ? "text-emerald-600" : "text-amber-600"}`}>
              {trackingStarted ? "Broadcasting" : "Starting..."}
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-semibold mb-1">Team Live</p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-sm text-slate-800">{onlineCount} online</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 font-semibold mb-1">My Coordinates</p>
          {myLocation ? (
            <p className="text-xs font-mono text-slate-700">
              {myLocation.latitude?.toFixed(5)}, {myLocation.longitude?.toFixed(5)}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">Acquiring GPS signal...</p>
          )}
        </div>
      </div>

      {/* Map + Team List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Team List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Team Members</h2>
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {mergedLocations.length > 0 ? (
              mergedLocations.map((uLoc) => (
                <div
                  key={uLoc._id || uLoc.user_id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      uLoc.user_id === resolvedUserId ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}>
                      {String(uLoc.user_id || "?").slice(-2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {uLoc.user_id === resolvedUserId ? "You" : `…${String(uLoc.user_id || "").slice(-8)}`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {uLoc.latitude?.toFixed(4)}, {uLoc.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Right: status badge + history button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg border ${
                      uLoc.tracking ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {uLoc.tracking ? "Live" : "Off"}
                    </span>
                    {/* History button */}
                    <button
                      onClick={() => setHistoryUserId(uLoc.user_id)}
                      title="View location history"
                      className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No team members found.
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Live Map View
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <Wifi className="w-3 h-3" />
              Auto-broadcasting
            </div>
          </div>
          <div className="h-[520px]">
            <MapView locations={mergedLocations} currentUserId={resolvedUserId} />
          </div>
        </div>
      </div>
    </div>
  );
}