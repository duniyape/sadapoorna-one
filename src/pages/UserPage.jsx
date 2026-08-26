import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Briefcase,
  Building2, DollarSign, CreditCard, FileText, Shield, Search,
  Save, Edit2, Eye, X, ChevronDown, Users, Hash, Camera, Lock
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

const EMPTY_FORM = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  profile_photo: '',
  gender: '',
  date_of_birth: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  department: '',
  designation: '',
  joining_date: '',
  employment_type: '',
  branch: '',
  salary: '',
  salary_type: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  aadhaar_document: '',
  pan_document: '',
  driving_license_document: '',
  aadhaar_number: '',
  pan_number: '',
  driving_license_number: '',
  emergency_contact: '',
  role: 'staff',
  status: 'active',
};

const SECTION_STYLE = 'border border-slate-100 rounded-xl p-3 space-y-3 bg-slate-50/40';
const SECTION_TITLE = 'text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-1.5';
const LABEL = 'text-[9px] font-bold text-slate-600 uppercase tracking-wider';
const INPUT_BASE = 'w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all bg-white';
const SELECT_BASE = 'w-full pl-8 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all appearance-none';

function IconInput({ icon: Icon, children }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
      {children}
    </div>
  );
}

export default function UserPage() {
  const navigate = useNavigate();
  const { showToast, user: loggedInUser } = useOutletContext();

  const allowedIcons = loggedInUser?.access?.frontend_icons || loggedInUser?.designation?.frontend_icons || [];
  
  const hasSubPermission = (moduleId, btn) => {
    return allowedIcons.some(item => {
      // Legacy format fallback
      if (typeof item === 'string') return item === `${moduleId}-${btn}`;
      // New backend format
      if (typeof item === 'object' && item.icon === moduleId) {
        return item.buttons && item.buttons.includes(btn);
      }
      return false;
    });
  };

  const canCreate = hasSubPermission('users', 'Create');
  const canEdit = hasSubPermission('users', 'Edit');
  const canView = hasSubPermission('users', 'View');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchDesignations();
    fetchDepartments();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await fetch('/branches/v1');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setBranches(Array.isArray(data) ? data : (data.data || data.branches || []));
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches', err);
    }
  };

  const getDepartmentName = (val) => {
    if (!val) return '-';
    if (typeof val === 'object') return val.name || val.title || JSON.stringify(val);
    const dept = departments.find(d => (d.master_id || d.id || d._id) === val || (d.name || d.title) === val);
    return dept ? (dept.name || dept.title) : val;
  };

  const getDesignationName = (val) => {
    if (!val) return '-';
    if (typeof val === 'object') return val.name || val.title || JSON.stringify(val);
    const desig = designations.find(d => (d.master_id || d.id || d._id) === val || (d.name || d.title) === val);
    return desig ? (desig.name || desig.title) : val;
  };

  const getBranchName = (val) => {
    if (!val) return '-';
    if (typeof val === 'object') return val.branch_name || val.name || JSON.stringify(val);
    const branch = branches.find(b => (b.branch_id || b.id || b._id) === val || (b.branch_name || b.name) === val);
    return branch ? (branch.branch_name || branch.name) : val;
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/masters/v1/Department');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setDepartments(Array.isArray(data) ? data : (data.data || data.masters || []));
        }
      }
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch('/masters/v1/Designation');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setDesignations(Array.isArray(data) ? data : (data.data || data.masters || []));
        }
      }
    } catch (err) {
      console.error('Failed to fetch designations', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/users/get');
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : (data.data || data.users || []));
        }
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      salary: formData.salary !== '' ? Number(formData.salary) : 0,
    };
    // Build strict payload matching the update schema exactly
    const updatePayload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password,
      profile_photo: formData.profile_photo,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      department: formData.department,
      designation: formData.designation,
      joining_date: formData.joining_date,
      employment_type: formData.employment_type,
      branch: formData.branch,
      salary: formData.salary !== '' ? Number(formData.salary) : 0,
      salary_type: formData.salary_type,
      bank_name: formData.bank_name,
      account_number: formData.account_number,
      ifsc_code: formData.ifsc_code,
      aadhaar_document: formData.aadhaar_document,
      pan_document: formData.pan_document,
      driving_license_document: formData.driving_license_document,
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number,
      driving_license_number: formData.driving_license_number,
      emergency_contact: formData.emergency_contact,
      role: formData.role,
      status: formData.status,
    };
    // Password is optional on edit; remove if empty
    if (editingId && !updatePayload.password) delete updatePayload.password;

    const createPayload = {
      ...updatePayload,
      password: formData.password,
    };

    try {
      console.log('--- FRONTEND PAYLOAD DEBUG ---');
      console.log('Sending this exactly to the backend:', editingId ? updatePayload : createPayload);
      console.log('Notice that profile_photo is exactly what you typed (no base64 conversion on frontend!)');
      
      let res;
      if (editingId) {
        res = await fetch(`/users/update/${editingId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
      } else {
        res = await fetch('/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload),
        });
      }

      if (res.ok) {
        showToast(editingId ? `User '${formData.name}' updated!` : `User '${formData.name}' created!`);
        fetchUsers();
        setFormData(EMPTY_FORM);
        setEditingId(null);
        setActiveSection(0);
      } else {
        const errData = await res.json().catch(() => ({}));
        // FastAPI Pydantic returns detail as an array of objects — safely convert to string
        let errMsg = 'Failed to save user.';
        if (errData.detail) {
          if (typeof errData.detail === 'string') errMsg = errData.detail;
          else if (Array.isArray(errData.detail)) errMsg = errData.detail.map(e => `${e.loc?.join('.')} — ${e.msg}`).join('; ');
          else errMsg = JSON.stringify(errData.detail);
        } else if (errData.message) {
          errMsg = errData.message;
        }
        showToast(errMsg);
      }
    } catch (err) {
      console.error('API Error:', err);
      showToast('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '',
      profile_photo: user.profile_photo || '',
      gender: user.gender || '',
      date_of_birth: user.date_of_birth || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      department: user.department?.id || user.department || '',
      designation: user.designation?.id || user.designation || '',
      joining_date: user.joining_date || '',
      employment_type: user.employment_type || '',
      branch: user.branch?.id || user.branch || '',
      salary: user.salary || '',
      salary_type: user.salary_type || '',
      bank_name: user.bank_name || '',
      account_number: user.account_number || '',
      ifsc_code: user.ifsc_code || '',
      aadhaar_document: user.aadhaar_document || '',
      pan_document: user.pan_document || '',
      driving_license_document: user.driving_license_document || '',
      aadhaar_number: user.aadhaar_number || '',
      pan_number: user.pan_number || '',
      driving_license_number: user.driving_license_number || '',
      emergency_contact: user.emergency_contact || '',
      role: user.role || 'staff',
      status: user.status || 'active',
    });
    setEditingId(user.user_id || user.id || user._id);
    setActiveSection(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setActiveSection(0);
  };

  const filteredUsers = users.filter((u) =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SECTIONS = [
    { label: 'Personal', icon: User },
    { label: 'Employment', icon: Briefcase },
    { label: 'Banking', icon: CreditCard },
    { label: 'Documents', icon: FileText },
    { label: 'Access', icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto mt-2">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 leading-tight">User Management</h1>
          <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">Master Configuration</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Form */}
        {(editingId ? canEdit : canCreate) && (
          <div className="lg:w-[42%] xl:w-[38%] bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden h-fit">
          {/* Form Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60" />
            <h2 className="text-sm font-bold text-slate-800 relative z-10">
              {editingId ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5 relative z-10">Fill all sections to create a staff account</p>
          </div>

          {/* Section Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/60 overflow-x-auto">
            {SECTIONS.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSection(idx)}
                  className={`flex-1 min-w-[60px] flex flex-col items-center gap-0.5 py-2 px-1 text-[9px] font-bold uppercase tracking-wider transition-all border-b-2 ${activeSection === idx
                      ? 'border-indigo-500 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/80'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sec.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            {/* Section 0: Personal Info */}
            {activeSection === 0 && (
              <div className="space-y-3">
                <div className={SECTION_STYLE}>
                  <p className={SECTION_TITLE}><User className="w-3 h-3" /> Personal Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Full Name *</label>
                      <IconInput icon={User}>
                        <input type="text" required placeholder="Rahul Sharma" value={formData.name} onChange={set('name')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Email *</label>
                      <IconInput icon={Mail}>
                        <input type="email" required placeholder="user@example.com" value={formData.email} onChange={set('email')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Mobile *</label>
                      <IconInput icon={Phone}>
                        <input type="tel" required placeholder="9876543210" value={formData.mobile} onChange={set('mobile')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Emergency Contact</label>
                      <IconInput icon={Phone}>
                        <input type="tel" placeholder="9876543211" value={formData.emergency_contact} onChange={set('emergency_contact')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Gender</label>
                      <IconInput icon={User}>
                        <select value={formData.gender} onChange={set('gender')} className={SELECT_BASE}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Date of Birth</label>
                      <IconInput icon={Calendar}>
                        <input type="date" value={formData.date_of_birth} onChange={set('date_of_birth')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Profile Photo URL</label>
                      <IconInput icon={Camera}>
                        <input type="text" placeholder="https://..." value={formData.profile_photo} onChange={set('profile_photo')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Address</label>
                      <IconInput icon={MapPin}>
                        <input type="text" placeholder="Street, Building No..." value={formData.address} onChange={set('address')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>City</label>
                      <IconInput icon={MapPin}>
                        <input type="text" placeholder="Bangalore" value={formData.city} onChange={set('city')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>State</label>
                      <IconInput icon={MapPin}>
                        <input type="text" placeholder="Karnataka" value={formData.state} onChange={set('state')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Pincode</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="560001" value={formData.pincode} onChange={set('pincode')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveSection(1)} className="w-full py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                  Next: Employment <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
              </div>
            )}

            {/* Section 1: Employment */}
            {activeSection === 1 && (
              <div className="space-y-3">
                <div className={SECTION_STYLE}>
                  <p className={SECTION_TITLE}><Briefcase className="w-3 h-3" /> Employment Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={LABEL}>Department</label>
                      <IconInput icon={Building2}>
                        <select value={formData.department} onChange={set('department')} className={SELECT_BASE}>
                          <option value="">Select Department</option>
                          {departments.map(d => (
                            <option key={d.master_id || d.id || d._id} value={d.master_id || d.id || d._id}>
                              {d.name || d.title}
                            </option>
                          ))}
                        </select>
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Designation</label>
                      <IconInput icon={Briefcase}>
                        <select value={formData.designation} onChange={set('designation')} className={SELECT_BASE}>
                          <option value="">Select Designation</option>
                          {designations.map(d => (
                            <option key={d.master_id || d.id || d._id} value={d.master_id || d.id || d._id}>
                              {d.name || d.title}
                            </option>
                          ))}
                        </select>
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Branch</label>
                      <IconInput icon={Building2}>
                        <select value={formData.branch} onChange={set('branch')} className={SELECT_BASE}>
                          <option value="">Select Branch</option>
                          {branches.map(b => (
                            <option key={b.branch_id || b.id || b._id} value={b.branch_id || b.id || b._id}>
                              {b.branch_name || b.name}
                            </option>
                          ))}
                        </select>
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Joining Date</label>
                      <IconInput icon={Calendar}>
                        <input type="date" value={formData.joining_date} onChange={set('joining_date')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Employment Type</label>
                      <IconInput icon={Briefcase}>
                        <select value={formData.employment_type} onChange={set('employment_type')} className={SELECT_BASE}>
                          <option value="">Select</option>
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="intern">Intern</option>
                        </select>
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Salary</label>
                      <IconInput icon={DollarSign}>
                        <input type="number" min="0" placeholder="0" value={formData.salary} onChange={set('salary')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Salary Type</label>
                      <IconInput icon={DollarSign}>
                        <select value={formData.salary_type} onChange={set('salary_type')} className={SELECT_BASE}>
                          <option value="">Select</option>
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                          <option value="hourly">Hourly</option>
                        </select>
                      </IconInput>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveSection(0)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setActiveSection(2)} className="flex-1 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                    Next: Banking <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: Banking */}
            {activeSection === 2 && (
              <div className="space-y-3">
                <div className={SECTION_STYLE}>
                  <p className={SECTION_TITLE}><CreditCard className="w-3 h-3" /> Bank Details</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className={LABEL}>Bank Name</label>
                      <IconInput icon={Building2}>
                        <input type="text" placeholder="State Bank of India" value={formData.bank_name} onChange={set('bank_name')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Account Number</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="1234567890123456" value={formData.account_number} onChange={set('account_number')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>IFSC Code</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="SBIN0001234" value={formData.ifsc_code} onChange={set('ifsc_code')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveSection(1)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setActiveSection(3)} className="flex-1 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                    Next: Documents <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 3: Documents */}
            {activeSection === 3 && (
              <div className="space-y-3">
                <div className={SECTION_STYLE}>
                  <p className={SECTION_TITLE}><FileText className="w-3 h-3" /> KYC Documents</p>
                  <p className="text-[9px] text-slate-400 -mt-1 mb-1">Enter document numbers or upload URLs</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={LABEL}>Aadhaar Number</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="1234 5678 9012" value={formData.aadhaar_number} onChange={set('aadhaar_number')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>Aadhaar Doc URL</label>
                      <IconInput icon={FileText}>
                        <input type="text" placeholder="https://..." value={formData.aadhaar_document} onChange={set('aadhaar_document')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>PAN Number</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="ABCDE1234F" value={formData.pan_number} onChange={set('pan_number')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>PAN Doc URL</label>
                      <IconInput icon={FileText}>
                        <input type="text" placeholder="https://..." value={formData.pan_document} onChange={set('pan_document')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>License Number</label>
                      <IconInput icon={Hash}>
                        <input type="text" placeholder="DL-1420110012345" value={formData.driving_license_number} onChange={set('driving_license_number')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1">
                      <label className={LABEL}>License Doc URL</label>
                      <IconInput icon={FileText}>
                        <input type="text" placeholder="https://..." value={formData.driving_license_document} onChange={set('driving_license_document')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveSection(2)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setActiveSection(4)} className="flex-1 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1">
                    Next: Access <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

            {/* Section 4: Access */}
            {activeSection === 4 && (
              <div className="space-y-3">
                <div className={SECTION_STYLE}>
                  <p className={SECTION_TITLE}><Shield className="w-3 h-3" /> Role & Access Control</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Password</label>
                      <IconInput icon={Lock}>
                        <input type="password" placeholder="Leave blank to keep unchanged" value={formData.password} onChange={set('password')} className={INPUT_BASE} />
                      </IconInput>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Role *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['staff', 'admin', 'manager', 'driver'].map((r) => (
                          <label key={r} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold ${formData.role === r ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                            <input type="radio" name="role" value={r} checked={formData.role === r} onChange={set('role')} className="accent-indigo-600" />
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className={LABEL}>Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['active', 'inactive'].map((s) => (
                          <label key={s} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold ${formData.status === s ? (s === 'active' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700') : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                            <input type="radio" name="status" value={s} checked={formData.status === s} onChange={set('status')} className={s === 'active' ? 'accent-emerald-600' : 'accent-rose-600'} />
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveSection(3)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors">
                    Back
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors">
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isLoading ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        )}

        {/* Right: User List */}
        <div className="flex-1 bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-fit">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">User Directory</h2>
                <p className="text-[9px] text-slate-400 font-medium">{users.length} registered users</p>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold border border-indigo-100">
                {users.length}
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider first:rounded-tl-lg">Name</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dept</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
                  {(canView || canEdit) && (
                    <th className="py-2.5 px-3 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right last:rounded-tr-lg">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {canView ? filteredUsers.map((user) => {
                  const uid = user.user_id || user.id || user._id;
                  return (
                    <tr key={uid} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {user.profile_photo ? (
                            <img src={user.profile_photo} alt={user.name} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {(user.name || '?')[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-[9px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">{getDepartmentName(user.department)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {user.role || 'staff'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                          {user.status}
                        </span>
                      </td>
                      {(canView || canEdit) && (
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {canView && (
                              <button onClick={() => setViewingUser(user)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors" title="View Details">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canEdit && (
                              <button onClick={() => handleEdit(user)} className="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-100 transition-colors" title="Edit">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-xs text-slate-400 font-bold">
                      You do not have permission to view the users list.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {isLoading && users.length === 0 && canView && (
              <div className="text-center py-10 text-slate-400 text-xs font-bold animate-pulse">Loading users...</div>
            )}
            {!isLoading && filteredUsers.length === 0 && canView && (
              <div className="text-center py-10">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-indigo-300" />
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  {searchQuery ? 'No users match your search.' : 'No users yet. Create one using the form.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
              <div className="flex items-center gap-3">
                {viewingUser.profile_photo ? (
                  <img src={viewingUser.profile_photo} alt={viewingUser.name} className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                    {(viewingUser.name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{viewingUser.name}</h3>
                  <p className="text-[10px] text-slate-500">{viewingUser.email}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="flex gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">{viewingUser.role || 'staff'}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${viewingUser.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>{viewingUser.status}</span>
                {viewingUser.employment_type && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100">{viewingUser.employment_type}</span>}
              </div>

              {[
                { label: 'Mobile', value: viewingUser.mobile },
                { label: 'Emergency Contact', value: viewingUser.emergency_contact },
                { label: 'Gender', value: viewingUser.gender },
                { label: 'Date of Birth', value: viewingUser.date_of_birth },
                { label: 'Address', value: [viewingUser.address, viewingUser.city, viewingUser.state, viewingUser.pincode].filter(Boolean).join(', ') },
                { label: 'Department', value: getDepartmentName(viewingUser.department) },
                { label: 'Designation', value: getDesignationName(viewingUser.designation) },
                { label: 'Branch', value: getBranchName(viewingUser.branch) },
                { label: 'Joining Date', value: viewingUser.joining_date },
                { label: 'Salary', value: viewingUser.salary ? `Rs. ${viewingUser.salary} / ${viewingUser.salary_type || 'month'}` : null },
                { label: 'Bank Name', value: viewingUser.bank_name },
                { label: 'Account No.', value: viewingUser.account_number },
                { label: 'IFSC Code', value: viewingUser.ifsc_code },
                { label: 'Aadhaar Number', value: viewingUser.aadhaar_number },
                { label: 'PAN Number', value: viewingUser.pan_number },
                { label: 'License Number', value: viewingUser.driving_license_number },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 border-b border-slate-50 pb-2 last:border-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
                  <span className="text-[11px] font-semibold text-slate-700 text-right break-all">{value}</span>
                </div>
              ))}

              {(viewingUser.aadhaar_document || viewingUser.pan_document || viewingUser.driving_license_document) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Documents</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Aadhaar Card', url: viewingUser.aadhaar_document },
                      { label: 'PAN Card', url: viewingUser.pan_document },
                      { label: 'Driving License', url: viewingUser.driving_license_document }
                    ].filter(d => d.url).map(doc => (
                      <a key={doc.label} href={doc.url} target="_blank" rel="noreferrer" className="block border border-slate-200 rounded-lg overflow-hidden hover:border-indigo-400 transition-all group bg-white shadow-sm hover:shadow-md">
                        <div className="h-24 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                          <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 bg-slate-50"><svg class="w-6 h-6 mb-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>View File</div>' }} />
                          <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors"></div>
                        </div>
                        <div className="p-2 bg-slate-50 text-center border-t border-slate-200">
                          <span className="text-[9px] font-bold text-slate-700">{doc.label}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <button
                onClick={() => { setViewingUser(null); handleEdit(viewingUser); }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setViewingUser(null)} className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
