import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UserPlus,
  ShoppingBag,
  Users,
  Wallet,
  FileText,
  Calendar,
  Truck,
  Fuel,
  MessageSquare,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  BarChart2,
  Route,
  Handshake,
  UserX,
  CheckSquare,
  Send,
  Receipt,
  X,
  Menu,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  DollarSign,
  Package,
  Sliders,
  TrendingUp,
  MapPin,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Home,
  PlusCircle,
  Sparkles,
  Bot,
  Wand2,
  Volume2,
  Play,
  Pause,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  Globe,
  ArrowLeft,
  Filter,
  Download,
  Plus,
  Check,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  CreditCard
} from 'lucide-react';

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

const SALES_OPERATIONS = [
  { id: 'add-customer', title: 'Add Customer', icon: UserPlus, color: 'bg-pink-100 text-pink-600 border-pink-200', badge: 'Hot', desc: 'Register a new customer account' },
  { id: 'beat-mgmt', title: 'Beat Management', icon: Route, color: 'bg-amber-100 text-amber-600 border-amber-200', badge: null, desc: 'Manage sales beats and territories' },
  { id: 'collection', title: 'Collection', icon: FileText, color: 'bg-blue-100 text-blue-600 border-blue-200', badge: null, desc: 'Record cash & cheque payments' },
  { id: 'credit-approval', title: 'Credit Approval', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-600 border-emerald-200', badge: '3 Pending', desc: 'Approve customer credit limits' },
  { id: 'analytics', title: 'Customer Analytics', icon: BarChart2, color: 'bg-purple-100 text-purple-600 border-purple-200', badge: null, desc: 'Insights on buyer behavior' },
  { id: 'customers', title: 'Customers Directory', icon: Users, color: 'bg-orange-100 text-orange-600 border-orange-200', badge: null, desc: 'View complete client directory' },
  { id: 'daily-route', title: 'Daily Route', icon: MapPin, color: 'bg-teal-100 text-teal-600 border-teal-200', badge: null, desc: 'Optimized delivery paths' },
  { id: 'due-collection', title: 'Due Collection', icon: Clock, color: 'bg-rose-100 text-rose-600 border-rose-200', badge: 'Action Required', desc: 'Track pending payments' },
  { id: 'follow-ups', title: 'Follow Ups', icon: Handshake, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: null, desc: 'Manage client tasks & calls' },
  { id: 'inactive-customers', title: 'Inactive Customers', icon: UserX, color: 'bg-pink-100 text-pink-600 border-pink-200', badge: null, desc: 'Re-engage inactive accounts' },
  { id: 'orders', title: 'Orders & Invoices', icon: CheckSquare, color: 'bg-sky-100 text-sky-600 border-sky-200', badge: '12 New', desc: 'Process new orders & invoices' },
  { id: 'transfer', title: 'Stock Transfer', icon: ArrowRightLeft, color: 'bg-orange-100 text-orange-600 border-orange-200', badge: null, desc: 'Stock & balance transfer' },
  { id: 'ai-suite', title: 'Sadapoorna AI Suite', icon: Bot, color: 'bg-purple-100 text-purple-600 border-purple-200', badge: 'Gemini AI', desc: 'AI marketing & credit risk tools' },
];

const HR_FLEET_MODULES = [
  { id: 'staff', title: 'Staff Directory', icon: Users, color: 'bg-emerald-100 text-emerald-600 border-emerald-200', badge: null, desc: 'Directory of employees' },
  { id: 'leave-mgmt', title: 'Leave Management', icon: Calendar, color: 'bg-purple-100 text-purple-600 border-purple-200', badge: '3 New', desc: 'Approve leaves & holidays' },
  { id: 'attendance', title: 'Attendance Log', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600 border-blue-200', badge: null, desc: 'Daily punch & time logs' },
  { id: 'fleet-mgmt', title: 'Fleet Management', icon: Truck, color: 'bg-amber-100 text-amber-600 border-amber-200', badge: null, desc: 'Vehicles, drivers & routes' },
  { id: 'fuel-log', title: 'Fuel Log', icon: Fuel, color: 'bg-pink-100 text-pink-600 border-pink-200', badge: null, desc: 'Track fuel fill-ups' },
  { id: 'expenses', title: 'Expenses Claims', icon: Receipt, color: 'bg-green-100 text-green-600 border-green-200', badge: null, desc: 'Record staff allowances' },
  { id: 'payroll', title: 'Payroll Slips', icon: DollarSign, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: null, desc: 'Salary disbursement & slips' },
  { id: 'inventory-stock', title: 'Stock Inventory', icon: Package, color: 'bg-teal-100 text-teal-600 border-teal-200', badge: null, desc: 'Warehouse inventory count' },
  { id: 'reports', title: 'Financial Audit', icon: TrendingUp, color: 'bg-violet-100 text-violet-600 border-violet-200', badge: null, desc: 'P&L and ledger reports' },
];

const CATEGORIZED_SIDEBAR = [
  {
    category: 'Main Dashboard',
    items: [
      { id: 'home', label: 'All Operations', icon: Home },
      { id: 'ai-suite', label: 'Sadapoorna AI Suite', icon: Bot, badge: 'Gemini' }
    ]
  },
  {
    category: 'Sales & Billing',
    items: [
      { id: 'add-customer', label: 'Add Customer', icon: UserPlus, badge: 'New' },
      { id: 'orders', label: 'Orders & Bills', icon: ShoppingBag, badge: '12' },
      { id: 'customers', label: 'Customer Directory', icon: Users },
      { id: 'collection', label: 'Cash Collection', icon: Wallet },
      { id: 'due-collection', label: 'Due Collections', icon: Clock, badge: 'Alert' },
      { id: 'credit-approval', label: 'Credit Approvals', icon: ShieldCheck, badge: '3' },
      { id: 'beat-mgmt', label: 'Beat Management', icon: Route },
      { id: 'inactive-customers', label: 'Inactive Clients', icon: UserX },
    ]
  },
  {
    category: 'Inventory & HR Fleet',
    items: [
      { id: 'inventory-stock', label: 'Stock Inventory', icon: Package },
      { id: 'staff', label: 'Staff Directory', icon: Users },
      { id: 'leave-mgmt', label: 'Leave Requests', icon: Calendar },
      { id: 'fleet-mgmt', label: 'Fleet & Vehicles', icon: Truck },
      { id: 'reports', label: 'Financial Audit', icon: TrendingUp },
    ]
  }
];


const ROUTES = {
  home: "/",

  "add-customer": "/add-customer",
  orders: "/orders",
  customers: "/customers",
  collection: "/collection",
  "due-collection": "/due-collection",
  "credit-approval": "/credit-approval",
  "beat-mgmt": "/beat-mgmt",
  "inactive-customers": "/inactive-customers",

  "inventory-stock": "/inventory-stock",
  staff: "/staff",
  "leave-mgmt": "/leave-management",
  "fleet-mgmt": "/fleet-management",
  reports: "/reports",

  "ai-suite": "/ai-suite",
};

const getRoute = (id) => {
  return ROUTES[id] || `/module/${id}`;
};

function pcmToWav(pcmData, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(v, offset, string) {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    view.setInt16(offset, pcmData[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function apiFetchWithBackoff(url, options) {
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (e) {
      if (i === 2) throw e;
    }
    await new Promise(res => setTimeout(res, delay));
    delay *= 2;
  }
  return await fetch(url, options);
}

async function callGeminiText(prompt, systemInstruction = '', useGrounding = false) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (systemInstruction) {
    payload.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (useGrounding) {
    payload.tools = [{ "google_search": {} }];
  }

  const response = await apiFetchWithBackoff(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  const candidate = result.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text || '';

  let sources = [];
  const groundingMetadata = candidate?.groundingMetadata;
  if (groundingMetadata && groundingMetadata.groundingAttributions) {
    sources = groundingMetadata.groundingAttributions
      .map(att => ({ uri: att.web?.uri, title: att.web?.title }))
      .filter(s => s.uri && s.title);
  }

  return { text, sources };
}

async function callGeminiStructured(prompt, responseSchema) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  };

  const response = await apiFetchWithBackoff(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? JSON.parse(text) : null;
}

async function generateImagenBanner(prompt) {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;

  const payload = {
    instances: [{ prompt: prompt }],
    parameters: { sampleCount: 1 }
  };

  const response = await apiFetchWithBackoff(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
  }
  return null;
}

async function generateGeminiSpeech(text, voiceName = "Zephyr") {
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  };

  const response = await apiFetchWithBackoff(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  const part = result?.candidates?.[0]?.content?.parts?.[0];
  const audioData = part?.inlineData?.data;
  const mimeType = part?.inlineData?.mimeType || "";

  if (audioData) {
    let sampleRate = 24000;
    const match = mimeType.match(/rate=(\d+)/);
    if (match) sampleRate = parseInt(match[1], 10);

    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const pcm16 = new Int16Array(bytes.buffer);
    const wavBlob = pcmToWav(pcm16, sampleRate);
    return URL.createObjectURL(wavBlob);
  }
  return null;
}

function SadapoornaLogo({ size = 'normal' }) {
  const isSmall = size === 'small';
  return (
    <div className={`inline-flex items-center justify-center bg-[#E31E24] text-white rounded-full font-serif font-bold tracking-tight shadow-md border-2 border-red-500/30 ${
      isSmall ? 'px-3 py-1 text-sm' : 'px-6 py-2 text-xl sm:text-2xl'
    }`}>
      <span className="relative flex items-center gap-1">
        Sadapoorna
        <Sparkles className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-300 animate-pulse`} />
      </span>
    </div>
  );
}


// 1. ADD CUSTOMER PAGE
function AddCustomerPage({ onNavigate, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    gstin: '',
    address: '',
    beat: 'Beat 1 - Central Market',
    creditLimit: '150000',
    creditPeriodDays: '30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`Customer account '${formData.name}' created successfully!`);
    onNavigate('customers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Customer Account</h1>
            <p className="text-xs text-slate-500">Register new wholesale trader or retail shopkeeper</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Business / Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Laxmi Supermarket"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Proprietor / Owner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Patel"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="29AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Beat / Sales Territory</label>
              <select
                value={formData.beat}
                onChange={(e) => setFormData({ ...formData, beat: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:outline-none bg-white"
              >
                <option>Beat 1 - Central Market</option>
                <option>Beat 2 - North Wholesale Hub</option>
                <option>Beat 3 - South Retail Zone</option>
                <option>Beat 4 - Highway Outlets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Credit Limit (₹)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Commercial Address</label>
            <textarea
              rows="3"
              placeholder="Shop No. 42, Grain Market Main Road..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-6 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-md"
            >
              Register Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrdersPage({ onNavigate, showToast }) {
  const [filter, setFilter] = useState('all');

  const orders = [
    { id: 'ORD-9821', customer: 'Apex Wholesale Traders', date: 'Today, 10:30 AM', items: '50 Bags Sonamasuri Rice (26kg)', total: '₹72,500', status: 'Approved', paid: 'Paid' },
    { id: 'ORD-9820', customer: 'Laxmi Supermarket', date: 'Today, 09:15 AM', items: '20 Quintals Basmati Special', total: '₹1,40,000', status: 'Pending Approval', paid: 'Credit' },
    { id: 'ORD-9819', customer: 'Shree Balaji Kirana Store', date: 'Yesterday', items: '15 Bags Jeera Rice', total: '₹22,500', status: 'Dispatched', paid: 'Paid' },
    { id: 'ORD-9818', customer: 'Karnataka Grain Hub', date: 'Yesterday', items: '100 Bags Wheat Grade A', total: '₹1,85,000', status: 'Delivered', paid: 'Partially Paid' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders & Invoices</h1>
            <p className="text-xs text-slate-500">Live order processing and delivery status</p>
          </div>
        </div>
        <button
          onClick={() => showToast('New Order entry window triggered')}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Order
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Total Orders Today</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">28 Invoices</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Today's Order Value</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹4,20,000</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Pending Approval</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">3 Orders</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold">Dispatched</div>
          <div className="text-2xl font-extrabold text-sky-600 mt-1">14 Vehicles</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>All Orders</button>
            <button onClick={() => setFilter('pending')} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Pending</button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input type="text" placeholder="Search order ID or client..." className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Order Summary</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{ord.id}</td>
                  <td className="p-4 font-semibold text-slate-800">{ord.customer}</td>
                  <td className="p-4 text-slate-600">{ord.items}</td>
                  <td className="p-4 font-bold text-slate-900">{ord.total}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ord.paid === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {ord.paid}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => showToast(`Printed invoice ${ord.id}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => showToast(`Opened ${ord.id}`)} className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersDirectoryPage({ onNavigate, showToast }) {
  const customers = [
    { name: 'Laxmi Supermarket', owner: 'Rajesh Patel', beat: 'Beat 1 - Central', phone: '+91 98765 43210', limit: '₹2,00,000', balance: '₹1,42,000', status: 'Overdue' },
    { name: 'Apex Wholesale Traders', owner: 'Suresh Gowda', beat: 'Beat 2 - North', phone: '+91 98440 12345', limit: '₹5,00,000', balance: '₹45,000', status: 'Good Standing' },
    { name: 'Shree Balaji Kirana Store', owner: 'Anil Kumar', beat: 'Beat 1 - Central', phone: '+91 97312 88900', limit: '₹1,00,000', balance: '₹0', status: 'Clear' },
    { name: 'Karnataka Grain Hub', owner: 'Mahesh Reddy', beat: 'Beat 3 - West', phone: '+91 99001 55443', limit: '₹3,50,000', balance: '₹88,000', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customer Directory</h1>
            <p className="text-xs text-slate-500">Registered grain buyers and accounts ledger</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('add-customer')}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {customers.map((c, i) => (
          <div key={i} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 font-bold flex items-center justify-center text-base">
                {c.name.charAt(0)}
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                c.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {c.status}
              </span>
            </div>

            <h3 className="font-bold text-sm text-slate-900 truncate">{c.name}</h3>
            <p className="text-xs text-slate-400 font-medium mb-3">{c.owner} • {c.beat}</p>

            <div className="space-y-1.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-500">
                <span>Credit Limit:</span>
                <span className="font-bold text-slate-800">{c.limit}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Outstanding:</span>
                <span className="font-bold text-rose-600">{c.balance}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => showToast(`Dialed ${c.phone}`)} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Call Client
              </button>
              <button onClick={() => showToast(`Viewing ledger for ${c.name}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockInventoryPage({ onNavigate, showToast }) {
  const stockItems = [
    { code: 'GR-001', name: 'Sonamasuri Raw Rice (26kg)', category: 'Rice Bags', stock: '840 Bags', reorder: '200 Bags', rate: '₹1,350', warehouse: 'Godown A' },
    { code: 'GR-002', name: 'Sonamasuri Steam Rice (26kg)', category: 'Rice Bags', stock: '420 Bags', reorder: '150 Bags', rate: '₹1,450', warehouse: 'Godown A' },
    { code: 'GR-003', name: 'Basmati Special Long Grain', category: 'Premium Grain', stock: '35 Quintals', reorder: '50 Quintals', rate: '₹7,200 / Q', warehouse: 'Godown B' },
    { code: 'GR-004', name: 'Whole Wheat Grade-A', category: 'Wheat', stock: '1,200 Bags', reorder: '300 Bags', rate: '₹1,850', warehouse: 'Godown C' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Stock &amp; Inventory Management</h1>
            <p className="text-xs text-slate-500">Live grain quantities across Sadapoorna godowns</p>
          </div>
        </div>
        <button onClick={() => showToast('Stock Inward Entry opened')} className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" /> Inward Stock Receipt
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Available Stock</th>
                <th className="p-4">Wholesale Rate</th>
                <th className="p-4">Godown</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stockItems.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.code}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 font-bold text-teal-600">{item.stock}</td>
                  <td className="p-4 font-bold text-slate-900">{item.rate}</td>
                  <td className="p-4 text-slate-600">{item.warehouse}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => showToast(`Edited stock for ${item.code}`)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AiSuitePage({ onNavigate, showToast }) {
  const [aiActiveTab, setAiActiveTab] = useState('whatsapp');
  
  // WA Broadcast
  const [waProduct, setWaProduct] = useState('Sonamasuri Steam Rice (26kg)');
  const [waPrice, setWaPrice] = useState('₹1,450 / bag');
  const [waTone, setWaTone] = useState('Festival Special Discount');
  const [waCopyLoading, setWaCopyLoading] = useState(false);
  const [waImageLoading, setWaImageLoading] = useState(false);
  const [generatedWaText, setGeneratedWaText] = useState('');
  const [generatedWaImage, setGeneratedWaImage] = useState(null);

  // Risk Assessor
  const [selectedCustomer, setSelectedCustomer] = useState('Laxmi Supermarket');
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);

  // Voice Digest
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // APMC Search
  const [apmcQuery, setApmcQuery] = useState('Current APMC mandi rates for paddy and wheat in Karnataka');
  const [apmcLoading, setApmcLoading] = useState(false);
  const [apmcResult, setApmcResult] = useState(null);

  const handleGenerateWaBroadcast = async () => {
    setWaCopyLoading(true);
    setWaImageLoading(true);
    try {
      const promptText = `Write an engaging, persuasive WhatsApp broadcast message in English for Sadapoorna Rice & Grain Merchants.
Product: ${waProduct}
Special Rate: ${waPrice}
Offer Context: ${waTone}
Include emojis, clear call-to-action, payment details prompt, and contact info.`;

      const textRes = await callGeminiText(promptText, "You are an expert wholesale grain marketer for Sadapoorna Enterprise.");
      setGeneratedWaText(textRes.text);
      setWaCopyLoading(false);

      const imagePrompt = `A high quality, vibrant promotional advertisement banner for ${waProduct}, fresh Indian rice grain bags piled elegantly in a clean modern storehouse, warm cinematic lighting, photorealistic 4k.`;
      const imgRes = await generateImagenBanner(imagePrompt);
      if (imgRes) {
        setGeneratedWaImage(imgRes);
      }
    } catch (e) {
      showToast('AI Generation failed. Please try again.');
    } finally {
      setWaCopyLoading(false);
      setWaImageLoading(false);
    }
  };

  const handleEvaluateRisk = async () => {
    setRiskLoading(true);
    try {
      const prompt = `Evaluate the credit risk for client '${selectedCustomer}'.
Output structured JSON evaluation based on:
- Outstanding Balance: ₹1,42,000
- Overdue Days: 18 days
- Avg monthly order volume: ₹3,50,000
- Historical payment score: 72/100`;

      const schema = {
        type: "OBJECT",
        properties: {
          customerName: { type: "STRING" },
          riskLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
          recommendedCreditLimit: { type: "STRING" },
          paymentDaysAllowed: { type: "NUMBER" },
          recommendedAction: { type: "STRING" },
          observations: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["customerName", "riskLevel", "recommendedCreditLimit", "paymentDaysAllowed", "recommendedAction", "observations"]
      };

      const result = await callGeminiStructured(prompt, schema);
      setRiskResult(result);
    } catch (e) {
      showToast('Risk assessment failed.');
    } finally {
      setRiskLoading(false);
    }
  };

  const handleGenerateDailyTts = async () => {
    setTtsLoading(true);
    try {
      const script = `Sadapoorna Enterprise Daily Operational Update. Total sales today ₹4.2 Lakhs. 12 new orders processed for Sonamasuri and Basmati rice. 3 credit limits pending manager approval. High priority: Due collection from Laxmi Supermarket is overdue by 18 days.`;
      const url = await generateGeminiSpeech(script);
      if (url) {
        setAudioUrl(url);
        showToast('Voice Digest synthesized successfully!');
      }
    } catch (e) {
      showToast('TTS synthesis failed.');
    } finally {
      setTtsLoading(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSearchApmc = async () => {
    if (!apmcQuery.trim()) return;
    setApmcLoading(true);
    try {
      const res = await callGeminiText(apmcQuery, "You are a real-time agricultural mandi intelligence expert.", true);
      setApmcResult(res);
    } catch (e) {
      showToast('APMC search failed.');
    } finally {
      setApmcLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Sadapoorna Gemini AI Suite <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500">Powered by Gemini 3 Flash, Imagen 4, and Speech Synthesis</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setAiActiveTab('whatsapp')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'whatsapp' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> WhatsApp Broadcast
        </button>
        <button
          onClick={() => setAiActiveTab('risk')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'risk' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Credit Risk Assessor
        </button>
        <button
          onClick={() => setAiActiveTab('voice')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'voice' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" /> Daily Voice Digest
        </button>
        <button
          onClick={() => setAiActiveTab('apmc')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'apmc' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" /> APMC Mandi Live Search
        </button>
      </div>

      {aiActiveTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" /> WhatsApp Campaign Generator
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Grain / Product</label>
              <input type="text" value={waProduct} onChange={(e) => setWaProduct(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Special Rate Offer</label>
              <input type="text" value={waPrice} onChange={(e) => setWaPrice(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Hook / Context</label>
              <input type="text" value={waTone} onChange={(e) => setWaTone(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <button
              onClick={handleGenerateWaBroadcast}
              disabled={waCopyLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              {waCopyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Broadcast Text &amp; Image
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Campaign Preview</h3>
            {generatedWaText ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedWaText}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 border border-slate-100">
                Click generate to draft AI copy
              </div>
            )}

            {generatedWaImage && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">AI Banner Output (Imagen 4)</div>
                <img src={generatedWaImage} alt="Generated Banner" className="w-full h-48 object-cover rounded-2xl shadow-sm border" />
              </div>
            )}
          </div>
        </div>
      )}

      {aiActiveTab === 'risk' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> AI Credit Risk Evaluator
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer Account</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-white">
              <option>Laxmi Supermarket</option>
              <option>Apex Wholesale Traders</option>
              <option>Karnataka Grain Hub</option>
            </select>
          </div>
          <button
            onClick={handleEvaluateRisk}
            disabled={riskLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            {riskLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Evaluate Structured Risk Score
          </button>

          {riskResult && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{riskResult.customerName}</span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  riskResult.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {riskResult.riskLevel} RISK
                </span>
              </div>
              <div className="text-slate-600"><strong>Recommended Credit:</strong> {riskResult.recommendedCreditLimit}</div>
              <div className="text-slate-600"><strong>Action:</strong> {riskResult.recommendedAction}</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                {riskResult.observations?.map((obs, idx) => <li key={idx}>{obs}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {aiActiveTab === 'voice' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" /> Audio Operational Digest
          </h3>
          <p className="text-xs text-slate-500">Synthesize audio summary of daily sales and overdue collections with Gemini Speech.</p>
          <button
            onClick={handleGenerateDailyTts}
            disabled={ttsLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            {ttsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Synthesize Daily Speech Digest
          </button>

          {audioUrl && (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
              <div className="text-xs font-bold text-indigo-900">Audio Ready (24kHz WAV)</div>
              <button onClick={toggleAudioPlayback} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-1">
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingAudio ? 'Pause' : 'Play Digest'}
              </button>
            </div>
          )}
        </div>
      )}

      {aiActiveTab === 'apmc' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 max-w-3xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" /> Grounded APMC Mandi Search
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={apmcQuery}
              onChange={(e) => setApmcQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 border rounded-2xl text-xs focus:outline-none"
            />
            <button
              onClick={handleSearchApmc}
              disabled={apmcLoading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2"
            >
              {apmcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch Rates
            </button>
          </div>

          {apmcResult && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="font-sans whitespace-pre-wrap leading-relaxed text-slate-800">{apmcResult.text}</div>
              {apmcResult.sources?.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700">Grounding Web Sources:</div>
                  {apmcResult.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="block text-teal-600 hover:underline truncate">
                      ● {s.title} ({s.uri})
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GenericModulePage({ module, onNavigate, showToast }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${module.color} border`}>
              {React.createElement(module.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
              <p className="text-xs text-slate-500">{module.desc || 'Operational module dashboard'}</p>
            </div>
          </div>
        </div>
        <button onClick={() => showToast(`Action executed for ${module.title}`)} className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md">
          Action Menu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Active Records</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">128 Entries</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Last Synced</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">2 mins ago</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Operational Status</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">Healthy</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs text-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          {React.createElement(module.icon, { className: 'w-6 h-6' })}
        </div>
        <h3 className="font-bold text-base text-slate-900">{module.title} Workspace</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Live data feed for {module.title}. Records are automatically backed up to Sadapoorna Cloud Ledger.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSalesOps = useMemo(() => {
    if (!searchQuery.trim()) return SALES_OPERATIONS;
    return SALES_OPERATIONS.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredHrModules = useMemo(() => {
    if (!searchQuery.trim()) return HR_FLEET_MODULES;
    return HR_FLEET_MODULES.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCardClick = (item) => {
    setActiveTab(item.id);
    showToast(`Navigated to ${item.title}`);
  };

  const getModuleById = (id) => {
    return [...SALES_OPERATIONS, ...HR_FLEET_MODULES].find(m => m.id === id);
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-1.5 py-2 px-3">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Trusted partner in rice, grains, and essential commodities.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mx-auto">
                Click any module below to launch its dedicated full page workspace, powered by Sadapoorna Enterprise.
              </p>
            </div>

            <div className="max-w-2xl mx-auto relative px-1">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules (e.g. Orders, Stock, AI, Customer)..."
                  className="w-full pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-white rounded-full border border-slate-200/90 shadow-2xs hover:shadow-md text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sales Operations Section */}
            <section className="bg-white/95 backdrop-blur rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-indigo-200/60 shadow-xs relative overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 border-b border-indigo-50">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl sm:rounded-2xl border border-indigo-100">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    Customer &amp; Sales Operations
                  </h2>
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-indigo-100 shrink-0">
                  {filteredSalesOps.length} Modules
                </span>
              </div>

              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4">
                {filteredSalesOps.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center min-h-[110px] sm:min-h-[125px]"
                    >
                      {item.badge && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      <div className={`p-2.5 sm:p-3.5 rounded-2xl ${item.color} mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs border`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* HR & Fleet Section */}
            <section className="bg-white/95 backdrop-blur rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-emerald-200/60 shadow-xs relative overflow-hidden transition-all">
              <div className="flex items-center justify-between mb-4 sm:mb-6 pb-2.5 border-b border-emerald-50">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl border border-emerald-100">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                    HR, Staff &amp; Fleet Management
                  </h2>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-100 shrink-0">
                  {filteredHrModules.length} Modules
                </span>
              </div>

              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4">
                {filteredHrModules.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center min-h-[110px] sm:min-h-[125px]"
                    >
                      {item.badge && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                      <div className={`p-2.5 sm:p-3.5 rounded-2xl ${item.color} mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-2xs border`}>
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        );

      case 'add-customer':
        return <AddCustomerPage onNavigate={setActiveTab} showToast={showToast} />;
      case 'orders':
        return <OrdersPage onNavigate={setActiveTab} showToast={showToast} />;
      case 'customers':
        return <CustomersDirectoryPage onNavigate={setActiveTab} showToast={showToast} />;
      case 'inventory-stock':
      case 'stock':
        return <StockInventoryPage onNavigate={setActiveTab} showToast={showToast} />;
      case 'ai-suite':
      case 'whatsapp':
        return <AiSuitePage onNavigate={setActiveTab} showToast={showToast} />;
      default:
        const mod = getModuleById(activeTab) || { id: activeTab, title: activeTab.toUpperCase(), icon: FileText, color: 'bg-indigo-100 text-indigo-600' };
        return <GenericModulePage module={mod} onNavigate={setActiveTab} showToast={showToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans flex flex-col md:flex-row antialiased overflow-x-hidden">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between sm:justify-start gap-3 border border-slate-700 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-slate-400 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 bg-[#0C1327] text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800/80 shadow-2xl ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4 sm:p-5 flex items-center justify-between md:justify-center border-b border-slate-800/80 shrink-0">
          {!sidebarCollapsed ? (
            <div className="scale-90 origin-left md:origin-center cursor-pointer" onClick={() => setActiveTab('home')}>
              <SadapoornaLogo />
            </div>
          ) : (
            <div onClick={() => setActiveTab('home')} className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-serif text-white font-bold text-xl shadow-lg border border-red-400/30 cursor-pointer">
              S
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4 custom-scrollbar">
          {CATEGORIZED_SIDEBAR.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5 flex items-center justify-between">
                  <span>{group.category}</span>
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                      showToast(`Navigated to ${item.label}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 group ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/20 via-indigo-600/30 to-indigo-900/20 text-white border-l-4 border-red-500 shadow-md font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-red-400' : 'text-slate-400'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800/80 shrink-0 space-y-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs font-semibold transition-colors hidden md:flex"
          >
            {sidebarCollapsed ? <ChevronsRight className="w-5 h-5 text-indigo-400" /> : <><ChevronsLeft className="w-4 h-4 text-indigo-400" /><span>Collapse Sidebar</span></>}
          </button>
        </div>
      </aside>

      {/* Header and Content Area */}
      <main className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <header className={`fixed top-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xs transition-all duration-300 left-0 ${
          sidebarCollapsed ? 'md:left-20' : 'md:left-64'
        }`}>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
              <Home className="w-4 h-4 text-red-600" /> Home
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center">
            <div onClick={() => setActiveTab('home')} className="cursor-pointer">
              <SadapoornaLogo size="normal" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Admin" className="w-8 h-8 rounded-full object-cover" />
              <div className="hidden sm:block text-left pr-2">
                <div className="font-bold text-xs text-slate-900">Admin User</div>
                <div className="text-[10px] text-slate-500">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <div className="pt-20 sm:pt-24 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {renderCurrentView()}
        </div>
      </main>

    </div>
  );
}