import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import AddCustomerPage from "./pages/AddCustomerPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersDirectoryPage from "./pages/CustomersDirectoryPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import StockInventoryPage from "./pages/StockInventoryPage";
import AiSuitePage from "./pages/AiSuitePage";
import BranchProfilePage from "./pages/BranchProfilePage";
import DepartmentPage from "./pages/DepartmentPage";
import DesignationPage from "./pages/DesignationPage";
import GenericModulePage from "./pages/GenericModulePage";
import AddProductPage from "./pages/AddProductPage";
import UserPage from "./pages/UserPage";
import ProfilePage from "./pages/ProfilePage";
import AccessibilityPage from "./pages/AccessibilityPage";
import DataAccessPage from "./pages/DataAccessPage";
import ProductUnitPage from "./pages/ProductUnitPage";
import ProductAttributesPage from "./pages/ProductAttributesPage";
import PackingTypePage from "./pages/PackingTypePage";
import WarehousesDirectoryPage from "./pages/WarehousesDirectoryPage";
import AddWarehousePage from "./pages/AddWarehousePage";
import VehiclesDirectoryPage from "./pages/VehiclesDirectoryPage";
import AddVehiclePage from "./pages/AddVehiclePage";
import VendorsDirectoryPage from "./pages/VendorsDirectoryPage";
import AddVendorPage from "./pages/AddVendorPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="add-customer" element={<AddCustomerPage />} />
          <Route path="edit-customer/:id" element={<AddCustomerPage />} />
          <Route path="view-customer/:id" element={<CustomerProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersDirectoryPage />} />
          <Route path="warehouses" element={<WarehousesDirectoryPage />} />
          <Route path="add-warehouse" element={<AddWarehousePage />} />
          <Route path="edit-warehouse/:id" element={<AddWarehousePage />} />
          <Route path="vehicles" element={<VehiclesDirectoryPage />} />
          <Route path="add-vehicle" element={<AddVehiclePage />} />
          <Route path="edit-vehicle/:id" element={<AddVehiclePage />} />
          <Route path="vendors" element={<VendorsDirectoryPage />} />
          <Route path="add-vendor" element={<AddVendorPage />} />
          <Route path="edit-vendor/:id" element={<AddVendorPage />} />
          <Route path="inventory-stock" element={<StockInventoryPage />} />
          <Route path="ai-suite" element={<AiSuitePage />} />
          <Route path="branch-profile" element={<BranchProfilePage />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="designation" element={<DesignationPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="accessibility" element={<AccessibilityPage />} />
          <Route path="data-access" element={<DataAccessPage />} />
          <Route path="product-units" element={<ProductUnitPage />} />
          <Route path="product-attributes" element={<ProductAttributesPage />} />
          <Route path="packing-types" element={<PackingTypePage />} />
          <Route path="products" element={<AddProductPage />} />
          <Route path="add-product" element={<AddProductPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="module/:id" element={<GenericModulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;