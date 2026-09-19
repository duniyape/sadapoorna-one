import React, { useState } from 'react';
import { ArrowDownToLine, ArrowRightLeft, Building2, Truck } from 'lucide-react';

import WarehouseInPage from './WarehouseInPage';
import VehicleInPage from './VehicleInPage';

export default function StockInwardingPage() {
  const [activeTab, setActiveTab] = useState('warehouse-in');

  const tabs = [
    { id: 'warehouse-in', label: 'Warehouse In', icon: Building2 },
    { id: 'vehicle-in', label: 'Vehicle In', icon: Truck },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Inwarding & Transfers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage stock entering warehouses and vehicles</p>
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
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'warehouse-in' && <WarehouseInPage />}
        {activeTab === 'vehicle-in' && <VehicleInPage />}
      </div>
    </div>
  );
}
