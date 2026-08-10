import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Dashboard />} />

        {/* Dashboard Page */}
        <Route path="/add" element={<AddProduct />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;