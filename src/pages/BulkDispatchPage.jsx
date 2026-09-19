import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  Warehouse,
  Truck,
  Package,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Search,
  Zap,
  AlertTriangle,
  Loader2,
  MapPin,
  User,
  IndianRupee,
  Hash,
  CheckSquare,
  Square,
  RefreshCw,
  ClipboardList,
  Send,
  Building2,
  Car,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

// ─── Step Indicator ──────────────────────────────────────────────────────────
const StepBadge = ({ step, currentStep, label, icon: Icon }) => {
  const isDone = currentStep > step;
  const isActive = currentStep === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${
          isDone
            ? "bg-emerald-500 border-emerald-500 text-white"
            : isActive
            ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200"
            : "bg-slate-100 border-slate-200 text-slate-400"
        }`}
      >
        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <span
        className={`text-xs font-bold hidden sm:block ${
          isActive ? "text-indigo-700" : isDone ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, isSelected, onToggle }) => {
  const orderId = order.id || order._id || order.mongo_id;
  const custName =
    order.customer?.company_name ||
    order.customer?.business_name ||
    order.customer?.name ||
    "Unknown Customer";
  const total =
    order.grand_total ||
    order.total ||
    order.items?.reduce((s, i) => s + (i.quantity || 0) * (i.rate || 0), 0) ||
    0;
  const itemCount = order.items?.length || 0;
  const orderNo = order.order_no || order.invoice_no || orderId?.slice(-6) || "—";

  return (
    <div
      onClick={onToggle}
      className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none group ${
        isSelected
          ? "border-indigo-400 bg-indigo-50/70 shadow-md shadow-indigo-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Checkbox */}
      <div className="mt-0.5 shrink-0">
        {isSelected ? (
          <CheckSquare className="w-5 h-5 text-indigo-600" />
        ) : (
          <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              #{orderNo}
            </p>
            <p className="font-bold text-slate-800 text-sm mt-0.5 truncate">{custName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-black text-slate-900">₹{total.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{itemCount} items</p>
          </div>
        </div>

        {/* Address */}
        {(order.customer?.address || order.delivery_address) && (
          <div className="flex items-center gap-1 mt-2">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-500 truncate">
              {order.delivery_address || order.customer?.address}
            </p>
          </div>
        )}

        {/* Salesman */}
        {order.salesman?.name && (
          <div className="flex items-center gap-1 mt-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-500">{order.salesman.name}</p>
          </div>
        )}
      </div>

      {/* Selected glow */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400/40 pointer-events-none" />
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BulkDispatchPage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();

  // Step 1 — Warehouse
  const [step, setStep] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseSearch, setWarehouseSearch] = useState("");

  // Step 2 — Orders
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());

  // Step 3 — Vehicle / Warehouse dispatch
  const [deliveryType, setDeliveryType] = useState(""); // "vehicle" | "warehouse"
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState(null);

  // ── Step 1: Load warehouses ────────────────────────────────────────────────
  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoadingWarehouses(true);
      try {
        const res = await fetch("/warehouses/get", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const json = await res.json();
          setWarehouses(json.data || []);
        }
      } catch {
        showToast("Failed to load warehouses");
      } finally {
        setIsLoadingWarehouses(false);
      }
    };
    fetchWarehouses();
  }, []);

  // ── Step 2: Load "Ready to Pick Up" orders (exact same pattern as OrdersPage) ────
  const fetchOrders = useCallback(async () => {
    if (!selectedWarehouse) return;
    setIsLoadingOrders(true);
    setSelectedOrderIds(new Set());
    try {
      // type=sale is REQUIRED by backend (same as OrdersPage default)
      const statusEncoded = encodeURIComponent("Ready to Pick Up");
      // Appended warehouse_id back to the URL for backend filtering!
      const url = `/orders/v1?page=1&limit=100&type=sale&status=${statusEncoded}&warehouse_id=${selectedWarehouse.id}`;
      console.log("[BulkDispatch] Fetching orders URL:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("[BulkDispatch] Response status:", res.status);

      if (res.ok) {
        const json = await res.json();
        console.log("[BulkDispatch] API response:", json);

        // Backend filtering restored! No need for local filtering anymore.
        if (json.success && json.data) {
          setOrders(json.data);
          console.log("[BulkDispatch] Orders loaded:", json.data.length);
          if (json.data.length === 0) {
            showToast("No 'Ready to Pick Up' orders found for this warehouse.");
          }
        } else if (Array.isArray(json.data)) {
          setOrders(json.data);
        } else if (Array.isArray(json)) {
          setOrders(json);
        } else {
          console.warn("[BulkDispatch] Unexpected response shape:", json);
          setOrders([]);
          showToast("No orders found. Check console for details.");
        }
      } else {
        const errText = await res.text().catch(() => "Unknown error");
        console.error("[BulkDispatch] API error:", res.status, errText);
        setOrders([]);
        showToast(`Failed to load orders (${res.status})`);
      }
    } catch (err) {
      console.error("[BulkDispatch] Fetch error:", err);
      showToast("Network error loading orders");
    } finally {
      setIsLoadingOrders(false);
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    if (step === 2) fetchOrders();
  }, [step, fetchOrders]);

  // ── Step 3: Load vehicles ───────────────────────────────────
  useEffect(() => {
    if (!deliveryType || deliveryType === "warehouse") { 
      setDeliveryOptions([]); 
      return; 
    }
    const fetch_ = async () => {
      setIsLoadingOptions(true);
      setSelectedDeliveryId("");
      try {
        const endpoint = "/vehicles/get";
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const json = await res.json();
          setDeliveryOptions(json.data || []);
        }
      } catch {
        showToast("Failed to load delivery options");
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetch_();
  }, [deliveryType]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleOrderSelection = (orderId) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const filtered = filteredOrders;
    const allSelected = filtered.every((o) => selectedOrderIds.has(o.id || o._id));
    if (allSelected) {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((o) => next.delete(o.id || o._id));
        return next;
      });
    } else {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((o) => next.add(o.id || o._id));
        return next;
      });
    }
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      !warehouseSearch ||
      w.name?.toLowerCase().includes(warehouseSearch.toLowerCase()) ||
      w.code?.toLowerCase().includes(warehouseSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      !orderSearch ||
      (o.customer?.company_name || o.customer?.name || "")
        .toLowerCase()
        .includes(orderSearch.toLowerCase()) ||
      (o.order_no || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  const selectedTotal = orders
    .filter((o) => selectedOrderIds.has(o.id || o._id))
    .reduce(
      (s, o) =>
        s +
        (o.grand_total ||
          o.total ||
          o.items?.reduce((a, i) => a + (i.quantity || 0) * (i.rate || 0), 0) ||
          0),
      0
    );

  // ── Step 3: Dispatch ───────────────────────────────────────────────────────
  const handleBulkDispatch = async () => {
    if (deliveryType === "vehicle" && !selectedDeliveryId) {
      showToast("Please select a vehicle");
      return;
    }
    setIsDispatching(true);
    try {
      const payload = {
        order_ids: Array.from(selectedOrderIds),
        status: "Out for Delivery",
        note: `Bulk dispatched to ${deliveryType}`,
        route_name: "",
      };

      if (deliveryType === "vehicle") {
        payload.vehicle_id = selectedDeliveryId;
        payload.delivery_type = "vehicle";
      } else {
        payload.warehouse_id = selectedWarehouse.id || selectedWarehouse._id;
        payload.delivery_type = "warehouse";
        payload.note = `Bulk marked as warehouse pickup / local delivery`;
      }

      const res = await fetch("/orders/bulk-dispatch/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(
          json.message ||
            `✅ ${selectedOrderIds.size} orders dispatched successfully!`
        );
        navigate("/orders");
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.error === "INSUFFICIENT_WAREHOUSE_STOCK" || err.shortages) {
          setDispatchError(err);
        } else {
          const msg =
            err.detail ||
            err.message ||
            "Bulk dispatch failed. Please try again.";
          showToast(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
      }
    } catch {
      showToast("Network error during dispatch");
    } finally {
      setIsDispatching(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
      >
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-32 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/orders")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">
                  Atomic Operation
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Bulk Out for Delivery
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch multiple orders in a single all-or-nothing operation
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <StepBadge step={1} currentStep={step} label="Warehouse" icon={Warehouse} />
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <StepBadge step={2} currentStep={step} label="Orders" icon={ClipboardList} />
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <StepBadge step={3} currentStep={step} label="Dispatch" icon={Truck} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 1 — Warehouse Selection */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Warehouse className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-black text-slate-800">Select Source Warehouse</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the warehouse from which orders will be dispatched
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                placeholder="Search warehouse by name or code..."
                className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
              />
            </div>
          </div>

          {/* Warehouse Grid */}
          <div className="p-4">
            {isLoadingWarehouses ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading warehouses...</p>
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Warehouse className="w-12 h-12 text-slate-300" />
                <p className="text-sm text-slate-400 font-medium">No warehouses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredWarehouses.map((wh) => {
                  const isActive = wh.status === "active";
                  const isSelected = selectedWarehouse?.id === wh.id;
                  return (
                    <div
                      key={wh.id}
                      onClick={() => isActive && setSelectedWarehouse(wh)}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                        !isActive
                          ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
                          : isSelected
                          ? "border-indigo-400 bg-indigo-50/70 shadow-md shadow-indigo-100 cursor-pointer"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <Building2 className={`w-5 h-5 ${isSelected ? "text-indigo-600" : "text-slate-500"}`} />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        )}
                        {!isActive && (
                          <span className="text-[9px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="font-black text-slate-800 text-sm leading-tight">{wh.name}</p>
                        {wh.code && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{wh.code}</p>
                        )}
                        {wh.address && (
                          <div className="flex items-start gap-1 mt-2">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-500 leading-tight">{wh.address}</p>
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400/40 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-end">
            <button
              onClick={() => { if (selectedWarehouse) setStep(2); else showToast("Please select a warehouse first"); }}
              disabled={!selectedWarehouse}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                selectedWarehouse
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:scale-105"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              View Orders from {selectedWarehouse?.name || "Warehouse"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 2 — Order Selection */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800">Select Orders to Dispatch</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing <strong>"Ready to Pick Up"</strong> orders from{" "}
                    <strong className="text-indigo-600">{selectedWarehouse?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setStep(1); setOrders([]); }}
                className="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1 shrink-0"
              >
                <ArrowLeft className="w-3 h-3" /> Change
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by customer or order no..."
                className="pl-9 pr-4 py-2.5 w-full rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleSelectAll}
                disabled={isLoadingOrders || filteredOrders.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all bg-white disabled:opacity-50"
              >
                <CheckSquare className="w-4 h-4" />
                {filteredOrders.every((o) => selectedOrderIds.has(o.id || o._id)) && filteredOrders.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <button
                onClick={fetchOrders}
                disabled={isLoadingOrders}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Selection summary bar */}
          {selectedOrderIds.size > 0 && (
            <div className="mx-4 mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700">
                  {selectedOrderIds.size} order{selectedOrderIds.size !== 1 ? "s" : ""} selected
                </span>
              </div>
              <span className="text-sm font-black text-indigo-800">
                ₹{selectedTotal.toLocaleString("en-IN")} total
              </span>
            </div>
          )}

          {/* Orders List */}
          <div className="p-4">
            {isLoadingOrders ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Package className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">No packed orders available</p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Orders must be in "Ready to Pick Up" status to be eligible for bulk dispatch.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredOrders.map((order) => {
                  const orderId = order.id || order._id;
                  return (
                    <OrderCard
                      key={orderId}
                      order={order}
                      isSelected={selectedOrderIds.has(orderId)}
                      onToggle={() => toggleOrderSelection(orderId)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>
            <button
              onClick={() => {
                if (selectedOrderIds.size === 0) { showToast("Please select at least one order"); return; }
                setStep(3);
              }}
              disabled={selectedOrderIds.size === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                selectedOrderIds.size > 0
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:scale-105"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Continue with {selectedOrderIds.size || ""} Orders
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* STEP 3 — Dispatch Configuration */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="space-y-4">

          {/* Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Dispatch Summary
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Edit Orders
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                <p className="text-2xl font-black text-indigo-700">{selectedOrderIds.size}</p>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mt-1">Orders</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <p className="text-lg font-black text-emerald-700">₹{selectedTotal.toLocaleString("en-IN")}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">Total Value</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                <p className="text-sm font-black text-amber-700 truncate">{selectedWarehouse?.name}</p>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-1">From Warehouse</p>
              </div>
            </div>
          </div>

          {/* Delivery Type Selection */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="font-black text-slate-800">Select Dispatch Method</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how these orders will be dispatched
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Type Toggle Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryType("vehicle")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 font-bold text-sm ${
                    deliveryType === "vehicle"
                      ? "border-violet-400 bg-violet-50/70 text-violet-700 shadow-md shadow-violet-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliveryType === "vehicle" ? "bg-violet-100" : "bg-slate-100"}`}>
                    <Car className={`w-6 h-6 ${deliveryType === "vehicle" ? "text-violet-600" : "text-slate-400"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-black">By Vehicle</p>
                    <p className="text-[10px] font-medium opacity-70 mt-0.5">Assign to a delivery vehicle</p>
                  </div>
                  {deliveryType === "vehicle" && <CheckCircle2 className="w-5 h-5 text-violet-600" />}
                </button>

                <button
                  onClick={() => setDeliveryType("warehouse")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 font-bold text-sm ${
                    deliveryType === "warehouse"
                      ? "border-emerald-400 bg-emerald-50/70 text-emerald-700 shadow-md shadow-emerald-100"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${deliveryType === "warehouse" ? "bg-emerald-100" : "bg-slate-100"}`}>
                    <Building2 className={`w-6 h-6 ${deliveryType === "warehouse" ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-black">To Warehouse</p>
                    <p className="text-[10px] font-medium opacity-70 mt-0.5">Local delivery from current warehouse</p>
                  </div>
                  {deliveryType === "warehouse" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>
              </div>

              {/* Options Dropdown / List */}
              {deliveryType === "warehouse" && (
                <div className="mt-4 p-4 text-center text-sm font-medium text-slate-600 bg-slate-50 rounded-xl border border-slate-100">
                  Will be delivered directly from the assigned source warehouse.
                </div>
              )}
              {deliveryType === "vehicle" && (
                <div className="mt-2">
                  {isLoadingOptions ? (
                    <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading vehicles...
                    </div>
                  ) : deliveryOptions.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      No active vehicles found
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Select Vehicle
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {deliveryOptions.map((opt) => {
                          const optId = opt.id || opt._id;
                          const isSelected = selectedDeliveryId === optId;
                          
                          let label = opt.vehicle_number || opt.name || optId;
                          const driver = opt.driver_name || opt.driver || "";
                          const vehicleInfo = [opt.make, opt.model].filter(Boolean).join(" ");
                          const sub = [vehicleInfo, driver].filter(Boolean).join(" • ");
                          
                          return (
                            <div
                              key={optId}
                              onClick={() => setSelectedDeliveryId(optId)}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-violet-400 bg-violet-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-violet-100" : "bg-slate-100"
                              }`}>
                                <Truck className={`w-4 h-4 ${isSelected ? "text-violet-600" : "text-slate-400"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isSelected ? "text-violet-800" : "text-slate-700"}`}>
                                  {label}
                                </p>
                                {sub && <p className="text-[10px] text-slate-400 truncate">{sub}</p>}
                              </div>
                              {isSelected && (
                                <CheckCircle2 className={`w-4 h-4 shrink-0 text-violet-600`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                  <strong>All-or-Nothing:</strong> This is an atomic operation. If any order fails stock validation,
                  the entire batch will be rolled back. Ensure all selected orders have sufficient stock.
                </p>
              </div>
            </div>

            {/* Dispatch Button */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/60">
              <button
                onClick={handleBulkDispatch}
                disabled={(deliveryType === "vehicle" && !selectedDeliveryId) || !deliveryType || isDispatching}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-base transition-all duration-200 ${
                  ((deliveryType === "vehicle" && selectedDeliveryId) || deliveryType === "warehouse") && !isDispatching
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-200/60 hover:scale-[1.01]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Dispatching {selectedOrderIds.size} Orders...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Bulk Dispatch {selectedOrderIds.size} Orders — ₹{selectedTotal.toLocaleString("en-IN")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Shortage Error Modal */}
      {dispatchError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 bg-rose-50/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-rose-700 leading-tight">Insufficient Stock!</h2>
                    <p className="text-sm font-medium text-rose-600/80 mt-1">{dispatchError.message}</p>
                  </div>
                </div>
                <button onClick={() => setDispatchError(null)} className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors shrink-0">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Stock Shortages Detected:</h3>
              <div className="space-y-3">
                {dispatchError.shortages?.map((shortage, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-rose-100 bg-rose-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{shortage.product_name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">Variant: {shortage.variant_name} | SKU: {shortage.sku}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0 bg-white px-4 py-2 rounded-xl border border-rose-100">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required</p>
                        <p className="font-black text-slate-700">{shortage.requested_quantity}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available</p>
                        <p className="font-black text-amber-600">{shortage.warehouse_physical_stock}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Shortfall</p>
                        <p className="font-black text-rose-600">-{shortage.shortfall}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setDispatchError(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
