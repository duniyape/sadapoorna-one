import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Package, ArrowUp, ArrowDown, Save, Play, XSquare, Clock, Route } from 'lucide-react';

export default function DeliveryMasterPage() {
  const { showToast, user } = useOutletContext();
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [localStops, setLocalStops] = useState([]);
  const [isReordered, setIsReordered] = useState(false);

  // Permission Checks
  const allowedIcons = user?.access?.frontend_icons || user?.designation?.frontend_icons || [];
  const permissions = allowedIcons.find(iconData => typeof iconData === 'object' && iconData.icon === 'delivery-master')?.buttons || [];
  
  const canView = permissions.includes('View');
  const canStartTrip = permissions.includes('Start Trip');
  const canReorderRoute = permissions.includes('Reorder Route');
  const canEndTrip = permissions.includes('End Trip');

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchActiveRoute(selectedVehicle);
    } else {
      setTrip(null);
      setLocalStops([]);
    }
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/vehicles/get', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setVehicles(json.data || json.vehicles || []);
      }
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    }
  };

  const fetchActiveRoute = async (vehicleId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/vehicles/${vehicleId}/active-route`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.status === 'in_progress') {
          setTrip(json.data);
          setLocalStops(json.data.customer_stops || []);
          setIsReordered(false);
        } else {
          setTrip(null);
          setLocalStops([]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch active route", "error");
    }
    setIsLoading(false);
  };

  const handleStartTrip = async () => {
    if (!selectedVehicle) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`/vehicles/${selectedVehicle}/start-trip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Trip started successfully!");
        fetchActiveRoute(selectedVehicle);
      } else {
        showToast(json.detail || json.message || "Failed to start trip", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
    setIsActionLoading(false);
  };

  const handleEndTrip = async () => {
    if (!selectedVehicle) return;
    if (!window.confirm("Are you sure you want to end this trip?")) return;
    
    setIsActionLoading(true);
    try {
      const res = await fetch(`/vehicles/${selectedVehicle}/end-trip`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Trip ended successfully!");
        setTrip(null);
        setLocalStops([]);
      } else {
        showToast(json.detail || json.message || "Failed to end trip", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
    setIsActionLoading(false);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newStops = [...localStops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    setLocalStops(newStops);
    setIsReordered(true);
  };

  const handleMoveDown = (index) => {
    if (index === localStops.length - 1) return;
    const newStops = [...localStops];
    [newStops[index + 1], newStops[index]] = [newStops[index], newStops[index + 1]];
    setLocalStops(newStops);
    setIsReordered(true);
  };

  const handleSaveReorder = async () => {
    if (!selectedVehicle) return;
    setIsActionLoading(true);
    try {
      const orderIds = localStops.map(s => s.order_id);
      const res = await fetch(`/vehicles/${selectedVehicle}/reorder-route`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order_ids: orderIds })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast("Route sequence updated!");
        setIsReordered(false);
        fetchActiveRoute(selectedVehicle);
      } else {
        showToast(json.detail || json.message || "Failed to reorder", "error");
      }
    } catch (err) {
      showToast("An error occurred", "error");
    }
    setIsActionLoading(false);
  };

  if (!canView) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
        <p className="text-slate-500 mt-2">You don't have permission to view Delivery Master.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-purple-600" />
            Delivery Master
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage active trip sessions and optimize delivery routes</p>
        </div>
        
        <div className="w-full sm:w-72">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Vehicle</label>
          <select 
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="">-- Choose a Vehicle --</option>
            {vehicles.map(v => (
              <option key={v.id || v._id} value={v.id || v._id}>
                {v.vehicle_number} {v.driver_name ? `(${v.driver_name})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedVehicle ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Select a Vehicle to Begin</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Choose a vehicle from the dropdown above to view its active route or start a new trip.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-slate-500 font-bold text-sm">Loading route details...</div>
      ) : !trip ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Active Trip</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">This vehicle does not have an active trip session. You can lock in all 'Out for Delivery' orders and start a new trip now.</p>
          
          {canStartTrip && (
            <button 
              onClick={handleStartTrip}
              disabled={isActionLoading}
              className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff' }}
            >
              <Play className="w-4 h-4 fill-current" />
              Start New Trip Session
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Trip Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5"><Clock className="w-4 h-4"/> In Progress</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Stops</p>
              <p className="text-lg font-black text-slate-800">{trip.total_orders}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trip Value</p>
              <p className="text-lg font-black text-indigo-600">₹{trip.total_trip_amount?.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-end">
              {canEndTrip && (
                <button 
                  onClick={handleEndTrip}
                  disabled={isActionLoading}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200 shadow-sm disabled:opacity-50"
                >
                  <XSquare className="w-4 h-4" /> End Trip
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Route Sequence */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Route Sequence
                </h3>
                {canReorderRoute && isReordered && (
                  <button 
                    onClick={handleSaveReorder}
                    disabled={isActionLoading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                )}
              </div>
              
              <div className="p-4 space-y-3 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                {localStops.map((stop, idx) => (
                  <div key={stop.order_id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:border-indigo-300 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200 shadow-inner">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-sm truncate">{stop.customer_name || 'Unknown Customer'}</p>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${stop.current_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {stop.current_status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-slate-500 font-medium truncate">
                          {typeof stop.address === 'object' && stop.address !== null 
                            ? [stop.address.address, stop.address.city, stop.address.pincode].filter(Boolean).join(', ') 
                            : (stop.address || 'No Address')}
                        </span>
                        <span className="font-bold text-indigo-600 shrink-0">₹{stop.grand_total}</span>
                      </div>
                    </div>
                    {canReorderRoute && (
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleMoveUp(idx)} 
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(idx)} 
                          disabled={idx === localStops.length - 1}
                          className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {localStops.length === 0 && (
                  <div className="text-center py-10 text-slate-400 font-medium text-sm">No stops generated.</div>
                )}
              </div>
            </div>

            {/* Consolidated Inventory */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full max-h-[665px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Trip Loadout
                </h3>
              </div>
              <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] sticky top-0 backdrop-blur-sm shadow-sm border-b border-slate-200">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {trip.consolidated_items?.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{item.product_name}</div>
                          <div className="text-[10px] text-slate-500">{item.variant_name}</div>
                        </td>
                        <td className="p-3 text-right font-black text-emerald-600 text-sm">
                          {item.total_quantity}
                        </td>
                      </tr>
                    ))}
                    {(!trip.consolidated_items || trip.consolidated_items.length === 0) && (
                      <tr><td colSpan="2" className="p-6 text-center text-slate-400">No items found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
