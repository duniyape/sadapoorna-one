import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  Eye,
  Check,
  X,
  Edit2,
  Calendar,
  FileText,
  Handshake,
  Building2,
  ShoppingCart,
  IndianRupee,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import FinanceReceiptModal from "../components/FinanceReceiptModal";

const SwipeButton = ({ text, onConfirm, colorClass = "bg-emerald-500" }) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const containerRef = React.useRef(null);

  const handlePointerDown = (e) => {
    if (isSuccess) return;
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || isSuccess || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxX = rect.width - 28;
    const x = Math.max(0, Math.min(e.clientX - rect.left - 14, maxX));
    const percentage = (x / maxX) * 100;
    setSliderValue(percentage);
  };

  const handlePointerUp = (e) => {
    if (!isDragging || isSuccess) return;
    setIsDragging(false);
    e.target.releasePointerCapture(e.pointerId);

    if (sliderValue > 85) {
      setSliderValue(100);
      setIsSuccess(true);
      onConfirm();
    } else {
      setSliderValue(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-28 h-7 bg-slate-100 border border-slate-200 rounded-full overflow-hidden flex items-center shadow-inner select-none touch-none"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 ${colorClass} transition-all ${isDragging ? "duration-0" : "duration-300"}`}
        style={{ width: `${Math.max(25, sliderValue)}%` }}
      ></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`text-[9px] font-bold z-10 transition-colors uppercase tracking-wider ${sliderValue > 50 ? "text-white" : "text-slate-500"}`}
        >
          {isSuccess ? "Done" : text}
        </span>
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`absolute left-0.5 top-0.5 bottom-0.5 w-6 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center transition-all z-20 cursor-grab active:cursor-grabbing ${isDragging ? "duration-0" : "duration-300"}`}
        style={{ transform: `translateX(${(sliderValue / 100) * 84}px)` }}
      >
        <svg
          className="w-3 h-3 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

// ─── Animated Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg, border, sub }) => (
  <div
    className={`relative p-5 rounded-2xl border ${border} ${bg} overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
  >
    {/* Glow blob */}
    <div
      className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-2xl ${color.replace("text-", "bg-")}`}
    />
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
        {sub && (
          <p className="text-[10px] text-slate-400 font-medium mt-1">{sub}</p>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace(/(\d+)/, (m) => String(parseInt(m) - 500 + 100))} bg-opacity-20 border ${border}`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

import OrderPipeline from "../components/OrderPipeline";

export default function OrdersPage() {
  const [filter, setFilter] = useState("all");
  const [orderType, setOrderType] = useState("sale");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 20;

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast, user } = useOutletContext();

  const allowedIcons = user?.access?.frontend_icons || user?.designation?.frontend_icons || [];
  const orderPermissions = allowedIcons.find(iconData => typeof iconData === 'object' && iconData.icon === 'orders')?.buttons || [];

  const canConfirm = orderPermissions.includes('Confirm');
  const canPack = orderPermissions.includes('Pack');
  const canDispatch = orderPermissions.includes('Dispatch');
  const canDeliver = orderPermissions.includes('Deliver');
  const canView = orderPermissions.includes('View');
  const canEdit = orderPermissions.includes('Edit');

  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [isFetchingDeliveryOptions, setIsFetchingDeliveryOptions] = useState(false);

  const [showBillMode, setShowBillMode] = useState(false);
  const [billDiscount, setBillDiscount] = useState("");
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [isFetchingInvoice, setIsFetchingInvoice] = useState(false);
  const [isResendingWhatsApp, setIsResendingWhatsApp] = useState(false);
  
  const [showFinanceModal, setShowFinanceModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "ready to pick up":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "out for delivery":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-400";
      case "confirmed": return "bg-sky-400";
      case "ready to pick up": return "bg-violet-400";
      case "out for delivery": return "bg-indigo-400";
      case "delivered": return "bg-emerald-400";
      case "cancelled": return "bg-rose-400";
      default: return "bg-slate-400";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleGenerateBill = async () => {
    setIsGeneratingBill(true);
    try {
      const orderId = selectedOrder.mongo_id || selectedOrder._id || selectedOrder.id;
      const parsedDiscount = parseFloat(billDiscount) || 0;
      const payload = { discount_amount: parsedDiscount };

      console.log("Generating Bill - Payload sent to backend:", payload);

      const res = await fetch(`/orders/billing/v1/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        showToast("Bill generated and discount applied successfully!");
        setShowBillMode(false);
        fetchOrders();
        const calcGrandTotal = (selectedOrder.subtotal || 0) + (selectedOrder.total_gst || 0) + (selectedOrder.other_charges || 0) - parsedDiscount;
        setSelectedOrder((prev) => ({
          ...prev,
          discount: parsedDiscount,
          grand_total: calcGrandTotal,
          invoice_no: json.invoice_no || json.data?.invoice_no || "Generated"
        }));
      } else {
        const err = await res.json().catch(() => ({}));
        let errMsg = err.message || err.detail || "Failed to generate bill";
        if (Array.isArray(err.detail)) {
          errMsg = err.detail.map(e => `${e.loc?.join(".") || "Field"}: ${e.msg}`).join(" | ");
        }
        showToast(errMsg);
      }
    } catch (e) {
      console.error(e);
      showToast("Network error");
    } finally {
      setIsGeneratingBill(false);
    }
  };

  const handleViewInvoice = async () => {
    setIsFetchingInvoice(true);
    try {
      const orderId = selectedOrder.id || selectedOrder._id || selectedOrder.mongo_id;
      const res = await fetch(`/orders/get-bill/v1/${orderId}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.detail || "Failed to fetch invoice");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Error fetching invoice PDF");
    } finally {
      setIsFetchingInvoice(false);
    }
  };

  const handleResendWhatsApp = async () => {
    setIsResendingWhatsApp(true);
    try {
      const orderId = selectedOrder.id || selectedOrder._id || selectedOrder.mongo_id;
      const res = await fetch(`/orders/resend-bill/v1/${orderId}/whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let errMsg = err.message || err.detail || "Failed to resend on WhatsApp";
        if (Array.isArray(errMsg)) errMsg = errMsg[0]?.msg || "Failed to resend on WhatsApp";
        throw new Error(errMsg);
      }
      showToast("Invoice sent successfully on WhatsApp");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Error resending WhatsApp invoice");
    } finally {
      setIsResendingWhatsApp(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let url = `/orders/v1?page=${page}&limit=${limit}`;
      if (orderType !== "all") url += `&type=${orderType}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (filter !== "all") {
        if (filter === "billed") url += `&is_billed=true`;
        else if (filter === "unbilled") url += `&is_billed=false`;
        else url += `&status=${encodeURIComponent(filter)}`;
      }
      if (fromDate) url += `&from_date=${encodeURIComponent(fromDate)}`;
      if (toDate) url += `&to_date=${encodeURIComponent(toDate)}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setOrdersList(json.data);
          setTotalPages(json.pagination?.total_pages || 1);
          setTotalRecords(json.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, searchTerm, fromDate, toDate, page, orderType]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (!deliveryType) { setDeliveryOptions([]); return; }
      setIsFetchingDeliveryOptions(true);
      try {
        const endpoint = deliveryType === "vehicle" ? "/vehicles/get" : "/warehouses/get";
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const json = await response.json();
          setDeliveryOptions(json.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsFetchingDeliveryOptions(false);
      }
    };
    fetchOptions();
  }, [deliveryType]);

  const handleStatusChange = async (orderId, newStatus, extraData = {}) => {
    setOrdersList((prev) =>
      prev.map((o) =>
        o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o,
      ),
    );

    try {
      const response = await fetch(`/orders/status/v1/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus, ...extraData }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        let errorMsg = "API returned an error";
        if (errData?.detail) {
          if (Array.isArray(errData.detail)) {
            errorMsg = errData.detail.map((e) => `${e.loc?.join(".")}: ${e.msg}`).join(" | ");
          } else if (typeof errData.detail === "string") {
            errorMsg = errData.detail;
          } else {
            errorMsg = JSON.stringify(errData.detail);
          }
        }
        throw new Error(errorMsg);
      }
      showToast(`Order ${orderId.slice(-6)} updated to ${newStatus}`);
    } catch (error) {
      console.error("Status update failed:", error);
      showToast(error.message || `Failed to update ${orderId.slice(-6)}`);
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        }}
      >
        {/* Decorative glow blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-6 right-32 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">
                  Live Order Processing
                </span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Orders &amp; Invoices
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                End-to-end delivery lifecycle management
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => navigate("/create-return-order")}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-all w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-4 h-4" /> Create Return Order
            </button>
            <button
              onClick={() => navigate("/manifests")}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/15 transition-all w-full sm:w-auto justify-center"
            >
              <FileText className="w-4 h-4" /> Trip Sheets
            </button>
            <button
              onClick={() => navigate("/bulk-dispatch")}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center transition-all hover:scale-105 border border-violet-400/40"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff" }}
            >
              <Truck className="w-4 h-4" /> Bulk Out for Delivery
            </button>
            <button
              onClick={() => navigate("/add-order")}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #dc2626, #9f1239)", color: "#fff" }}
            >
              <Plus className="w-4 h-4" /> Create New Order
            </button>
          </div>

        </div>
      </div>


      {/* ── Orders Table Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/60">
          <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-auto bg-white transition-all cursor-pointer shadow-sm"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Ready to Pick Up">Ready to Pick Up</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="billed">Billed (Invoice Generated)</option>
              <option value="unbilled">Unbilled (No Invoice)</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <select
              value={orderType}
              onChange={(e) => { setOrderType(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-auto bg-white transition-all cursor-pointer shadow-sm"
            >
              <option value="sale">Sales</option>
              <option value="sale_return">Returns</option>
              <option value="all">All Types</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-auto bg-white transition-all shadow-sm"
                title="From Date"
              />
              <span className="text-slate-300 font-bold text-xs">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-auto bg-white transition-all shadow-sm"
                title="To Date"
              />
            </div>
            <div className="relative w-full sm:w-64 lg:w-80 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search invoice or notes..."
                className="pl-9 pr-3 py-2 w-full rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-3 p-4 bg-slate-50/50">
          {isLoading ? (
            <div className="p-10 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-100">
              Loading orders...
            </div>
          ) : ordersList.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-100">
              No orders found.
            </div>
          ) : (
            ordersList.map((ord) => {
              const orderId = ord.id || ord._id;
              const custName = ord.customer?.company_name || ord.customer?.business_name || ord.customer?.name || "Unknown";
              const itemsStr = `${ord.items?.length || 0} Items`;
              const totalAmt =
                ord.grand_total || ord.total ||
                ord.items?.reduce((acc, curr) => {
                  const qtyPerPkg = curr.quantity_per_package || curr.variant?.quantity_per_package || 1;
                  const rateType = curr.rate_type || curr.variant?.rate_type || 'per_package';
                  const multiplier = rateType === 'per_unit' ? qtyPerPkg : 1;
                  return acc + curr.quantity * multiplier * curr.rate;
                }, 0) ||
                0;

              return (
                <div
                  key={orderId}
                  className={`p-4 rounded-2xl border shadow-sm flex flex-col gap-3 relative hover:shadow-md transition-shadow ${!ord.invoice_no ? 'bg-rose-50/30 border-rose-200' : 'bg-white border-slate-200/80'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Order {ord.order_no || ord.invoice_no || orderId.slice(-6)}
                        </div>
                        <div className="text-[10px] text-slate-400">&bull;</div>
                        <div className="text-[10px] font-semibold text-slate-500">
                          {formatDate(ord.invoice_date || ord.created_at || ord.createdAt || ord.date)}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {custName}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border h-fit ${ord.invoice_no ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {ord.invoice_no ? 'Billed' : 'Unbilled'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-xs font-semibold text-slate-600">
                      {itemsStr}
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      ₹{totalAmt.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    <div className="flex justify-between items-center">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(ord.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(ord.status)}`} />
                        {ord.status || "Pending"}
                      </span>
                      <div className="flex items-center gap-2">
                        {canView && (
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 shadow-sm transition-colors"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => navigate(`/edit-order/${orderId}`)}
                            className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 shadow-sm transition-colors"
                            title="Edit Order"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="p-4 pl-5">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Order Summary</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Billing</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-bold">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-500 font-bold">
                    No orders found.
                  </td>
                </tr>
              ) : (
                ordersList.map((ord) => {
                  const orderId = ord.id || ord._id;
                  const custName = ord.customer?.company_name || ord.customer?.business_name || ord.customer?.name || "Unknown";
                  const itemsStr = `${ord.items?.length || 0} Items`;
                  const totalAmt =
                    ord.grand_total || ord.total ||
                    ord.items?.reduce((acc, curr) => {
                      const qtyPerPkg = curr.quantity_per_package || curr.variant?.quantity_per_package || 1;
                      const rateType = curr.rate_type || curr.variant?.rate_type || 'per_package';
                      const multiplier = rateType === 'per_unit' ? qtyPerPkg : 1;
                      return acc + curr.quantity * multiplier * curr.rate;
                    }, 0) || 0;

                  return (
                    <tr
                      key={orderId}
                      className={`transition-colors group ${!ord.invoice_no ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-indigo-50/30'}`}
                    >
                      <td className="p-4 pl-5">
                        <div className="font-black text-slate-900 text-xs">
                          #{ord.order_no || ord.invoice_no || orderId.slice(-6)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(ord.invoice_date || ord.created_at || ord.createdAt || ord.date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{custName}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                          <ShoppingCart className="w-3 h-3" />
                          {itemsStr}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-slate-900">
                          ₹{totalAmt.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${ord.invoice_no ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ord.invoice_no ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {ord.invoice_no ? 'Billed' : 'Unbilled'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(ord.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(ord.status)}`} />
                          {ord.status || "Pending"}
                        </span>
                      </td>
                      <td className="p-4 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canView && (
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 opacity-70 group-hover:opacity-100 transition-all"
                              title="View Order"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/edit-order/${orderId}`)}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 opacity-70 group-hover:opacity-100 transition-all"
                              title="Edit Order"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-800 font-bold">{((page - 1) * limit) + 1}</span>–<span className="text-slate-800 font-bold">{Math.min(page * limit, totalRecords)}</span> of <span className="text-slate-800 font-bold">{totalRecords}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black">{page}</span>
                <span className="text-xs text-slate-400 font-bold">of {totalPages}</span>
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Modal ───────────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl ring-1 ring-slate-200 overflow-hidden relative">

            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b border-slate-100 relative shrink-0"
              style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
            >
              {/* Glow */}
              <div className="absolute -top-6 left-8 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center border border-white/15">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex flex-wrap items-center gap-2">
                    {selectedOrder.order_no
                      ? `Order: ${selectedOrder.order_no}`
                      : selectedOrder.invoice_no
                        ? `Invoice: ${selectedOrder.invoice_no}`
                        : `ID: ${selectedOrder.id?.slice(-6) || selectedOrder._id?.slice(-6)}`}
                    {selectedOrder.order_no && selectedOrder.invoice_no && (
                      <span className="text-xs font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                        Inv: {selectedOrder.invoice_no}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status || "Pending"}
                    </span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(selectedOrder.invoice_date || selectedOrder.created_at || selectedOrder.createdAt || selectedOrder.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="relative z-10 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Pipeline */}
            {selectedOrder.type !== 'sale_return' && (
              <div className="px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Order Progress
                </p>
                <OrderPipeline currentStatus={selectedOrder.status} />
              </div>
            )}

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar space-y-6">

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 hover:border-indigo-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Handshake className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</div>
                    <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                      {selectedOrder.customer?.company_name || selectedOrder.customer?.name || "Unknown"}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 hover:border-amber-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Type</div>
                    <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate uppercase">
                      {(selectedOrder.type || "SALE").replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 hover:border-sky-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-sky-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Items</div>
                    <div className="text-sm font-black text-slate-800 leading-tight mt-0.5">
                      {selectedOrder.items?.length || 0}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-3 hover:border-emerald-200 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</div>
                    <div className="text-sm font-black text-emerald-600 leading-tight mt-0.5">
                      ₹{selectedOrder.grand_total?.toLocaleString() ||
                        selectedOrder.total?.toLocaleString() ||
                        (selectedOrder.items?.reduce((acc, curr) => {
                          const qtyPerPkg = curr.quantity_per_package || curr.variant?.quantity_per_package || 1;
                          const rateType = curr.rate_type || curr.variant?.rate_type || 'per_package';
                          const multiplier = rateType === 'per_unit' ? qtyPerPkg : 1;
                          return acc + curr.quantity * multiplier * curr.rate;
                        }, 0) || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Order Items
                    </h3>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-2.5 py-1 rounded-lg bg-white shadow-sm">
                    GST: {selectedOrder.gst_type || "including"}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3">Product / Variant</th>
                        <th className="px-5 py-3 text-right">Qty</th>
                        <th className="px-5 py-3 text-right">Rate</th>
                        <th className="px-5 py-3 text-right">Taxable</th>
                        <th className="px-5 py-3 text-right">GST</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-800">{item.product_name || "Product"}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {item.variant_name || "Variant"} {item.sku ? `(${item.sku})` : ""}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-900">{item.quantity}</td>
                          <td className="px-5 py-4 text-right">₹{item.rate}</td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-700">
                            ₹{item.taxable_amount || (item.quantity * (item.rate_type === 'per_unit' ? (item.quantity_per_package || item.variant?.quantity_per_package || 1) : 1) * item.rate)}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-500">
                            {item.gst_percent ? `${item.gst_percent}% (₹${item.gst_amount})` : "N/A"}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-800">
                            ₹{item.total_amount || (item.quantity * (item.rate_type === 'per_unit' ? (item.quantity_per_package || item.variant?.quantity_per_package || 1) : 1) * item.rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-5 border-t border-slate-200">
                  <div className="flex flex-col items-end gap-2 text-xs">
                    {[
                      { label: "Subtotal", val: `₹${selectedOrder.subtotal?.toLocaleString() || (selectedOrder.items?.reduce((a, c) => {
                          const qtyPerPkg = c.quantity_per_package || c.variant?.quantity_per_package || 1;
                          const rateType = c.rate_type || c.variant?.rate_type || 'per_package';
                          const multiplier = rateType === 'per_unit' ? qtyPerPkg : 1;
                          return a + c.quantity * multiplier * c.rate;
                        }, 0) || 0).toLocaleString()}`, color: "text-slate-600" },
                      { label: "Total GST", val: `₹${selectedOrder.total_gst?.toLocaleString() || 0}`, color: "text-slate-600" },
                      { label: "Other Charges", val: `₹${selectedOrder.other_charges?.toLocaleString() || 0}`, color: "text-slate-600" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className={`flex justify-between w-52 ${color}`}>
                        <span className="font-medium">{label}</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between w-52 text-rose-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold flex items-center justify-end">
                        {showBillMode ? (
                          <div className="flex items-center gap-1">
                            <span>- ₹</span>
                            <input
                              type="number"
                              value={billDiscount}
                              onChange={(e) => setBillDiscount(e.target.value)}
                              className="w-16 px-1.5 py-0.5 border border-rose-200 bg-rose-50 rounded text-right font-bold text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-400"
                              placeholder="0"
                            />
                          </div>
                        ) : (
                          `- ₹${selectedOrder.discount?.toLocaleString() || 0}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between w-52 text-emerald-700 pt-3 border-t-2 border-emerald-200 mt-1">
                      <span className="font-black uppercase tracking-wider text-[10px] mt-1">Grand Total</span>
                      <span className="font-black text-xl leading-none">
                        ₹{showBillMode
                          ? ((selectedOrder.subtotal || 0) + (selectedOrder.total_gst || 0) + (selectedOrder.other_charges || 0) - (parseFloat(billDiscount) || 0)).toLocaleString()
                          : (selectedOrder.grand_total?.toLocaleString() ||
                              selectedOrder.total?.toLocaleString() ||
                              (selectedOrder.items?.reduce((acc, curr) => {
                                const qtyPerPkg = curr.quantity_per_package || curr.variant?.quantity_per_package || 1;
                                const rateType = curr.rate_type || curr.variant?.rate_type || 'per_package';
                                const multiplier = rateType === 'per_unit' ? qtyPerPkg : 1;
                                return acc + curr.quantity * multiplier * curr.rate;
                              }, 0) || 0).toLocaleString())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update & Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Status Update */}
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-500" /> Update Order Status
                    </h3>

                    {(selectedOrder.status === "Ready to Pick Up" || (selectedOrder.type === 'sale_return' && selectedOrder.status === "Confirmed")) && (
                      <div className="mb-4 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Delivery Medium</div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input type="radio" name="deliveryType" value="vehicle" checked={deliveryType === "vehicle"} onChange={(e) => { setDeliveryType(e.target.value); setSelectedDeliveryId(""); }} className="accent-indigo-500" /> Vehicle
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <input type="radio" name="deliveryType" value="warehouse" checked={deliveryType === "warehouse"} onChange={(e) => { setDeliveryType(e.target.value); setSelectedDeliveryId(""); }} className="accent-indigo-500" /> Warehouse
                          </label>
                        </div>

                        {deliveryType === "vehicle" && (
                          <div className="mt-3">
                            <select
                              value={selectedDeliveryId}
                              onChange={(e) => setSelectedDeliveryId(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white"
                            >
                              <option value="">Select a vehicle</option>
                              {isFetchingDeliveryOptions ? (
                                <option value="" disabled>Loading options...</option>
                              ) : (
                                deliveryOptions.map(opt => (
                                  <option key={opt.id || opt._id} value={opt.id || opt._id}>
                                    {opt.vehicle_number} - {opt.vehicle_type}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        )}
                        {deliveryType === "warehouse" && (
                          <div className="mt-3 text-xs text-slate-500 font-medium px-1">
                            Will be delivered directly to the assigned warehouse.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                      {selectedOrder.type === 'sale_return' ? (
                        <>
                          {(!selectedOrder.status || selectedOrder.status === "Pending") && canConfirm && (
                            <>
                              <SwipeButton
                                text="Confirm"
                                colorClass="bg-emerald-500"
                                onConfirm={() => {
                                  handleStatusChange(selectedOrder.id || selectedOrder._id, "Confirmed");
                                  setSelectedOrder((prev) => ({ ...prev, status: "Confirmed" }));
                                }}
                              />
                              <button
                                onClick={() => {
                                  handleStatusChange(selectedOrder.id || selectedOrder._id, "Rejected");
                                  setSelectedOrder((prev) => ({ ...prev, status: "Rejected" }));
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors h-11"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {selectedOrder.status === "Confirmed" && canConfirm && (
                            <div className={(!deliveryType || (deliveryType === "vehicle" && !selectedDeliveryId)) ? "opacity-50 pointer-events-none" : ""}>
                              <SwipeButton
                                text="Complete"
                                colorClass="bg-teal-500"
                                onConfirm={() => {
                                  handleStatusChange(selectedOrder.id || selectedOrder._id, "Completed", {
                                    delivery_type: deliveryType,
                                    [deliveryType === "vehicle" ? "vehicle_id" : "warehouse_id"]: deliveryType === "vehicle" ? selectedDeliveryId : (selectedOrder.warehouse_id || selectedOrder.warehouse?._id)
                                  });
                                  setSelectedOrder((prev) => ({ ...prev, status: "Completed" }));
                                }}
                              />
                            </div>
                          )}
                          {(!selectedOrder.status || !["completed", "cancelled", "rejected"].includes(selectedOrder.status?.toLowerCase())) && (
                            <button
                              onClick={() => {
                                handleStatusChange(selectedOrder.id || selectedOrder._id, "Cancelled");
                                setSelectedOrder((prev) => ({ ...prev, status: "Cancelled" }));
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors h-11"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {(!selectedOrder.status || selectedOrder.status === "Pending") && canConfirm && (
                            <SwipeButton
                              text="Confirm"
                              colorClass="bg-emerald-500"
                              onConfirm={() => {
                                handleStatusChange(selectedOrder.id || selectedOrder._id, "Confirmed");
                                setSelectedOrder((prev) => ({ ...prev, status: "Confirmed" }));
                              }}
                            />
                          )}
                          {selectedOrder.status === "Confirmed" && canPack && (
                            <SwipeButton
                              text="Pack"
                              colorClass="bg-sky-500"
                              onConfirm={() => {
                                handleStatusChange(selectedOrder.id || selectedOrder._id, "Ready to Pick Up");
                                setSelectedOrder((prev) => ({ ...prev, status: "Ready to Pick Up" }));
                              }}
                            />
                          )}
                          {selectedOrder.status === "Ready to Pick Up" && canDispatch && (
                            <div className={(!deliveryType || (deliveryType === "vehicle" && !selectedDeliveryId)) ? "opacity-50 pointer-events-none" : ""}>
                              <SwipeButton
                                text="Dispatch"
                                colorClass="bg-indigo-500"
                                onConfirm={() => {
                                  handleStatusChange(selectedOrder.id || selectedOrder._id, "Out for Delivery", {
                                    delivery_type: deliveryType,
                                    [deliveryType === "vehicle" ? "vehicle_id" : "warehouse_id"]: deliveryType === "vehicle" ? selectedDeliveryId : (selectedOrder.warehouse_id || selectedOrder.warehouse?._id)
                                  });
                                  setSelectedOrder((prev) => ({ ...prev, status: "Out for Delivery" }));
                                }}
                              />
                            </div>
                          )}
                          {selectedOrder.status === "Out for Delivery" && canDeliver && (
                            <SwipeButton
                              text="Deliver"
                              colorClass="bg-emerald-600"
                              onConfirm={() => {
                                handleStatusChange(selectedOrder.id || selectedOrder._id, "Delivered");
                                setSelectedOrder((prev) => ({ ...prev, status: "Delivered" }));
                              }}
                            />
                          )}
                          {(!selectedOrder.status || !["delivered", "cancelled"].includes(selectedOrder.status?.toLowerCase())) && (
                            <button
                              onClick={() => {
                                handleStatusChange(selectedOrder.id || selectedOrder._id, "Cancelled");
                                setSelectedOrder((prev) => ({ ...prev, status: "Cancelled" }));
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors h-11"
                            >
                              Cancel Order
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {["delivered", "cancelled", "completed", "rejected"].includes(selectedOrder.status?.toLowerCase()) && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                      <div className="text-[10px] text-slate-500 font-medium">
                        This order is <span className="font-black text-slate-700">{selectedOrder.status}</span>. Status cannot be changed further.
                      </div>
                      {(selectedOrder.status?.toLowerCase() === "delivered" || (selectedOrder.type === 'sale_return' && selectedOrder.status?.toLowerCase() === "completed")) && (
                        <div className="flex gap-2 mt-1">
                          {!showBillMode ? (
                            <div className="flex flex-col gap-2 w-full">
                              {!selectedOrder.invoice_no ? (
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => { setShowBillMode(true); setBillDiscount(selectedOrder.discount || ""); }}
                                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                  >
                                    <FileText className="w-4 h-4" />
                                    Generate Bill
                                  </button>
                                  <button
                                    onClick={() => setShowFinanceModal(true)}
                                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                  >
                                    <IndianRupee className="w-4 h-4" />
                                    Collect Payment
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setShowFinanceModal(true)}
                                    className="w-full px-4 py-3 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-200 flex items-center justify-center gap-2"
                                  >
                                    <IndianRupee className="w-4 h-4" /> Collect Payment
                                  </button>
                                  <button
                                    onClick={handleViewInvoice}
                                    disabled={isFetchingInvoice}
                                    className="w-full px-4 py-2.5 rounded-xl text-xs font-black bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                  >
                                    {isFetchingInvoice ? "Loading..." : <><Download className="w-3.5 h-3.5" /> PDF Bill</>}
                                  </button>
                                  <button
                                    onClick={handleResendWhatsApp}
                                    disabled={isResendingWhatsApp}
                                    className="w-full px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    {isResendingWhatsApp ? "Sending..." : "Resend Bill on WhatsApp"}
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-2 w-full">
                              <button
                                onClick={handleGenerateBill}
                                disabled={isGeneratingBill}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                              >
                                {isGeneratingBill ? "Saving..." : "Save & Generate"}
                              </button>
                              <button
                                onClick={() => setShowBillMode(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes & Terms */}
                <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Order Notes
                      </h4>
                      <p className="text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 min-h-[64px] leading-relaxed">
                        {selectedOrder.notes || "No additional notes for this order."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFinanceModal && selectedOrder && (
        <FinanceReceiptModal 
          order={selectedOrder} 
          onClose={() => setShowFinanceModal(false)}
          onSuccess={(msg) => {
            showToast(msg);
            setShowFinanceModal(false);
            fetchOrders(); // Refresh table
            setSelectedOrder(null); // Close modal
          }}
        />
      )}
    </div>
  );
}
