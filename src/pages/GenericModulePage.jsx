import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { SALES_OPERATIONS, HR_FLEET_MODULES } from '../utils/constants';

export default function GenericModulePage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const { id } = useParams();

  const getModuleById = (moduleId) => {
    return [...SALES_OPERATIONS, ...HR_FLEET_MODULES].find(m => m.id === moduleId);
  };

  const mod = getModuleById(id) || { id: id, title: id.toUpperCase(), icon: FileText, color: 'bg-indigo-100 text-indigo-600' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${mod.color} border`}>
              {React.createElement(mod.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{mod.title}</h1>
              <p className="text-xs text-slate-500">{mod.desc || 'Operational module dashboard'}</p>
            </div>
          </div>
        </div>
        <button onClick={() => showToast(`Action executed for ${mod.title}`)} className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md">
          Action Menu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Active Records</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">128 Entries</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Last Synced</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">2 mins ago</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500">Operational Status</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">Healthy</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs text-center py-12 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          {React.createElement(mod.icon, { className: 'w-6 h-6' })}
        </div>
        <h3 className="font-bold text-base text-slate-900">{mod.title} Workspace</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Live data feed for {mod.title}. Records are automatically backed up to Sadapoorna Cloud Ledger.
        </p>
      </div>
    </div>
  );
}
