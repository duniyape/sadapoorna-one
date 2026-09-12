import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ── Critical path: eager imports (no lazy) ────────────────────────────────────
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";

// ── All pages: lazy-loaded → Vite auto code-splits each into its own chunk ────
const Home                       = React.lazy(() => import("./pages/Home"));
const AddCustomerPage            = React.lazy(() => import("./pages/AddCustomerPage"));
const OrdersPage                 = React.lazy(() => import("./pages/OrdersPage"));
const CustomersDirectoryPage     = React.lazy(() => import("./pages/CustomersDirectoryPage"));
const StockInventoryPage         = React.lazy(() => import("./pages/StockInventoryPage"));
const AiSuitePage                = React.lazy(() => import("./pages/AiSuitePage"));
const BranchProfilePage          = React.lazy(() => import("./pages/BranchProfilePage"));
const DepartmentPage             = React.lazy(() => import("./pages/DepartmentPage"));
const DesignationPage            = React.lazy(() => import("./pages/DesignationPage"));
const GenericModulePage          = React.lazy(() => import("./pages/GenericModulePage"));
const AddProductPage             = React.lazy(() => import("./pages/AddProductPage"));
const UserPage                   = React.lazy(() => import("./pages/UserPage"));
const ProfilePage                = React.lazy(() => import("./pages/ProfilePage"));
const AccessibilityPage          = React.lazy(() => import("./pages/AccessibilityPage"));
const DataAccessPage             = React.lazy(() => import("./pages/DataAccessPage"));
const ProductUnitPage            = React.lazy(() => import("./pages/ProductUnitPage"));
const ProductAttributesPage      = React.lazy(() => import("./pages/ProductAttributesPage"));
const PackingTypePage            = React.lazy(() => import("./pages/PackingTypePage"));
const WarehousesDirectoryPage    = React.lazy(() => import("./pages/WarehousesDirectoryPage"));
const AddWarehousePage           = React.lazy(() => import("./pages/AddWarehousePage"));
const VehiclesDirectoryPage      = React.lazy(() => import("./pages/VehiclesDirectoryPage"));
const AddVehiclePage             = React.lazy(() => import("./pages/AddVehiclePage"));
const VendorsDirectoryPage       = React.lazy(() => import("./pages/VendorsDirectoryPage"));
const AddVendorPage              = React.lazy(() => import("./pages/AddVendorPage"));
const PurchaseOrdersDirectoryPage= React.lazy(() => import("./pages/PurchaseOrdersDirectoryPage"));
const AddPurchaseOrderPage       = React.lazy(() => import("./pages/AddPurchaseOrderPage"));
const WarehouseInPage            = React.lazy(() => import("./pages/WarehouseInPage"));
const WarehouseInventoryPage     = React.lazy(() => import("./pages/WarehouseInventoryPage"));
const VehicleInPage              = React.lazy(() => import("./pages/VehicleInPage"));
const AddOrderPage               = React.lazy(() => import("./pages/AddOrderPage"));
const CreateReturnOrderPage      = React.lazy(() => import("./pages/CreateReturnOrderPage"));
const MainInventoryPage          = React.lazy(() => import("./pages/MainInventoryPage"));
const WhatsAppChatPage           = React.lazy(() => import("./pages/WhatsAppChatPage"));
const BeatManagementPage         = React.lazy(() => import("./pages/BeatManagementPage"));
const AccountsMasterPage         = React.lazy(() => import("./pages/AccountsMasterPage"));
const AccountingVouchersPage     = React.lazy(() => import("./pages/AccountingVouchersPage"));
const AddVoucherPage             = React.lazy(() => import("./pages/AddVoucherPage"));
const EmployeeCashBalancesPage   = React.lazy(() => import("./pages/EmployeeCashBalancesPage"));
const ChequeManagementPage       = React.lazy(() => import("./pages/ChequeManagementPage"));
const FinanceCollectionsPage     = React.lazy(() => import("./pages/FinanceCollectionsPage"));
const FinanceClearancesPage      = React.lazy(() => import("./pages/FinanceClearancesPage"));
const BankVerificationPage       = React.lazy(() => import("./pages/BankVerificationPage"));
const CustomerKhataPage          = React.lazy(() => import("./pages/CustomerKhataPage"));

// ── Customer 360° — layout + 5 separate tab pages ────────────────────────────
const CustomerProfileLayout = React.lazy(() => import("./pages/CustomerProfileLayout"));
const CustomerProfileTab    = React.lazy(() => import("./pages/CustomerProfileTab"));
const CustomerOrdersTab     = React.lazy(() => import("./pages/CustomerOrdersTab"));
const CustomerAgingTab      = React.lazy(() => import("./pages/CustomerAgingTab"));
const CustomerStatementTab  = React.lazy(() => import("./pages/CustomerStatementTab"));
const CustomerReceiptTab    = React.lazy(() => import("./pages/CustomerReceiptTab"));

// ── Route guard ───────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};



// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          </ErrorBoundary>
        }
      >
        {/* All lazy pages are direct children, Suspense is moved to the Layout */}
        <Route index element={<Home />} />

                {/* ── Customers ─────────────────────────────────── */}
                <Route path="customers"           element={<CustomersDirectoryPage />} />
                <Route path="add-customer"        element={<AddCustomerPage />} />
                <Route path="edit-customer/:id"   element={<AddCustomerPage />} />

                {/* Customer 360° — nested layout + tab pages */}
                <Route path="view-customer/:id"   element={<CustomerProfileLayout />}>
                  <Route index                    element={<CustomerProfileTab />} />
                  <Route path="orders"            element={<CustomerOrdersTab />} />
                  <Route path="aging"             element={<CustomerAgingTab />} />
                  <Route path="statement"         element={<CustomerStatementTab />} />
                  <Route path="receipt"           element={<CustomerReceiptTab />} />
                </Route>

                {/* ── Orders ────────────────────────────────────── */}
                <Route path="orders"              element={<OrdersPage />} />
                <Route path="add-order"           element={<AddOrderPage />} />
                <Route path="edit-order/:id"      element={<AddOrderPage />} />
                <Route path="create-return-order" element={<CreateReturnOrderPage />} />

                {/* ── Inventory ─────────────────────────────────── */}
                <Route path="inventory-stock"     element={<StockInventoryPage />} />
                <Route path="main-inventory"      element={<MainInventoryPage />} />
                <Route path="warehouse-in"        element={<WarehouseInPage />} />
                <Route path="warehouse-inventory" element={<WarehouseInventoryPage />} />
                <Route path="vehicle-in"          element={<VehicleInPage />} />

                {/* ── Warehouses ────────────────────────────────── */}
                <Route path="warehouses"          element={<WarehousesDirectoryPage />} />
                <Route path="add-warehouse"       element={<AddWarehousePage />} />
                <Route path="edit-warehouse/:id"  element={<AddWarehousePage />} />

                {/* ── Vehicles ──────────────────────────────────── */}
                <Route path="vehicles"            element={<VehiclesDirectoryPage />} />
                <Route path="add-vehicle"         element={<AddVehiclePage />} />
                <Route path="edit-vehicle/:id"    element={<AddVehiclePage />} />

                {/* ── Vendors ───────────────────────────────────── */}
                <Route path="vendors"             element={<VendorsDirectoryPage />} />
                <Route path="add-vendor"          element={<AddVendorPage />} />
                <Route path="edit-vendor/:id"     element={<AddVendorPage />} />

                {/* ── Purchase Orders ───────────────────────────── */}
                <Route path="purchase-orders"            element={<PurchaseOrdersDirectoryPage />} />
                <Route path="add-purchase-order"         element={<AddPurchaseOrderPage />} />
                <Route path="edit-purchase-order/:id"    element={<AddPurchaseOrderPage />} />

                {/* ── Products ──────────────────────────────────── */}
                <Route path="products"            element={<AddProductPage />} />
                <Route path="add-product"         element={<AddProductPage />} />

                {/* ── Settings / Admin ──────────────────────────── */}
                <Route path="profile"             element={<ProfilePage />} />
                <Route path="users"               element={<UserPage />} />
                <Route path="accessibility"       element={<AccessibilityPage />} />
                <Route path="data-access"         element={<DataAccessPage />} />
                <Route path="product-units"       element={<ProductUnitPage />} />
                <Route path="product-attributes"  element={<ProductAttributesPage />} />
                <Route path="packing-types"       element={<PackingTypePage />} />
                <Route path="department"          element={<DepartmentPage />} />
                <Route path="designation"         element={<DesignationPage />} />
                <Route path="branch-profile"      element={<BranchProfilePage />} />
                <Route path="account-master"      element={<AccountsMasterPage />} />
                <Route path="accounting-vouchers" element={<AccountingVouchersPage />} />
                <Route path="add-voucher"         element={<AddVoucherPage />} />
                <Route path="employee-cash"       element={<EmployeeCashBalancesPage />} />
                <Route path="cheque-management"   element={<ChequeManagementPage />} />
                <Route path="finance-collections" element={<FinanceCollectionsPage />} />
                <Route path="finance-clearances"  element={<FinanceClearancesPage />} />
                <Route path="bank-verification"   element={<BankVerificationPage />} />
                <Route path="customer-khata"      element={<CustomerKhataPage />} />
                <Route path="module/:id"          element={<GenericModulePage />} />

                {/* ── Other ─────────────────────────────────────── */}
                <Route path="ai-suite"            element={<AiSuitePage />} />
                <Route path="whatsapp"            element={<WhatsAppChatPage />} />
                <Route path="beat-mgmt"           element={<BeatManagementPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;