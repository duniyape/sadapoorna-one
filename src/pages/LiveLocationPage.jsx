import React, { useEffect } from "react";
import { MapPin, Navigation, StopCircle, Layers } from "lucide-react";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function LiveLocationPage() {
  const { 
    tracking, 
    location, 
    locationHistory,
    usersLocations, 
    error, 
    startTracking, 
    stopTracking, 
    fetchAllUsersLocations 
  } = useLiveLocation();

  useEffect(() => {
    fetchAllUsersLocations();
    // Poll every 15 seconds to update locations automatically
    const intervalId = setInterval(fetchAllUsersLocations, 15000);
    return () => clearInterval(intervalId);
  }, [fetchAllUsersLocations]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-600" /> Live Location Tracking
          </h1>
          <p className="text-slate-500 mt-1">Track and monitor team member locations in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking Control Card */}
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">My Location Status</h2>
          {error && <div className="text-rose-500 font-medium text-sm mb-3 bg-rose-50 p-2 rounded-lg">{error}</div>}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto flex gap-3">
              {!tracking ? (
                <button 
                  onClick={startTracking}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Navigation className="w-5 h-5" />
                  Start Tracking
                </button>
              ) : (
                <button 
                  onClick={stopTracking}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Tracking
                </button>
              )}
            </div>
            
            <div className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${tracking ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${tracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
              {tracking ? 'Tracking Active' : 'Tracking Inactive'}
            </div>
          </div>

          {location ? (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 mt-auto">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</p>
                <p className="font-medium text-slate-800">{location.latitude?.toFixed(6) || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</p>
                <p className="font-medium text-slate-800">{location.longitude?.toFixed(6) || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
                <p className="font-medium text-slate-800">{location.accuracy ? `±${Math.round(location.accuracy)} m` : '-'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Speed</p>
                <p className="font-medium text-slate-800">{location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</p>
              </div>
            </div>
          ) : (
             <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 text-center text-slate-500 text-sm mt-auto">
                Location data will appear here once tracking starts.
             </div>
          )}
          
          {/* Movement Log */}
          {locationHistory && locationHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2">MOVEMENT LOG</p>
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 h-[80px] overflow-y-auto custom-scrollbar">
                {locationHistory.map((loc, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    <span>Moved to: {loc[0].toFixed(5)}, {loc[1].toFixed(5)}</span>
                  </div>
                )).reverse()}
              </div>
            </div>
          )}
        </div>

        {/* All Users Locations Card */}
        <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Team Locations</h2>
            <button onClick={fetchAllUsersLocations} className="text-indigo-600 text-sm font-bold hover:text-indigo-700">Refresh</button>
          </div>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {usersLocations && usersLocations.length > 0 ? (
              usersLocations.map((uLoc) => (
                <div key={uLoc._id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center hover:border-slate-300 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                        {uLoc.user_id ? uLoc.user_id.slice(-2).toUpperCase() : '?'}
                      </span>
                      User: {uLoc.user_id || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5 ml-8">
                      <MapPin className="w-3 h-3" /> {uLoc.latitude?.toFixed(4) || 0}, {uLoc.longitude?.toFixed(4) || 0}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${uLoc.tracking ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600 border border-slate-300'}`}>
                    {uLoc.tracking ? 'Tracking' : 'Offline'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-12 text-sm bg-slate-50 rounded-xl border border-slate-100">
                No team locations found or fetching...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Module */}
      <div className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm mt-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Live Map View
        </h2>
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 z-0">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {usersLocations && usersLocations.length > 0 && usersLocations.map((uLoc) => {
              if (uLoc.latitude && uLoc.longitude) {
                return (
                  <Marker key={uLoc._id} position={[uLoc.latitude, uLoc.longitude]}>
                    <Popup>
                      <div className="font-bold text-slate-800">User: {uLoc.user_id}</div>
                      <div className="text-xs text-slate-500">Status: {uLoc.tracking ? 'Tracking' : 'Offline'}</div>
                      <div className="text-xs text-slate-500">Speed: {uLoc.speed ? `${(uLoc.speed * 3.6).toFixed(1)} km/h` : 'N/A'}</div>
                      {uLoc.updated_at && <div className="text-xs text-slate-500">Last updated: {new Date(uLoc.updated_at).toLocaleString()}</div>}
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
            {location && location.latitude && location.longitude && (
              <Marker position={[location.latitude, location.longitude]}>
                <Popup>
                  <div className="font-bold text-indigo-600">My Location</div>
                  <div className="text-xs text-slate-500">Active Tracking</div>
                </Popup>
              </Marker>
            )}
            {locationHistory && locationHistory.length > 1 && (
              <Polyline 
                positions={locationHistory} 
                pathOptions={{ color: 'indigo', weight: 4, opacity: 0.7, dashArray: '5, 10' }} 
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
