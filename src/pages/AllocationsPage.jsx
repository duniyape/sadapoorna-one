import React, { useState } from 'react';
import { Layers, Building2, Truck, Activity } from 'lucide-react';

// Import the existing pages to render them in tabs
import StockLedgerPage from './StockLedgerPage';
import WarehouseAllocationsPage from './WarehouseAllocationsPage';
import VehicleAllocationsPage from './VehicleAllocationsPage';

export default function AllocationsPage() {
  const [activeTab, setActiveTab] = useState('stock-ledger');

  const tabs = [
    { id: 'stock-ledger', label: 'Stock Ledger', icon: Activity },
    { id: 'warehouse-allocations', label: 'Warehouse Allocations', icon: Building2 },
    { id: 'vehicle-allocations', label: 'Vehicle Allocations', icon: Truck },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Allocations & Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Manage stock tracking and allocations centrally</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'stock-ledger' && <StockLedgerPage />}
        {activeTab === 'warehouse-allocations' && <WarehouseAllocationsPage />}
        {activeTab === 'vehicle-allocations' && <VehicleAllocationsPage />}
      </div>
    </div>
  );
}
