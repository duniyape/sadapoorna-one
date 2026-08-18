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
import AddProduct from "./pages/AddProduct";
import UserPage from "./pages/UserPage";
import ProfilePage from "./pages/ProfilePage";
import AccessibilityPage from "./pages/AccessibilityPage";
import DataAccessPage from "./pages/DataAccessPage";

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
          <Route path="inventory-stock" element={<StockInventoryPage />} />
          <Route path="ai-suite" element={<AiSuitePage />} />
          <Route path="branch-profile" element={<BranchProfilePage />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="designation" element={<DesignationPage />} />
          <Route path="users" element={<UserPage />} />
          <Route path="accessibility" element={<AccessibilityPage />} />
          <Route path="data-access" element={<DataAccessPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="module/:id" element={<GenericModulePage />} />
        </Route>
        
        {/* Legacy route */}
        <Route path="/add" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;