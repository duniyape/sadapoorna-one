import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Activity, Wifi, WifiOff, Users, Crosshair, Calendar, X } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to handle map centering
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Use setView instead of flyTo to prevent nauseating zoom out/in which makes UI feel like it's shaking
      map.setView(center, zoom || 16, { animate: true, duration: 0.6 });
    }
  }, [center, map, zoom]);
  return null;
}

// Date parsers for Indian Standard Time (Asia/Kolkata)
const parseIST = (dateStr) => {
  if (!dateStr) return new Date();
  let str = dateStr;
  if (typeof str === 'string' && !str.endsWith('Z') && !str.match(/[+-]\d{2}:\d{2}$/)) {
    str += 'Z'; // Force UTC parsing if backend sends naive UTC
  }
  return new Date(str);
};

const formatIST = (dateStr) => {
  return parseIST(dateStr).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function LiveLocationPage() {
  const { user, showToast } = useOutletContext();
  
  const [users, setUsers] = useState({});
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]); // Default Bhopal
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);

  // History State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState(null);
  const [historyDates, setHistoryDates] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);

  const openHistory = async (e, userId) => {
    e.stopPropagation();
    setHistoryUserId(userId);
    setHistoryModalOpen(true);
    setHistoryDates([]);
    setSelectedHistoryDate('');
    setHistoryData([]);
    setFilteredHistory([]);

    try {
      const res = await fetch(`/location/history/${userId}/dates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.dates && data.dates.length > 0) {
          setHistoryDates(data.dates);
          fetchHistoryData(userId, data.dates[0]);
        } else {
          showToast('No history available for this user', 'info');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching history dates', 'error');
    }
  };

  const fetchHistoryData = async (userId, dateStr) => {
    setSelectedHistoryDate(dateStr);
    try {
      const res = await fetch(`/location/history/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setHistoryData(data.data);
          filterHistoryByDate(data.data, dateStr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filterHistoryByDate = (allData, dateStr) => {
    const filtered = allData.filter(loc => {
      const d = new Date(loc.recorded_at);
      const ds = d.toISOString().split('T')[0];
      return ds === dateStr;
    });
    setFilteredHistory(filtered);
    if (filtered.length > 0) {
      setMapCenter([filtered[0].latitude, filtered[0].longitude]);
    }
  };

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    setSelectedHistoryDate(dateStr);
    filterHistoryByDate(historyData, dateStr);
  };

  // Fetch employees for names
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/users/get', { 
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        });
        if (res.ok) {
          const data = await res.json();
          setAllEmployees(data.data || data.users || data || []);
        }
      } catch (e) {
        console.error("Failed to fetch employees", e);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch initial locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/location/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const json = await res.json();
          const locMap = {};
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach(loc => {
              if (loc.latitude && loc.longitude) {
                locMap[loc.user_id] = loc;
              }
            });
            setUsers(locMap);
            
            // Set map center to first user if exists
            const keys = Object.keys(locMap);
            if (keys.length > 0) {
              setMapCenter([locMap[keys[0]].latitude, locMap[keys[0]].longitude]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, []);

  // WebSocket Connection
  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id || user.mongo_id;
    if (!userId) return;

    // Use ws:// for http, wss:// for https
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Get backend host from import.meta.env or guess from current location
    let wsUrl = '';
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase) {
      const url = new URL(apiBase);
      wsUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/location/ws/${userId}`;
    } else {
      // Fallback to proxy via same host
      wsUrl = `${protocol}//${window.location.host}/location/ws/${userId}`;
    }

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload.data || payload; // handle both direct and wrapped payloads
        
        if (data.type === 'location_update' && data.latitude && data.longitude) {
          setUsers(prev => ({
            ...prev,
            [data.user_id]: {
              ...prev[data.user_id],
              ...data,
              updated_at: data.updated_at || new Date().toISOString()
            }
          }));
        }
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user]);

  const getEmployeeName = (uId) => {
    const emp = allEmployees.find(e => (e.id || e.mongo_id || e._id) === uId || e.employee_id === uId);
    return emp ? emp.name : uId.slice(-6);
  };

  const handleUserClick = (uId, lat, lng) => {
    setSelectedUserId(uId);
    setMapCenter([lat, lng]);
  };

  const timeAgo = (isoString) => {
    if (!isoString) return 'Unknown';
    const seconds = Math.floor((new Date() - parseIST(isoString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const activeUsers = Object.values(users).filter(u => {
    const minAgo = (new Date() - parseIST(u.updated_at)) / 1000 / 60;
    return minAgo < 15; // Active in last 15 mins
  });

  return (
    <div className="flex h-[calc(100vh-80px)] -m-4 sm:-m-6 lg:-m-8">
      
      {/* Sidebar List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Live Fleet
            </h2>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center gap-1.5">
              {isConnected ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected (Live)</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-rose-500"></span> Disconnected</>
              )}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-black leading-tight border border-indigo-100">
            {activeUsers.length}
            <span className="text-[8px] uppercase tracking-widest text-indigo-400">On</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-slate-50/30">
          {Object.values(users).length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No active locations found.
            </div>
          ) : (
            Object.values(users)
              // Sort by name so the list doesn't constantly jump around when location updates
              .sort((a, b) => getEmployeeName(a.user_id).localeCompare(getEmployeeName(b.user_id)))
              .map(u => {
                const isActive = (new Date() - parseIST(u.updated_at)) / 1000 / 60 < 15;
                const isSelected = selectedUserId === u.user_id;

                return (
                  <div 
                    key={u.user_id}
                    onClick={() => handleUserClick(u.user_id, u.latitude, u.longitude)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-inner border ${isActive ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {getEmployeeName(u.user_id).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 leading-tight">
                            {getEmployeeName(u.user_id)}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {timeAgo(u.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between h-full gap-2">
                        {u.speed !== null && u.speed !== undefined && (
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-slate-100">
                            <Activity className="w-3 h-3" />
                            {Math.round(u.speed * 3.6)} km/h
                          </span>
                        )}
                        <button 
                          onClick={(e) => openHistory(e, u.user_id)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200' : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-100 hover:border-indigo-200'}`}
                        >
                          <Calendar className="w-3 h-3" />
                          History
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-slate-100">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapController center={mapCenter} zoom={15} />

          {Object.values(users).map((u) => {
            const isActive = (new Date() - parseIST(u.updated_at)) / 1000 / 60 < 15;
            const isSelected = selectedUserId === u.user_id;
            
            // Custom HTML Icon for Map Markers
            const markerHtml = `
              <div class="relative w-12 h-12 flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-[1000]' : 'scale-100'}">
                <div class="absolute inset-0 bg-${isSelected ? 'indigo' : (isActive ? 'emerald' : 'slate')}-500 rounded-full opacity-30 ${isSelected || isActive ? 'animate-ping' : ''}"></div>
                <div class="relative w-9 h-9 bg-white rounded-full border-[3px] ${isSelected ? 'border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.6)]' : `border-${isActive ? 'emerald' : 'slate'}-500 shadow-md`} flex items-center justify-center font-black text-sm text-${isSelected ? 'indigo' : (isActive ? 'emerald' : 'slate')}-700 transition-colors">
                  ${getEmployeeName(u.user_id).charAt(0).toUpperCase()}
                </div>
              </div>
            `;
            const customIcon = L.divIcon({
              html: markerHtml,
              className: '',
              iconSize: [48, 48],
              iconAnchor: [24, 24]
            });

            return (
              <Marker 
                key={u.user_id} 
                position={[u.latitude, u.longitude]}
                icon={customIcon}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{
                  click: () => handleUserClick(u.user_id, u.latitude, u.longitude),
                }}
              >
                <Popup className="custom-popup rounded-2xl">
                  <div className="p-1.5 min-w-[160px]">
                    <div className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                      {getEmployeeName(u.user_id)}
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`}></span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Speed</span>
                        <span className="font-bold">{u.speed ? Math.round(u.speed * 3.6) + ' km/h' : '--'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Accuracy</span>
                        <span className="font-bold">{u.accuracy ? Math.round(u.accuracy) + ' m' : '--'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                        Updated {timeAgo(u.updated_at)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* History Polyline and Markers */}
          {historyModalOpen && filteredHistory.length > 0 && (
            <>
              <Polyline 
                positions={filteredHistory.map(loc => [loc.latitude, loc.longitude])} 
                color="#4f46e5" 
                weight={4} 
                opacity={0.8} 
              />
              
              {/* Checkpoints for every location update */}
              {filteredHistory.map((loc, idx) => {
                // Don't render circle marker for exact start and end since they have custom markers
                if (idx === 0 || idx === filteredHistory.length - 1) return null;
                
                const exactTime = formatIST(loc.recorded_at);
                const speedText = loc.speed ? `${Math.round(loc.speed * 3.6)} km/h` : '0 km/h';

                return (
                  <CircleMarker
                    key={`hist-${idx}`}
                    center={[loc.latitude, loc.longitude]}
                    radius={5}
                    pathOptions={{ color: '#4f46e5', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }}
                  >
                    <Tooltip direction="top" offset={[0, -5]} opacity={1} className="custom-tooltip">
                      <div className="font-bold text-slate-800 text-xs">{exactTime}</div>
                      <div className="text-[10px] text-slate-500">{speedText}</div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}

              {/* Start Marker */}
              <Marker 
                position={[filteredHistory[0].latitude, filteredHistory[0].longitude]}
                icon={L.divIcon({
                  html: `<div class="w-6 h-6 bg-white border-4 border-emerald-500 rounded-full shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-emerald-500 rounded-full"></div></div>`,
                  className: '',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
                zIndexOffset={500}
              >
                <Popup className="custom-popup rounded-2xl">
                  <div className="p-1 font-bold text-sm text-emerald-700">
                    🏁 Start Point<br/>
                    <span className="text-xs text-slate-500 font-medium">{formatIST(filteredHistory[0].recorded_at)}</span>
                  </div>
                </Popup>
              </Marker>

              {/* End Marker */}
              <Marker 
                position={[filteredHistory[filteredHistory.length - 1].latitude, filteredHistory[filteredHistory.length - 1].longitude]}
                icon={L.divIcon({
                  html: `<div class="w-6 h-6 bg-white border-4 border-rose-500 rounded-full shadow-lg flex items-center justify-center"><div class="w-2 h-2 bg-rose-500 rounded-full"></div></div>`,
                  className: '',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
                zIndexOffset={500}
              >
                <Popup className="custom-popup rounded-2xl">
                  <div className="p-1 font-bold text-sm text-rose-700">
                    📍 Last Known Point<br/>
                    <span className="text-xs text-slate-500 font-medium">{formatIST(filteredHistory[filteredHistory.length - 1].recorded_at)}</span>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
        
        <button 
          onClick={() => {
            if (mapCenter) {
              // Just a slight pan to trigger MapController center reset visually if already there
              setMapCenter([...mapCenter]);
            }
          }}
          className="absolute bottom-6 right-6 z-10 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors border border-slate-100"
        >
          <Crosshair className="w-6 h-6" />
        </button>

        {/* History Modal Overlay */}
        {historyModalOpen && (
          <div className="absolute top-6 right-6 z-[400] bg-white/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/50 rounded-3xl p-5 w-80 animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider mb-2">
                  <Calendar className="w-3 h-3" /> Date History
                </div>
                <h3 className="font-black text-slate-800 text-base leading-tight">{getEmployeeName(historyUserId)}</h3>
              </div>
              <button 
                onClick={() => {
                  setHistoryModalOpen(false);
                  setFilteredHistory([]);
                  setHistoryUserId(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Select Timeline</label>
                <div className="relative">
                  <select 
                    value={selectedHistoryDate}
                    onChange={handleDateChange}
                    className="w-full text-sm p-3.5 pr-10 rounded-2xl border-2 border-slate-100 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                  >
                    {historyDates.length === 0 && <option value="">No history available</option>}
                    {historyDates.map(date => (
                      <option key={date} value={date}>{parseIST(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {filteredHistory.length > 0 ? (
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Route Generated</p>
                    <p className="text-[11px] font-medium text-indigo-100 mt-0.5 leading-tight">{filteredHistory.length} checkpoints recorded on this date.</p>
                  </div>
                </div>
              ) : (
                selectedHistoryDate && (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl text-center">
                    <p className="text-xs font-bold text-slate-500">No route data available</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">Try selecting another date.</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}