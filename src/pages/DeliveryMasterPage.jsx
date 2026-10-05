import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Truck, MapPin, CheckCircle, Package, ArrowUp, ArrowDown, Save, Play, XSquare, Clock, Route, ExternalLink, Map, CreditCard, UserCircle, IndianRupee } from 'lucide-react';

export default function DeliveryMasterPage() {
  const { showToast, user } = useOutletContext();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [deliverConfirmOrderId, setDeliverConfirmOrderId] = useState(null);

  const [allAddresses, setAllAddresses] = useState([]);
  const [startAddressId, setStartAddressId] = useState('');
  const [endAddressId, setEndAddressId] = useState('');

  const [localStops, setLocalStops] = useState([]);
  const [isReordered, setIsReordered] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Permission Checks
  const allowedIcons = user?.access?.frontend_icons || user?.designation?.frontend_icons || [];
  const permissions = allowedIcons.find(iconData => typeof iconData === 'object' && iconData.icon === 'delivery-master')?.buttons || [];
  
  const canView = permissions.includes('View');
  const canStartTrip = permissions.includes('Start Trip');
  const canReorderRoute = permissions.includes('Reorder Route');
  const canEndTrip = permissions.includes('End Trip');

  useEffect(() => {
    fetchVehicles();
    fetchAddresses();
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

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/addresses?limit=100', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setAllAddresses(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
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
          setAvailableOrders([]);
          setSelectedOrderIds([]);
          setIsLoading(false);
        } else {
          setTrip(null);
          setLocalStops([]);
          fetchAvailableOrders(vehicleId);
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch active route", "error");
      setIsLoading(false);
    }
  };

  const fetchAvailableOrders = async (vehicleId) => {
    try {
      const res = await fetch(`/orders/v1?status=Out for Delivery&limit=100&vehicle_id=${vehicleId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAvailableOrders(json.data);
          setSelectedOrderIds(json.data.map(o => o.id || o._id || o.mongo_id));
        }
      }
    } catch (err) {
      console.error("Failed to fetch available orders", err);
    }
    setIsLoading(false);
  };

  const handleStartTrip = async () => {
    if (!selectedVehicle) return;
    if (selectedOrderIds.length === 0) {
      showToast("Please select at least one order to start trip", "error");
      return;
    }
    if (!startAddressId || !endAddressId) {
      showToast("Please select both Start Point and End Point", "error");
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch(`/vehicles/${selectedVehicle}/start-trip`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          order_ids: selectedOrderIds,
          start_address_id: startAddressId,
          end_address_id: endAddressId
        })
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

  const handleViewOrder = async (orderId) => {
    setIsOrderLoading(true);
    try {
      const res = await fetch(`/orders/v1/${orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (res.ok) {
        setSelectedOrderDetails(json.data || json);
      } else {
        showToast("Failed to fetch order details", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
    setIsOrderLoading(false);
  };

  const handleDeliver = async (orderId) => {
    setIsActionLoading(true);
    try {
      const response = await fetch(`/orders/status/v1/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "Delivered" }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || errData?.message || "Failed to update status");
      }
      showToast(`Order marked as Delivered!`, "success");
      setLocalStops(prev => prev.map(stop => 
        stop.order_id === orderId ? { ...stop, current_status: "Delivered" } : stop
      ));
      setSelectedOrderDetails(prev => {
        if (prev && (prev.id === orderId || prev.order_id === orderId || prev._id === orderId || prev.mongo_id === orderId)) {
          return { ...prev, status: "Delivered" };
        }
        return prev;
      });
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to update order status", "error");
    } finally {
      setIsActionLoading(false);
      setDeliverConfirmOrderId(null);
    }
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
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Active Trip</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6 text-center">
            This vehicle does not have an active trip. Select 'Out for Delivery' orders to start a new trip session.
          </p>
          
          <div className="w-full max-w-2xl text-left mb-6">
            <div className="flex justify-between items-center mb-3">
               <h4 className="font-bold text-slate-800 flex items-center gap-2">
                 <Package className="w-4 h-4 text-indigo-500"/> Available Orders ({availableOrders.length})
               </h4>
               {availableOrders.length > 0 && (
                 <button 
                   onClick={() => {
                     if (selectedOrderIds.length === availableOrders.length) setSelectedOrderIds([]);
                     else setSelectedOrderIds(availableOrders.map(o => o.id || o._id || o.mongo_id));
                   }}
                   className="text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                 >
                   {selectedOrderIds.length === availableOrders.length ? 'Deselect All' : 'Select All'}
                 </button>
               )}
            </div>
            {availableOrders.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                No 'Out for Delivery' orders found for this vehicle.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-sm">
                {availableOrders.map(ord => {
                  const oId = ord.id || ord._id || ord.mongo_id;
                  const isChecked = selectedOrderIds.includes(oId);
                  
                  const shopName = ord.customer?.shop_name || ord.customer?.company_name || ord.company_name || ord.customer?.business_name || '';
                  const personName = ord.customer?.name || ord.customer_name || ord.name || '';
                  
                  let addressStr = '';
                  const addrObj = ord.shipping_address || ord.address || ord.customer?.address;
                  if (typeof addrObj === 'object' && addrObj !== null) {
                    addressStr = [addrObj.address, addrObj.city, addrObj.pincode].filter(Boolean).join(', ');
                  } else if (typeof addrObj === 'string') {
                    addressStr = addrObj;
                  }

                  return (
                    <div key={oId} className="flex items-center gap-2.5 p-2.5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                      setSelectedOrderIds(prev => prev.includes(oId) ? prev.filter(id => id !== oId) : [...prev, oId]);
                    }}>
                      <div className="shrink-0 flex items-center justify-center pl-1">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          readOnly 
                          className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                         <div className="flex justify-between items-start gap-1">
                            <div className="font-bold text-slate-800 text-xs truncate" title={shopName || personName}>
                              {shopName ? <span className="text-slate-900">{shopName}</span> : null}
                              {shopName && personName ? <span className="text-slate-500 font-medium ml-1">({personName})</span> : (!shopName ? <span className="text-slate-900">{personName || 'Unknown'}</span> : null)}
                            </div>
                            <span className="font-black text-emerald-600 text-[11px] shrink-0">₹{ord.grand_total || ord.total || 0}</span>
                         </div>
                         <div className="flex justify-between items-center gap-2 mt-0.5 text-[9px] leading-tight">
                           <span className="text-slate-500 truncate" title={addressStr}>{addressStr || 'No address provided'}</span>
                           <span className="text-slate-400 font-bold shrink-0 bg-slate-100 px-1 rounded tracking-wider">#{ord.order_no || ord.invoice_no || oId.slice(-6)}</span>
                         </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          {canStartTrip && availableOrders.length > 0 && (
            <>
              <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Point *</label>
                  <select
                    value={startAddressId}
                    onChange={(e) => setStartAddressId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">-- Select Start Point --</option>
                    {allAddresses.map(a => (
                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Point *</label>
                  <select
                    value={endAddressId}
                    onChange={(e) => setEndAddressId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">-- Select End Point --</option>
                    {allAddresses.map(a => (
                      <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleStartTrip}
                disabled={isActionLoading || selectedOrderIds.length === 0 || !startAddressId || !endAddressId}
              className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2 w-full max-w-2xl justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff' }}
            >
              <Play className="w-4 h-4 fill-current" />
              Start New Trip Session ({selectedOrderIds.length} Orders)
            </button>
            </>
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
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center gap-2">
              {trip.maps_url && (
                <a 
                  href={trip.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 transition-colors shadow-sm"
                >
                  <Map className="w-3.5 h-3.5" /> Full Route
                </a>
              )}
              {canEndTrip && (
                <button 
                  onClick={handleEndTrip}
                  disabled={isActionLoading}
                  className="w-full py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200 shadow-sm disabled:opacity-50"
                >
                  <XSquare className="w-3.5 h-3.5" /> End Trip
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
                  <div 
                    key={stop.order_id} 
                    onClick={() => handleViewOrder(stop.order_id)}
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200 shadow-inner">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate" title={stop.company_name ? `${stop.company_name} (${stop.customer_name})` : stop.customer_name}>
                            {stop.company_name ? `${stop.company_name} ` : ''}
                            {stop.customer_name ? (stop.company_name ? <span className="text-slate-500 font-medium text-xs">({stop.customer_name})</span> : stop.customer_name) : 'Unknown Customer'}
                          </p>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded tracking-wider">
                            #{stop.order_no}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest shrink-0 ${stop.current_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {stop.current_status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-500 font-medium truncate">
                            {typeof stop.address === 'object' && stop.address !== null 
                              ? [stop.address.address, stop.address.city, stop.address.pincode].filter(Boolean).join(', ') 
                              : (stop.address || 'No Address')}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            {stop.assigned_employee_name && (
                              <span className="flex items-center gap-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                <UserCircle className="w-3 h-3 text-slate-400" /> {stop.assigned_employee_name}
                              </span>
                            )}
                            {stop.payment_mode && (
                              <span className="flex items-center gap-1 font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                <CreditCard className="w-3 h-3 text-slate-400" /> {stop.payment_mode}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a 
                              href={stop.location 
                                ? `https://www.google.com/maps?q=${stop.location.lat},${stop.location.lng}` 
                                : `https://www.google.com/maps?q=${encodeURIComponent(typeof stop.address === 'object' && stop.address !== null ? [stop.address.address, stop.address.city, stop.address.pincode].filter(Boolean).join(', ') : (stop.address || stop.customer_name || ''))}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                            >
                              <Map className="w-3 h-3" /> Map
                            </a>
                            <button 
                              onClick={() => handleViewOrder(stop.order_id)}
                              disabled={isOrderLoading || isActionLoading}
                              className="px-2 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </button>
                            {stop.current_status === 'Delivered' && (
                              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm">
                                <CheckCircle className="w-3 h-3" /> Delivered
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {canReorderRoute && (
                      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }} 
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }} 
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

      {/* View Order Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Order #{selectedOrderDetails.order_no || selectedOrderDetails.invoice_no || selectedOrderDetails.id}
              </h2>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <XSquare className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer / Shop</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {selectedOrderDetails.customer?.shop_name 
                        ? `${selectedOrderDetails.customer.shop_name} (${selectedOrderDetails.customer.name})` 
                        : (selectedOrderDetails.customer?.name || 'Unknown')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">📞 {selectedOrderDetails.customer?.mobile || 'No Mobile'}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5 uppercase tracking-wide">{selectedOrderDetails.status || 'Pending'}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Mode</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{selectedOrderDetails.payment_mode || 'N/A'}</p>
                  </div>

                  <div className="col-span-2 lg:col-span-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Address</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">
                      {selectedOrderDetails.customer?.shipping_address 
                        ? [selectedOrderDetails.customer.shipping_address.address, selectedOrderDetails.customer.shipping_address.city, selectedOrderDetails.customer.shipping_address.state, selectedOrderDetails.customer.shipping_address.pincode].filter(Boolean).join(', ')
                        : (selectedOrderDetails.shipping_address || 'No Address Provided')}
                    </p>
                  </div>
               </div>
               
               <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                 <table className="w-full text-left text-xs">
                   <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                     <tr>
                       <th className="p-3">Product Item</th>
                       <th className="p-3 text-right">Packaging</th>
                       <th className="p-3 text-right">Billing Qty</th>
                       <th className="p-3 text-right">Rate</th>
                       <th className="p-3 text-right">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 bg-white">
                     {selectedOrderDetails.items?.map((item, i) => (
                       <tr key={i} className="hover:bg-slate-50 transition-colors">
                         <td className="p-3">
                           <div className="font-bold text-slate-800">{item.product_name}</div>
                           <div className="text-[10px] text-slate-500">{item.variant_name}</div>
                           {item.sku && <div className="text-[9px] text-slate-400 uppercase mt-0.5">SKU: {item.sku}</div>}
                         </td>
                         <td className="p-3 text-right text-slate-600">
                           <span className="font-bold">{item.quantity}</span> {typeof item.packaging_type === 'object' && item.packaging_type !== null ? item.packaging_type.name : ''}
                         </td>
                         <td className="p-3 text-right text-slate-600">
                           <span className="font-bold">{item.billingQty}</span> {typeof item.unit === 'object' && item.unit !== null ? (item.unit.symbol || item.unit.name) : item.unit}
                         </td>
                         <td className="p-3 text-right text-slate-600">
                           ₹{item.rate} <span className="text-[9px] block text-slate-400">{item.rate_type?.replace('_', ' ')}</span>
                         </td>
                         <td className="p-3 text-right font-black text-indigo-600">₹{item.total_amount || item.total}</td>
                       </tr>
                     ))}
                     {(!selectedOrderDetails.items || selectedOrderDetails.items.length === 0) && (
                       <tr><td colSpan="5" className="p-4 text-center text-slate-400 font-medium">No items found</td></tr>
                     )}
                   </tbody>
                 </table>
                 
                 <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col items-end gap-1">
                    <div className="flex justify-between w-48 text-xs text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>₹{selectedOrderDetails.subtotal || 0}</span>
                    </div>
                    {selectedOrderDetails.discount > 0 && (
                      <div className="flex justify-between w-48 text-xs text-rose-500 font-medium">
                        <span>Discount</span>
                        <span>-₹{selectedOrderDetails.discount}</span>
                      </div>
                    )}
                    {selectedOrderDetails.other_charges > 0 && (
                      <div className="flex justify-between w-48 text-xs text-slate-500 font-medium">
                        <span>Other Charges</span>
                        <span>+₹{selectedOrderDetails.other_charges}</span>
                      </div>
                    )}
                    <div className="flex justify-between w-48 text-sm font-bold text-slate-800 mt-1 pt-1 border-t border-slate-200">
                      <span className="uppercase tracking-wider">Grand Total</span>
                      <span className="text-lg font-black text-indigo-600">₹{selectedOrderDetails.grand_total || selectedOrderDetails.total || 0}</span>
                    </div>
                 </div>
               </div>

               <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 mt-4 rounded-xl">
                 {(!selectedOrderDetails.status || (selectedOrderDetails.status !== 'Delivered' && selectedOrderDetails.status !== 'Cancelled' && selectedOrderDetails.status !== 'Rejected')) && (
                    <button 
                      onClick={() => {
                        const orderId = selectedOrderDetails.id || selectedOrderDetails.order_id || selectedOrderDetails._id || selectedOrderDetails.mongo_id;
                        setDeliverConfirmOrderId(orderId);
                      }}
                      disabled={isActionLoading}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark as Delivered
                    </button>
                 )}
                 {selectedOrderDetails.status === 'Delivered' && (
                    <button 
                      onClick={() => {
                        const custId = selectedOrderDetails.customer_id || selectedOrderDetails.customer?._id || selectedOrderDetails.customer?.id;
                        if (custId) navigate(`/view-customer/${custId}/khata`, { state: { autoOpenPaymentModal: true } });
                        else showToast("Customer ID not found");
                      }}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-colors"
                    >
                      <IndianRupee className="w-4 h-4" /> Collect Payment
                    </button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Confirmation Modal */}
      {deliverConfirmOrderId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Delivery</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to mark this order as <span className="font-bold text-emerald-600">Delivered</span>? This action will instantly update the status.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDeliverConfirmOrderId(null)}
                disabled={isActionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeliver(deliverConfirmOrderId)}
                disabled={isActionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200/50 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isActionLoading ? <Clock className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
