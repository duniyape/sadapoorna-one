import {
  UserPlus, ShoppingBag, Users, Wallet, FileText, Calendar, Truck,
  Receipt, CheckCircle2, ArrowRightLeft, Clock, Package, TrendingUp,
  ShieldCheck, Route as RouteIcon, Handshake, UserX, CheckSquare, Bot,
  Home, Building2, Briefcase, BadgeCheck, UserCog, FolderLock, Tags,
  ShoppingCart, BoxSelect, ArrowDownToLine, Boxes, MessageCircle,
  Layers, Landmark,
} from 'lucide-react';

/**
 * MASTER_MODULES — Single source of truth for every module in the app.
 *
 * Fields:
 *  id              — unique module identifier (matches permission icon IDs)
 *  label           — short label used in Sidebar
 *  title           — full title used in Dashboard cards
 *  icon            — Lucide icon component
 *  color           — Tailwind color classes for Dashboard card icon bg
 *  badge           — optional badge text shown on card and sidebar
 *  desc            — short description shown on Dashboard card
 *  route           — URL path; if missing, falls back to /module/:id
 *  dashboardGroup  — which section to render in on Dashboard (null = hidden from dashboard)
 *  sidebarGroup    — which sidebar category to appear in (null = hidden from sidebar)
 */
export const MASTER_MODULES = [

  // ── Main Dashboard ───────────────────────────────────────────────────────────
  {
    id: 'home',
    label: 'All Operations', title: 'All Operations',
    icon: Home, color: 'bg-slate-100 text-slate-600 border-slate-200',
    badge: null, desc: 'Main dashboard overview', route: '/',
    dashboardGroup: null, sidebarGroup: 'Main Dashboard',
  },
  {
    id: 'ai-suite',
    label: 'Sadapoorna AI Suite', title: 'AI Suite',
    icon: Bot, color: 'bg-violet-100 text-violet-600 border-violet-200',
    badge: 'Gemini', desc: 'AI-powered insights & automation', route: '/ai-suite',
    dashboardGroup: null, sidebarGroup: 'Main Dashboard',
  },

  // ── Sales & Billing ──────────────────────────────────────────────────────────
  {
    id: 'whatsapp',
    label: 'WhatsApp', title: 'WhatsApp',
    icon: MessageCircle, color: 'bg-green-100 text-green-600 border-green-200',
    badge: 'New', desc: 'WhatsApp chat integration', route: '/whatsapp',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },
  {
    id: 'add-customer',
    label: 'Create Customer', title: 'Create Customer',
    icon: UserPlus, color: 'bg-pink-100 text-pink-600 border-pink-200',
    badge: 'Hot', desc: 'Register a new customer account', route: '/add-customer',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },
  {
    id: 'customers',
    label: 'Customer List', title: 'Customers Directory',
    icon: Users, color: 'bg-orange-100 text-orange-600 border-orange-200',
    badge: null, desc: 'View complete client directory', route: '/customers',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },
  {
    id: 'orders',
    label: 'Orders & Bills', title: 'Orders & Invoices',
    icon: CheckSquare, color: 'bg-sky-100 text-sky-600 border-sky-200',
    badge: null, desc: 'Process new orders & invoices', route: '/orders',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },
  {
    id: 'due-collection',
    label: 'Due Collections', title: 'Due Collections',
    icon: Clock, color: 'bg-rose-100 text-rose-600 border-rose-200',
    badge: 'Alert', desc: 'Outstanding balances portfolio', route: '/due-collection',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },
  {
    id: 'beat-mgmt',
    label: 'Beat Management', title: 'Beat Management',
    icon: RouteIcon, color: 'bg-purple-100 text-purple-600 border-purple-200',
    badge: null, desc: 'Manage beats & routing', route: '/beat-mgmt',
    dashboardGroup: 'Sales & Billing', sidebarGroup: 'Sales & Billing',
  },

  // ── Inventory & Fleet ────────────────────────────────────────────────────────
  {
    id: 'main-inventory',
    label: 'Main Inventory', title: 'Main Inventory',
    icon: Boxes, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'New', desc: 'Consolidated inventory view', route: '/main-inventory',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },
  {
    id: 'warehouse-in',
    label: 'Warehouse In', title: 'Warehouse In',
    icon: ArrowDownToLine, color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    badge: 'New', desc: 'Inward unallocated inventory', route: '/warehouse-in',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },
  {
    id: 'warehouse-inventory',
    label: 'Warehouse Inventory', title: 'Warehouse Inventory',
    icon: Boxes, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'New', desc: 'View warehouse stock levels', route: '/warehouse-inventory',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },
  {
    id: 'vehicle-in',
    label: 'Vehicle In', title: 'Vehicle In',
    icon: ArrowRightLeft, color: 'bg-blue-100 text-blue-600 border-blue-200',
    badge: 'New', desc: 'Transfer warehouse stock to vehicle', route: '/vehicle-in',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },
  {
    id: 'vehicles',
    label: 'Vehicles & Fleet', title: 'Vehicles Directory',
    icon: Truck, color: 'bg-amber-100 text-amber-600 border-amber-200',
    badge: 'New', desc: 'Vehicles, drivers & routes', route: '/vehicles',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },
  {
    id: 'purchase-orders',
    label: 'Purchase Orders', title: 'Purchase Orders',
    icon: ShoppingCart, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'New', desc: 'Vendor orders & inventory intake', route: '/purchase-orders',
    dashboardGroup: 'Inventory & Fleet', sidebarGroup: 'Inventory & Fleet',
  },

  // ── Inventory Master ─────────────────────────────────────────────────────────
  {
    id: 'product-units',
    label: 'Product Units', title: 'Product Units',
    icon: Package, color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    badge: null, desc: 'Manage product measurement units', route: '/product-units',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },
  {
    id: 'product-attributes',
    label: 'Product Attributes', title: 'Product Attributes',
    icon: Tags, color: 'bg-sky-100 text-sky-600 border-sky-200',
    badge: 'New', desc: 'Categories, Sub-Categories, and Brands', route: '/product-attributes',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },
  {
    id: 'packing-types',
    label: 'Packing Types', title: 'Packing Types',
    icon: BoxSelect, color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
    badge: 'New', desc: 'Manage packing types for products', route: '/packing-types',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },
  {
    id: 'products',
    label: 'Products', title: 'Products',
    icon: ShoppingCart, color: 'bg-sky-100 text-sky-600 border-sky-200',
    badge: 'New', desc: 'Create products & manage variants', route: '/products',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },
  {
    id: 'warehouses',
    label: 'Warehouses', title: 'Warehouses',
    icon: Building2, color: 'bg-blue-100 text-blue-600 border-blue-200',
    badge: 'New', desc: 'Manage warehouses & storage', route: '/warehouses',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },
  {
    id: 'vendors',
    label: 'Vendors', title: 'Vendors',
    icon: Handshake, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'New', desc: 'Manage vendors & suppliers', route: '/vendors',
    dashboardGroup: 'Inventory Master', sidebarGroup: 'Inventory Master',
  },

  // ── Accounting & Finance ─────────────────────────────────────────────────────
  {
    id: 'account-master',
    label: 'Accounts Master', title: 'Accounts Master',
    icon: Layers, color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200',
    badge: 'New', desc: 'Manage accounting groups & ledgers', route: '/account-master',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'accounting-vouchers',
    label: 'Accounting Vouchers', title: 'Accounting Vouchers',
    icon: Receipt, color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    badge: 'New', desc: 'Manage accounting entries', route: '/accounting-vouchers',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'employee-cash',
    label: 'Employee Cash', title: 'Employee Cash',
    icon: Wallet, color: 'bg-amber-100 text-amber-600 border-amber-200',
    badge: 'Live', desc: 'Live cash-in-hand custody', route: '/employee-cash',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'cheque-management',
    label: 'Cheque Management', title: 'Cheque Management',
    icon: Landmark, color: 'bg-teal-100 text-teal-600 border-teal-200',
    badge: 'New', desc: 'Manage cheque lifecycle', route: '/cheque-management',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'finance-collections',
    label: 'Finance Collections', title: 'Finance Collections',
    icon: Landmark, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'Hot', desc: 'Collect NBFC/Finance payments', route: '/finance-collections',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'finance-clearances',
    label: 'Finance Clearances', title: 'Finance Clearances',
    icon: Landmark, color: 'bg-violet-100 text-violet-600 border-violet-200',
    badge: 'New', desc: 'Disburse NBFC Loans to customers', route: '/finance-clearances',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'bank-verification',
    label: 'Bank Verification', title: 'Bank Verification',
    icon: Landmark, color: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    badge: 'New', desc: 'Verify online bank transfers', route: '/bank-verification',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },
  {
    id: 'customer-khata',
    label: 'Customer Payment', title: 'Customer Payment',
    icon: Wallet, color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    badge: 'New', desc: 'Ledger & Collect Payments', route: '/customer-khata',
    dashboardGroup: 'Accounting & Finance', sidebarGroup: 'Accounting & Finance',
  },

  // ── System & HR ──────────────────────────────────────────────────────────────
  {
    id: 'branch-profile',
    label: 'Branch Profile', title: 'Branch Profile',
    icon: Building2, color: 'bg-amber-100 text-amber-600 border-amber-200',
    badge: null, desc: 'Manage company branches', route: '/branch-profile',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
  {
    id: 'department',
    label: 'Department', title: 'Department',
    icon: Briefcase, color: 'bg-orange-100 text-orange-600 border-orange-200',
    badge: null, desc: 'Organizational departments', route: '/department',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
  {
    id: 'designation',
    label: 'Designation', title: 'Designation',
    icon: BadgeCheck, color: 'bg-rose-100 text-rose-600 border-rose-200',
    badge: null, desc: 'Employee roles & designations', route: '/designation',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
  {
    id: 'users',
    label: 'Users', title: 'Users',
    icon: UserCog, color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    badge: 'New', desc: 'Create & manage staff users', route: '/users',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
  {
    id: 'accessibility',
    label: 'Accessibility', title: 'Accessibility',
    icon: ShieldCheck, color: 'bg-teal-100 text-teal-600 border-teal-200',
    badge: 'Admin', desc: 'Manage access controls', route: '/accessibility',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
  {
    id: 'data-access',
    label: 'Data Access', title: 'Data Access',
    icon: FolderLock, color: 'bg-blue-100 text-blue-600 border-blue-200',
    badge: 'New', desc: 'Manage reporting hierarchy', route: '/data-access',
    dashboardGroup: 'System & HR', sidebarGroup: 'System & HR',
  },
];

/** Helper: Get modules for a specific dashboard group */
export const getModulesForDashboard = (group) =>
  MASTER_MODULES.filter((m) => m.dashboardGroup === group);

/** Helper: Get modules for a specific sidebar group */
export const getModulesForSidebar = (group) =>
  MASTER_MODULES.filter((m) => m.sidebarGroup === group);

/** All unique sidebar categories in order */
export const SIDEBAR_GROUPS = [
  'Main Dashboard',
  'Sales & Billing',
  'Inventory & Fleet',
  'Inventory Master',
  'Accounting & Finance',
  'System & HR',
];

/** All unique dashboard sections in order */
export const DASHBOARD_GROUPS = [
  'Sales & Billing',
  'Inventory & Fleet',
  'Accounting & Finance',
  'Inventory Master',
  'System & HR',
];
