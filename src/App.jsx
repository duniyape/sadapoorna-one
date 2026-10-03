import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ── Critical path: eager imports (no lazy) ────────────────────────────────────
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";

// ── Utility: Auto-retry lazy loaded chunks to prevent network errors ──────────
const lazyWithRetry = (componentImport, retries = 3, interval = 1000) => {
  return React.lazy(() => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const attemptImport = () => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            attempts++;
            if (attempts < retries) {
              setTimeout(attemptImport, interval);
            } else {
              reject(error);
            }
          });
      };
      attemptImport();
    });
  });
};

// ── All pages: lazy-loaded → Vite auto code-splits each into its own chunk ────
const Home                       = lazyWithRetry(() => import("./pages/Home"));
const AddCustomerPage            = lazyWithRetry(() => import("./pages/AddCustomerPage"));
const OrdersPage                 = lazyWithRetry(() => import("./pages/OrdersPage"));
const CustomersDirectoryPage     = lazyWithRetry(() => import("./pages/CustomersDirectoryPage"));
const BulkCustomerTransferPage   = lazyWithRetry(() => import("./pages/BulkCustomerTransferPage"));
const AiSuitePage                = lazyWithRetry(() => import("./pages/AiSuitePage"));
const BranchProfilePage          = lazyWithRetry(() => import("./pages/BranchProfilePage"));
const DepartmentPage             = lazyWithRetry(() => import("./pages/DepartmentPage"));
const DesignationPage            = lazyWithRetry(() => import("./pages/DesignationPage"));
const GenericModulePage          = lazyWithRetry(() => import("./pages/GenericModulePage"));
const AddProductPage             = lazyWithRetry(() => import("./pages/AddProductPage"));
const UserPage                   = lazyWithRetry(() => import("./pages/UserPage"));
const ProfilePage                = lazyWithRetry(() => import("./pages/ProfilePage"));
const AccessibilityPage          = lazyWithRetry(() => import("./pages/AccessibilityPage"));
const DataAccessPage             = lazyWithRetry(() => import("./pages/DataAccessPage"));
const ProductUnitPage            = lazyWithRetry(() => import("./pages/ProductUnitPage"));
const ProductAttributesPage      = lazyWithRetry(() => import("./pages/ProductAttributesPage"));
const PackingTypePage            = lazyWithRetry(() => import("./pages/PackingTypePage"));
const WarehousesDirectoryPage    = lazyWithRetry(() => import("./pages/WarehousesDirectoryPage"));
const WarehouseAllocationsPage   = lazyWithRetry(() => import("./pages/WarehouseAllocationsPage"));
const AddWarehousePage           = lazyWithRetry(() => import("./pages/AddWarehousePage"));
const VehiclesDirectoryPage      = lazyWithRetry(() => import("./pages/VehiclesDirectoryPage"));
const AddVehiclePage             = lazyWithRetry(() => import("./pages/AddVehiclePage"));
const VendorsDirectoryPage       = lazyWithRetry(() => import("./pages/VendorsDirectoryPage"));
const AddVendorPage              = lazyWithRetry(() => import("./pages/AddVendorPage"));
const PurchaseOrdersDirectoryPage= lazyWithRetry(() => import("./pages/PurchaseOrdersDirectoryPage"));
const AddPurchaseOrderPage       = lazyWithRetry(() => import("./pages/AddPurchaseOrderPage"));
const WarehouseInPage            = lazyWithRetry(() => import("./pages/WarehouseInPage"));
const WarehouseInventoryPage     = lazyWithRetry(() => import("./pages/WarehouseInventoryPage"));
const VehicleInPage              = lazyWithRetry(() => import("./pages/VehicleInPage"));
const AddOrderPage               = lazyWithRetry(() => import("./pages/AddOrderPage"));
const CreateReturnOrderPage      = lazyWithRetry(() => import("./pages/CreateReturnOrderPage"));
const MainInventoryPage          = lazyWithRetry(() => import("./pages/MainInventoryPage"));
const VehicleAllocationsPage     = lazyWithRetry(() => import("./pages/VehicleAllocationsPage"));
const WhatsAppChatPage           = lazyWithRetry(() => import("./pages/WhatsAppChatPage"));
const BeatManagementPage         = lazyWithRetry(() => import("./pages/BeatManagementPage"));
const AccountsMasterPage         = lazyWithRetry(() => import("./pages/AccountsMasterPage"));
const AccountingVouchersPage     = lazyWithRetry(() => import("./pages/AccountingVouchersPage"));
const AddVoucherPage             = lazyWithRetry(() => import("./pages/AddVoucherPage"));
const EmployeeCashBalancesPage   = lazyWithRetry(() => import("./pages/EmployeeCashBalancesPage"));
const ChequeManagementPage       = lazyWithRetry(() => import("./pages/ChequeManagementPage"));
const FinanceCollectionsPage     = lazyWithRetry(() => import("./pages/FinanceCollectionsPage"));
const FinanceClearancesPage      = lazyWithRetry(() => import("./pages/FinanceClearancesPage"));
const BankVerificationPage       = lazyWithRetry(() => import("./pages/BankVerificationPage"));
const CustomerKhataPage          = lazyWithRetry(() => import("./pages/CustomerKhataPage"));
const DueCollectionsPage         = lazyWithRetry(() => import("./pages/DueCollectionsPage"));
const BulkDispatchPage           = lazyWithRetry(() => import("./pages/BulkDispatchPage"));
const ManifestsPage              = lazyWithRetry(() => import("./pages/ManifestsPage"));
const ManifestDetailsPage        = lazyWithRetry(() => import("./pages/ManifestDetailsPage"));
const StockLedgerPage            = lazyWithRetry(() => import("./pages/StockLedgerPage"));
const BatchTimelinePage          = lazyWithRetry(() => import("./pages/BatchTimelinePage"));
const BatchStockPage             = lazyWithRetry(() => import("./pages/BatchStockPage"));
const AllocationsPage            = lazyWithRetry(() => import("./pages/AllocationsPage"));
const StockInwardingPage         = lazyWithRetry(() => import("./pages/StockInwardingPage"));
const LiveLocationPage           = lazyWithRetry(() => import("./pages/LiveLocationPage"));
const DeliveryMasterPage         = lazyWithRetry(() => import("./pages/DeliveryMasterPage"));

// ── Customer 360° — layout + 5 separate tab pages ────────────────────────────
const CustomerProfileLayout = lazyWithRetry(() => import("./pages/CustomerProfileLayout"));
const CustomerProfileTab    = lazyWithRetry(() => import("./pages/CustomerProfileTab"));
const CustomerOrdersTab     = lazyWithRetry(() => import("./pages/CustomerOrdersTab"));
const CustomerStatementTab  = lazyWithRetry(() => import("./pages/CustomerStatementTab"));
const CustomerKhataTab      = lazyWithRetry(() => import("./pages/CustomerKhataTab"));

// ── Route guard ───────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  console.log("[DEBUG] ProtectedRoute checked token:", token ? "FOUND" : "MISSING", "Current URL:", window.location.href);
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
                <Route path="bulk-customer-transfer" element={<BulkCustomerTransferPage />} />

                {/* Customer 360° — nested layout + tab pages */}
                <Route path="view-customer/:id"   element={<CustomerProfileLayout />}>
                  <Route index                    element={<CustomerProfileTab />} />
                  <Route path="orders"            element={<CustomerOrdersTab />} />
                  <Route path="statement"         element={<CustomerStatementTab />} />
                  <Route path="khata"             element={<CustomerKhataTab />} />
                </Route>

                {/* ── Orders ────────────────────────────────────── */}
                <Route path="orders"              element={<OrdersPage />} />
                <Route path="add-order"           element={<AddOrderPage />} />
                <Route path="edit-order/:id"      element={<AddOrderPage />} />
                <Route path="create-return-order" element={<CreateReturnOrderPage />} />
                <Route path="bulk-dispatch"       element={<BulkDispatchPage />} />
                <Route path="manifests"           element={<ManifestsPage />} />
                <Route path="manifests/:id"       element={<ManifestDetailsPage />} />

                {/* ── Inventory ─────────────────────────────────── */}
                <Route path="main-inventory"      element={<MainInventoryPage />} />
                <Route path="warehouse-in"        element={<WarehouseInPage />} />
                <Route path="warehouse-inventory" element={<WarehouseInventoryPage />} />
                <Route path="vehicle-in"          element={<VehicleInPage />} />
                <Route path="stock-inwarding"     element={<StockInwardingPage />} />
                <Route path="stock-ledger"        element={<StockLedgerPage />} />
                <Route path="vehicle-allocations/:vehicle_id" element={<VehicleAllocationsPage />} />
                <Route path="batch-timeline/:batch_no" element={<BatchTimelinePage />} />
                <Route path="batch-stock"         element={<BatchStockPage />} />
                <Route path="allocations"         element={<AllocationsPage />} />

                {/* ── Warehouses ────────────────────────────────── */}
                <Route path="warehouses"          element={<WarehousesDirectoryPage />} />
                <Route path="warehouse-allocations" element={<WarehouseAllocationsPage />} />
                <Route path="warehouse-allocations/:warehouse_id" element={<WarehouseAllocationsPage />} />
                <Route path="add-warehouse"       element={<AddWarehousePage />} />
                <Route path="edit-warehouse/:id"  element={<AddWarehousePage />} />

                {/* ── Vehicles ──────────────────────────────────── */}
                <Route path="vehicles"            element={<VehiclesDirectoryPage />} />
                <Route path="add-vehicle"         element={<AddVehiclePage />} />
                <Route path="edit-vehicle/:id"    element={<AddVehiclePage />} />
                <Route path="delivery-master"     element={<DeliveryMasterPage />} />

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
                <Route path="due-collection"      element={<DueCollectionsPage />} />
                <Route path="module/:id"          element={<GenericModulePage />} />

                {/* ── Other ─────────────────────────────────────── */}
                <Route path="ai-suite"            element={<AiSuitePage />} />
                <Route path="whatsapp"            element={<WhatsAppChatPage />} />
                <Route path="beat-mgmt"           element={<BeatManagementPage />} />
                <Route path="live-location"       element={<LiveLocationPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;