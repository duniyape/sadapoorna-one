import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
const Layout = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFC] font-sans">
      {/* Main Content Area */}
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
