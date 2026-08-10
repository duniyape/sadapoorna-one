import {
  UserPlus,
  ShoppingBag,
  Users,
  Wallet,
  FileText,
  Calendar,
  Truck,
  Fuel,
  Receipt,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  MapPin,
  ShieldCheck,
  BarChart2,
  Route as RouteIcon,
  Handshake,
  UserX,
  CheckSquare,
  Bot,
  Home,
} from 'lucide-react';

export const SALES_OPERATIONS = [
  { id: 'add-customer', title: 'Add Customer', icon: UserPlus, color: 'bg-pink-100 text-pink-600 border-pink-200', badge: 'Hot', desc: 'Register a new customer account' },
  { id: 'beat-mgmt', title: 'Beat Management', icon: RouteIcon, color: 'bg-amber-100 text-amber-600 border-amber-200', badge: null, desc: 'Manage sales beats and territories' },
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

export const HR_FLEET_MODULES = [
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

export const CATEGORIZED_SIDEBAR = [
  {
    category: 'Main Dashboard',
    items: [
      { id: 'home', label: 'All Operations', icon: Home, route: '/' },
      { id: 'ai-suite', label: 'Sadapoorna AI Suite', icon: Bot, badge: 'Gemini', route: '/ai-suite' }
    ]
  },
  {
    category: 'Sales & Billing',
    items: [
      { id: 'add-customer', label: 'Add Customer', icon: UserPlus, badge: 'New', route: '/add-customer' },
      { id: 'orders', label: 'Orders & Bills', icon: ShoppingBag, badge: '12', route: '/orders' },
      { id: 'customers', label: 'Customer Directory', icon: Users, route: '/customers' },
      { id: 'collection', label: 'Cash Collection', icon: Wallet, route: '/module/collection' },
      { id: 'due-collection', label: 'Due Collections', icon: Clock, badge: 'Alert', route: '/module/due-collection' },
      { id: 'credit-approval', label: 'Credit Approvals', icon: ShieldCheck, badge: '3', route: '/module/credit-approval' },
      { id: 'beat-mgmt', label: 'Beat Management', icon: RouteIcon, route: '/module/beat-mgmt' },
      { id: 'inactive-customers', label: 'Inactive Clients', icon: UserX, route: '/module/inactive-customers' },
    ]
  },
  {
    category: 'Inventory & HR Fleet',
    items: [
      { id: 'inventory-stock', label: 'Stock Inventory', icon: Package, route: '/inventory-stock' },
      { id: 'staff', label: 'Staff Directory', icon: Users, route: '/module/staff' },
      { id: 'leave-mgmt', label: 'Leave Requests', icon: Calendar, route: '/module/leave-mgmt' },
      { id: 'fleet-mgmt', label: 'Fleet & Vehicles', icon: Truck, route: '/module/fleet-mgmt' },
      { id: 'reports', label: 'Financial Audit', icon: TrendingUp, route: '/module/reports' },
    ]
  }
];
