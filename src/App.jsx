import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import AddCustomerPage from "./pages/AddCustomerPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersDirectoryPage from "./pages/CustomersDirectoryPage";
import StockInventoryPage from "./pages/StockInventoryPage";
import AiSuitePage from "./pages/AiSuitePage";
import GenericModulePage from "./pages/GenericModulePage";
import AddProduct from "./pages/AddProduct";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="add-customer" element={<AddCustomerPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersDirectoryPage />} />
          <Route path="inventory-stock" element={<StockInventoryPage />} />
          <Route path="ai-suite" element={<AiSuitePage />} />
          <Route path="module/:id" element={<GenericModulePage />} />
        </Route>
        
        {/* Legacy route */}
        <Route path="/add" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;