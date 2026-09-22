import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import OrderHistory from './pages/OrderHistory';
import PaymentHistory from './pages/PaymentHistory';
import ProfilePage from './pages/ProfilePage';
import ProfileDetailsTab from './pages/ProfileDetailsTab';
import OrderDetailsPage from './pages/OrderDetailsPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import CartPage from './pages/CartPage';
import Layout from './components/Layout';
import { CustomerProfileProvider } from './context/CustomerProfileContext';

function App() {
  // Check localStorage for existing token on first load
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("customer_token")
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_data");
    setIsAuthenticated(false);
  };

  return (
    <CustomerProfileProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} 
          />
          
          {/* Protected Routes */}
          <Route element={isAuthenticated ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order/:id" element={<OrderDetailsPage />} />
            <Route path="/statement" element={<PaymentHistory />} />
            <Route path="/customer-details" element={<CustomerDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />}>
              <Route index element={<ProfileDetailsTab />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="payments" element={<PaymentHistory />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </CustomerProfileProvider>
  );
}

export default App;

