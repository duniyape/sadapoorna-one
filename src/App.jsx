import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Home";
import AddCustomerPage from "./pages/AddCustomerPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersDirectoryPage from "./pages/CustomersDirectoryPage";
import StockInventoryPage from "./pages/StockInventoryPage";
import AiSuitePage from "./pages/AiSuitePage";
import BranchProfilePage from "./pages/BranchProfilePage";
import DepartmentPage from "./pages/DepartmentPage";
import GenericModulePage from "./pages/GenericModulePage";
import AddProduct from "./pages/AddProduct";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="add-customer" element={<AddCustomerPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersDirectoryPage />} />
          <Route path="inventory-stock" element={<StockInventoryPage />} />
          <Route path="ai-suite" element={<AiSuitePage />} />
          <Route path="branch-profile" element={<BranchProfilePage />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="module/:id" element={<GenericModulePage />} />
        </Route>
        
        {/* Legacy route */}
        <Route path="/add" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;