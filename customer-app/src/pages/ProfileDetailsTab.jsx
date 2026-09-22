import React from 'react';
import { cxData } from '../data/dummyData';
import { Store, MapPin, FileText, Calendar } from 'lucide-react';

const ProfileDetailsTab = () => {
  const profile = cxData.profile;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-4">Business Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl flex items-start gap-4 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shop Name</p>
            <p className="font-bold text-slate-900">{profile.shopName}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-start gap-4 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">GSTIN</p>
            <p className="font-bold text-slate-900">{profile.gstin}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-start gap-4 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors md:col-span-2">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Address</p>
            <p className="font-bold text-slate-900 leading-relaxed">{profile.address}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-start gap-4 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors md:col-span-2">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Since</p>
            <p className="font-bold text-slate-900">{profile.joinedSince}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailsTab;
