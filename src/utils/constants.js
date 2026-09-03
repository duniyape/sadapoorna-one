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
  Building2,
  Briefcase,
  BadgeCheck,
  UserCog,
  FolderLock,
  Tags,
  Tag,
  ShoppingCart,
  BoxSelect,
  ArrowDownToLine,
  Boxes,
  MessageCircle,
} from 'lucide-react';

export const SALES_OPERATIONS = [
  { id: 'add-customer', title: 'Create Customer', icon: UserPlus, color: 'bg-pink-100 text-pink-600 border-pink-200', badge: 'Hot', desc: 'Register a new customer account', key: ['Assignment'] },
  { id: 'customers', title: 'Customers Directory', icon: Users, color: 'bg-orange-100 text-orange-600 border-orange-200', badge: null, desc: 'View complete client directory', key: ['Edit', 'View', 'Phone', 'Branch Filter', 'Employee Filter'] },
  { id: 'orders', title: 'Orders & Invoices', icon: CheckSquare, color: 'bg-sky-100 text-sky-600 border-sky-200', badge: '12 New', desc: 'Process new orders & invoices', key: ['Edit', 'View', 'Confirm', 'Pack', 'Dispatch', 'Deliver'] }
];

export const HR_FLEET_MODULES = [
  { id: 'vehicles', title: 'Vehicles Directory', icon: Truck, color: 'bg-amber-100 text-amber-600 border-amber-200', badge: 'New', desc: 'Vehicles, drivers & routes', route: '/vehicles' },
  { id: 'inventory-stock', title: 'Stock Inventory', icon: Package, color: 'bg-teal-100 text-teal-600 border-teal-200', badge: null, desc: 'Warehouse inventory count' },
  { id: 'main-inventory', title: 'Main Inventory', icon: Boxes, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: 'New', desc: 'Consolidated inventory view', route: '/main-inventory' },
  { id: 'warehouse-in', title: 'Warehouse In', icon: ArrowDownToLine, color: 'bg-emerald-100 text-emerald-600 border-emerald-200', badge: 'New', desc: 'Inward unallocated inventory', route: '/warehouse-in' },
  { id: 'warehouse-inventory', title: 'Warehouse Inventory', icon: Boxes, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: 'New', desc: 'View warehouse stock levels', route: '/warehouse-inventory' },
  { id: 'vehicle-in', title: 'Vehicle In', icon: ArrowRightLeft, color: 'bg-blue-100 text-blue-600 border-blue-200', badge: 'New', desc: 'Transfer warehouse stock to vehicle', route: '/vehicle-in' },
  { id: 'purchase-orders', title: 'Purchase Orders', icon: ShoppingCart, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: 'New', desc: 'Vendor orders & inventory intake', route: '/purchase-orders' },
];

export const MASTER_MODULES = [
  { id: 'branch-profile', title: 'Branch Profile', icon: Building2, color: 'bg-amber-100 text-amber-600 border-amber-200', badge: null, desc: 'Manage company branches' },
  { id: 'department', title: 'Department', icon: Briefcase, color: 'bg-orange-100 text-orange-600 border-orange-200', badge: null, desc: 'Organizational departments' },
  { id: 'designation', title: 'Designation', icon: BadgeCheck, color: 'bg-rose-100 text-rose-600 border-rose-200', badge: null, desc: 'Employee roles & designations' },
  { id: 'users', title: 'Users', icon: UserCog, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: 'New', desc: 'Create & manage staff users', key: ['Create', 'Edit', 'View'] },
  { id: 'accessibility', title: 'Accessibility', icon: ShieldCheck, color: 'bg-teal-100 text-teal-600 border-teal-200', badge: 'Admin', desc: 'Manage access controls' },
  { id: 'data-access', title: 'Data Access', icon: FolderLock, color: 'bg-blue-100 text-blue-600 border-blue-200', badge: 'New', desc: 'Manage reporting hierarchy', route: '/data-access' },
  { id: 'product-units', title: 'Product Units', icon: Package, color: 'bg-emerald-100 text-emerald-600 border-emerald-200', desc: 'Manage product measurement units', route: '/product-units' },
  { id: 'product-attributes', title: 'Product Attributes', icon: Tags, badge: 'New', desc: 'Categories, Sub-Categories, and Brands', route: '/product-attributes' },
  { id: 'packing-types', title: 'Packing Types', icon: BoxSelect, color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200', badge: 'New', desc: 'Manage packing types for products', route: '/packing-types' },
  { id: 'products', title: 'Products', icon: ShoppingCart, color: 'bg-sky-100 text-sky-600 border-sky-200', badge: 'New', desc: 'Create products & manage variants', route: '/products' },
  { id: 'warehouses', title: 'Warehouses', icon: Building2, color: 'bg-blue-100 text-blue-600 border-blue-200', badge: 'New', desc: 'Manage warehouses & storage', route: '/warehouses' },
  { id: 'vendors', title: 'Vendors', icon: Handshake, color: 'bg-indigo-100 text-indigo-600 border-indigo-200', badge: 'New', desc: 'Manage vendors & suppliers', route: '/vendors' },
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
      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, badge: 'New', route: '/whatsapp' },
      { id: 'add-customer', label: 'Create Customer', icon: UserPlus, badge: 'New', route: '/add-customer' },
      { id: 'orders', label: 'Orders & Bills', icon: ShoppingBag, badge: '12', route: '/orders' },
      { id: 'customers', label: 'Customer List', icon: Users, route: '/customers' },
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
      { id: 'main-inventory', label: 'Main Inventory', icon: Boxes, badge: 'New', route: '/main-inventory' },
      { id: 'warehouse-in', label: 'Warehouse In', icon: ArrowDownToLine, badge: 'New', route: '/warehouse-in' },
      { id: 'warehouse-inventory', label: 'Warehouse Inventory', icon: Boxes, badge: 'New', route: '/warehouse-inventory' },
      { id: 'vehicle-in', label: 'Vehicle In', icon: ArrowRightLeft, badge: 'New', route: '/vehicle-in' },
      { id: 'staff', label: 'Staff Directory', icon: Users, route: '/module/staff' },
      { id: 'leave-mgmt', label: 'Leave Requests', icon: Calendar, route: '/module/leave-mgmt' },
      { id: 'vehicles', label: 'Vehicles & Fleet', icon: Truck, badge: 'New', route: '/vehicles' },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, badge: 'New', route: '/purchase-orders' },
      { id: 'reports', label: 'Financial Audit', icon: TrendingUp, route: '/module/reports' },
    ]
  },
  {
    category: 'Master Configuration',
    items: [
      { id: 'branch-profile', label: 'Branch Profile', icon: Building2, route: '/branch-profile' },
      { id: 'department', label: 'Department', icon: Briefcase, route: '/department' },
      { id: 'designation', label: 'Designation', icon: BadgeCheck, route: '/designation' },
      { id: 'users', label: 'Users', icon: UserCog, badge: 'New', route: '/users' },
      { id: 'accessibility', label: 'Accessibility', icon: ShieldCheck, route: '/accessibility' },
      { id: 'data-access', label: 'Data Access', icon: FolderLock, badge: 'New', route: '/data-access' },
      { id: 'product-units', label: 'Product Units', icon: Package, route: '/product-units' },
      { id: 'product-attributes', label: 'Product Attributes', icon: Tags, badge: 'New', route: '/product-attributes' },
      { id: 'packing-types', label: 'Packing Types', icon: BoxSelect, badge: 'New', route: '/packing-types' },
      { id: 'products', label: 'Products', icon: ShoppingCart, badge: 'New', route: '/products' },
      { id: 'warehouses', label: 'Warehouses', icon: Building2, badge: 'New', route: '/warehouses' },
      { id: 'vendors', label: 'Vendors', icon: Handshake, badge: 'New', route: '/vendors' },
    ]
  }
];
