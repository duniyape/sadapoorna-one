import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Building2, Briefcase, Layers, Clock, User, Phone, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

export default function CustomerProfileTab() {
  const { customer, branches, employees, isBiz } = useOutletContext();
  const [beats, setBeats] = useState([]);

  useEffect(() => {
    // Fetch beats to display assigned beat name
    const fetchBeats = async () => {
      try {
        const res = await fetch('/beats/beats/', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBeats(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching beats:", err);
      }
    };
    fetchBeats();
  }, []);

  const getBranchName = (bid) => {
    if (!bid) return 'N/A';
    return branches.find(b => b.id === bid || b._id === bid)?.name || bid;
  };

  const getEmpName = (eid) => {
    if (!eid) return 'N/A';
    return employees.find(e => e.id === eid || e._id === eid)?.name || eid;
  };

  const getBeatName = (bid) => {
    if (!bid) return 'N/A';
    return beats.find(b => b.id === bid || b._id === bid)?.beat_name || bid;
  };

  // Robust location parsing
  let loc = null;
  if (customer?.location) {
    if (typeof customer.location === 'string') {
      try { loc = JSON.parse(customer.location); } catch (e) {}
    } else if (typeof customer.location === 'object') {
      loc = customer.location;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left col */}
      <div className="lg:col-span-2 space-y-4">

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-indigo-600" /> Address & Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2 pl-3 border-l-2 border-indigo-100">
              <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Billing Address</h3>
              {customer.billing_address?.address ? (
                <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-900">{customer.billing_address.address}</p>
                  <p>{customer.billing_address.city}, {customer.billing_address.state}</p>
                  <p>PIN: {customer.billing_address.pincode}</p>
                </div>
              ) : <p className="text-[11px] text-slate-400">No billing address provided.</p>}
            </div>
            <div className="space-y-2 pl-3 border-l-2 border-emerald-100">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Shipping Address</h3>
                {customer.sameAsBilling && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Same as Billing</span>
                )}
              </div>
              {customer.shipping_address?.address ? (
                <div className="text-[11px] font-medium text-slate-700 space-y-0.5">
                  <p className="font-bold text-slate-900">{customer.shipping_address.address}</p>
                  <p>{customer.shipping_address.city}, {customer.shipping_address.state}</p>
                  <p>PIN: {customer.shipping_address.pincode}</p>
                </div>
              ) : <p className="text-[11px] text-slate-400">No shipping address provided.</p>}
            </div>
          </div>

          {/* Location Map */}
          {loc && loc.lat && loc.lng ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pinned Location</h3>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Open in Google Maps
                </a>
              </div>
              <div className="h-[200px] rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                <MapContainer 
                  center={[loc.lat, loc.lng]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <Marker position={[loc.lat, loc.lng]} />
                </MapContainer>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pinned Location</h3>
              <p className="text-[11px] text-slate-400">No GPS location captured for this customer.</p>
            </div>
          )}
        </div>

        {/* Business info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
            <Briefcase className="w-4 h-4 text-indigo-600" /> Additional Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5 flex items-center gap-1"><User className="w-3 h-3"/> Customer Type</p>
              <p className="text-xs font-bold text-slate-900 capitalize">{customer.customer_type || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 mb-0.5 flex items-center gap-1"><Phone className="w-3 h-3"/> Alternate Mobile</p>
              <p className="text-xs font-bold text-slate-900">{customer.alternate_mobile || 'N/A'}</p>
            </div>
            {isBiz && (
              <>
                {[['Company Name', customer.company_name], ['Business Type', customer.business_type]].map(([k, v]) => (
                  <div key={k} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 mb-0.5">{k}</p>
                    <p className="text-xs font-bold text-slate-900">{v || 'N/A'}</p>
                  </div>
                ))}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-500 mb-0.5">GST Number</p>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">{customer.gst_number || 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right col */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h2 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5 mb-4">
            <Layers className="w-4 h-4 text-indigo-600" /> Account Assignment
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">System ID</p>
              <p className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 font-mono w-fit">{customer.id}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Branch / Hub</p>
              <p className="text-[11px] font-bold text-slate-800">{getBranchName(customer.branch_id)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Employee</p>
              <p className="text-[11px] font-bold text-slate-800">{getEmpName(customer.assigned_employee_id)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Beat</p>
              <p className="text-[11px] font-bold text-slate-800">{getBeatName(customer.beat_id)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
          <h2 className="text-[13px] font-bold flex items-center gap-1.5 mb-4 text-white/90">
            <Clock className="w-4 h-4" /> Audit Log
          </h2>
          <div className="space-y-3 relative z-10">
            <div>
              <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Created At</p>
              <p className="text-[11px] font-medium">{customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            {customer.updated_at && (
              <div>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Last Modified</p>
                <p className="text-[11px] font-medium">{new Date(customer.updated_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
