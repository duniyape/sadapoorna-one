import React, { useState } from 'react';
import { ArrowLeft, Layers, FileText, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AccountsGroupsPage from './AccountsGroupsPage';
import AccountsSubgroupsPage from './AccountsSubgroupsPage';
import AccountsLedgersPage from './AccountsLedgersPage';

export default function AccountsMasterPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('groups');

  const tabs = [
    { id: 'groups', label: 'Account Groups', icon: Layers },
    { id: 'subgroups', label: 'Subgroups', icon: FileText },
    { id: 'ledgers', label: 'Ledgers', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Accounts Master</h1>
            <p className="text-xs text-slate-500">Manage all accounting classifications and ledgers</p>
          </div>
        </div>
      </div>

      {/* Tabs / Pills */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap sm:flex-nowrap gap-1 w-full sm:w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'groups' && <AccountsGroupsPage isComponent={true} />}
        {activeTab === 'subgroups' && <AccountsSubgroupsPage isComponent={true} />}
        {activeTab === 'ledgers' && <AccountsLedgersPage isComponent={true} />}
      </div>
    </div>
  );
}
