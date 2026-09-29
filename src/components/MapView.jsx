import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Blue marker for current user
const meIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Red marker for other users
const otherIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Auto-fit bounds to all user markers
function FitBounds({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (!locations || locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [locations, map]);

  return null;
}

export default function MapView({ locations = [], currentUserId, locationHistory = [] }) {
  // Filter only valid coordinate entries
  const validLocations = locations.filter(
    (loc) =>
      loc &&
      typeof loc.latitude === "number" &&
      typeof loc.longitude === "number" &&
      !isNaN(loc.latitude) &&
      !isNaN(loc.longitude)
  );

  const center =
    validLocations.length > 0
      ? [validLocations[0].latitude, validLocations[0].longitude]
      : [20.5937, 78.9629]; // India center fallback

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds locations={validLocations} />

      {/* Draw movement trail for current user */}
      {locationHistory && locationHistory.length > 1 && (
        <Polyline
          positions={locationHistory}
          pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.7, dashArray: "6, 10" }}
        />
      )}

      {/* All user markers */}
      {validLocations.map((loc) => (
        <Marker
          key={loc.user_id || loc._id}
          position={[loc.latitude, loc.longitude]}
          icon={loc.user_id === currentUserId ? meIcon : otherIcon}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>
                {loc.user_id === currentUserId
                  ? "📍 You"
                  : `👤 User …${String(loc.user_id || "").slice(-6)}`}
              </strong>
              <br />
              Lat: {loc.latitude?.toFixed(5)}
              <br />
              Lng: {loc.longitude?.toFixed(5)}
              {loc.accuracy != null && (
                <>
                  <br />
                  Accuracy: {Math.round(loc.accuracy)}m
                </>
              )}
              {loc.speed != null && (
                <>
                  <br />
                  Speed: {(loc.speed * 3.6).toFixed(1)} km/h
                </>
              )}
              {loc.updated_at && (
                <>
                  <br />
                  <small>Updated: {new Date(loc.updated_at).toLocaleTimeString()}</small>
                </>
              )}
              <br />
              <span
                className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${
                  loc.tracking ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {loc.tracking ? "● Live" : "○ Offline"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
