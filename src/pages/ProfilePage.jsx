import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building2, Briefcase, MapPin, CreditCard, FileText, ArrowLeft, Loader2, Calendar, Map, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await fetch('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data.data || data);
        } else if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else {
          setError('Failed to load profile details');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-slate-900 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">Loading Profile</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-5">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <p className="text-sm font-medium text-slate-500">{error || 'Profile not found'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-semibold hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 pb-20 px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 rounded-full bg-white border border-slate-200/60 hover:bg-slate-50 text-slate-600 shadow-sm hover:shadow transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Account Overview</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
        
        {/* Profile Header section */}
        <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-slate-100/50">
          <div className="relative group shrink-0">
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name} className="w-32 h-32 rounded-full object-cover shadow-xl shadow-slate-200/50 ring-4 ring-white" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center text-white font-light text-5xl shadow-xl shadow-slate-200/50 ring-4 ring-white">
                {(user.name || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full p-1 shadow-sm">
              <div className={`w-full h-full rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>
          
          <div className="text-center sm:text-left pt-2 flex-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-sm font-medium text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-2">
              <span>{user.designation?.name || user.role || 'Staff'}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{user.department?.name || 'General'}</span>
            </p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email || 'No email'}
              </div>
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user.mobile || 'No mobile'}
              </div>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="p-8 sm:p-12 space-y-12">
          
          {/* Work & Employment */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <Briefcase className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Employment Details</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <InfoItem label="Employee ID" value={user.employee_id} />
              <InfoItem label="Branch" value={user.branch?.name} />
              <InfoItem label="Joining Date" value={user.joining_date} />
              <InfoItem label="Emp. Type" value={user.employment_type?.replace('_', ' ')} capitalize />
            </div>
          </div>

          <hr className="border-slate-100/60" />

          {/* Personal Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <InfoItem label="Gender" value={user.gender} capitalize />
              <InfoItem label="Date of Birth" value={user.date_of_birth} />
              <InfoItem label="Emergency Contact" value={user.emergency_contact} />
              <InfoItem label="Status" value={user.status} capitalize />
            </div>
            
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/60 flex items-start gap-4">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Residential Address</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {[user.address, user.city, user.state, user.pincode].filter(Boolean).join(', ') || 'Address not provided'}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100/60" />

          {/* Banking & Documents */}
          <div className="grid sm:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Banking</h3>
              </div>
              <div className="space-y-5">
                <InfoRow label="Bank Name" value={user.bank_name} />
                <InfoRow label="Account Number" value={user.account_number} />
                <InfoRow label="IFSC Code" value={user.ifsc_code} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <FileText className="w-4 h-4 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">KYC Documents</h3>
              </div>
              <div className="space-y-5">
                <InfoRow label="Aadhaar No." value={user.aadhaar_number} />
                <InfoRow label="PAN No." value={user.pan_number} />
                <InfoRow label="License No." value={user.driving_license_number} />
              </div>
            </div>
          </div>

          {/* Visual Documents */}
          {(user.aadhaar_document || user.pan_document || user.driving_license_document) && (
            <>
              <hr className="border-slate-100/60" />
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Document Scans</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: 'Aadhaar Card', url: user.aadhaar_document },
                    { label: 'PAN Card', url: user.pan_document },
                    { label: 'Driving License', url: user.driving_license_document }
                  ].filter(d => d.url).map(doc => (
                    <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer" className="group block">
                      <div className="aspect-[4/3] rounded-2xl bg-slate-50 border border-slate-200/60 overflow-hidden relative mb-3">
                        <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div className="absolute inset-0 hidden flex-col items-center justify-center text-slate-400 bg-slate-50">
                          <FileText className="w-6 h-6 mb-2 text-slate-300" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">File</span>
                        </div>
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 text-center">{doc.label}</p>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      <p className={`text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}>
        {value || '-'}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-end border-b border-slate-100/80 pb-2">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value || '-'}</span>
    </div>
  );
}
