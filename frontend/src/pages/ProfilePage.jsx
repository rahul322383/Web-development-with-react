import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User, Mail, Briefcase, Building2, Shield, Key, Edit2, Save, X,
  Hash, DollarSign, Calendar, Phone, BadgeCheck, ChevronDown,
} from 'lucide-react';
import {authApi} from '../api/authApi';
import { userApi } from '../api/userApi';
import { ChangePasswordInline } from './PasswordResetPages';

// =============================================================================
// HELPERS
// =============================================================================

const ROLE_STYLES = {
  admin: 'bg-gradient-to-r from-red-500    to-pink-500    text-white',
  manager: 'bg-gradient-to-r from-blue-500   to-cyan-500    text-white',
  hr: 'bg-gradient-to-r from-purple-500 to-indigo-500  text-white',
  finance: 'bg-gradient-to-r from-amber-500  to-orange-500  text-white',
  employee: 'bg-gradient-to-r from-green-500  to-emerald-500 text-white',
};

const getRoleBadgeClass = (role) =>
  `px-3 py-1 rounded-full text-xs font-medium shadow-sm ${ROLE_STYLES[role?.toLowerCase()] ?? 'bg-gray-500 text-white'
  }`;

const INPUT_BASE =
  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'dark:bg-gray-700 dark:text-white transition-colors text-sm';

const SELECT_BASE =
  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'dark:bg-gray-700 dark:text-white transition-colors text-sm appearance-none bg-white';

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const formatSalary = (v) =>
  v != null && v !== ''
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
    : '—';

const normaliseUser = (user) => {
  if (!user) return null;
  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';
  return {
    id: user.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || 'User',
    email: user.email ?? '',
    phone: user.phone ?? '',
    primaryRole: user.primaryRole ?? 'Employee',
    department: user.department ?? '',
    designation: user.designation ?? '',
    employeeCode: user.employeeCode ?? '',
    baseSalary: user.baseSalary ?? '',
    isActive: user.isActive ?? true,
    profilePhoto: user.profilePhoto ?? null,
    roleId: user.roleId ?? null,
    managerId: user.managerId ?? null,
    shiftId: user.shiftId ?? null,
    companyId: user.companyId ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
};

// =============================================================================
// INFO FIELD CONFIG  (read-only grid)
// =============================================================================

const INFO_FIELDS = [
  { key: 'fullName', label: 'Full Name', icon: User, span: false },
  { key: 'email', label: 'Email', icon: Mail, span: false },
  { key: 'phone', label: 'Phone', icon: Phone, span: false },
  { key: 'employeeCode', label: 'Employee Code', icon: Hash, span: false },
  { key: 'department', label: 'Department', icon: Building2, span: false },
  { key: 'designation', label: 'Designation', icon: Briefcase, span: false },
  { key: 'baseSalary', label: 'Base Salary', icon: DollarSign, span: false, format: formatSalary },
  { key: 'roleId', label: 'Role ID', icon: Shield, span: false },
  { key: 'managerId', label: 'Manager ID', icon: User, span: false },
  { key: 'companyId', label: 'Company ID', icon: Building2, span: false },
  { key: 'createdAt', label: 'Joined', icon: Calendar, span: false, format: formatDate },
  { key: 'updatedAt', label: 'Last Updated', icon: Calendar, span: false, format: formatDate },
];

// Roles allowed by the backend updateUserSchema
const ROLE_OPTIONS = ['Admin', 'HR', 'Manager', 'Finance', 'Employee'];

// =============================================================================
// INFO ROW
// =============================================================================

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-indigo-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{value || '—'}</p>
    </div>
  </div>
);

// =============================================================================
// SELECT WRAPPER (with chevron icon)
// =============================================================================

const SelectField = ({ label, name, value, onChange, options, disabled, error }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    )}
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${SELECT_BASE} dark:bg-gray-700 ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// =============================================================================
// PROFILE PAGE
// =============================================================================

export const ProfilePage = () => {
  const { user, refreshUserData, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Determine if viewer is an admin/hr so they can edit extended fields
  const isAdminOrHR = ['admin', 'hr'].includes(user?.primaryRole?.toLowerCase());

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Self-edit fields (authApi.updateProfile)
  const [selfForm, setSelfForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  // Admin-edit fields (userApi.updateUser) — superset of selfForm
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeCode: '',
    role: '',
    managerId: '',
    department: '',
    baseSalary: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const userData = useMemo(() => normaliseUser(user), [user]);

  useEffect(() => {
    if (userData) {
      setSelfForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
      });
      setAdminForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        employeeCode: userData.employeeCode,
        role: userData.primaryRole,
        managerId: userData.managerId ?? '',
        department: userData.department,
        baseSalary: userData.baseSalary,
        isActive: userData.isActive,
      });
    }
  }, [userData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelfChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelfForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const handleAdminChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────

  const validateSelf = () => {
    const errs = {};
    if (!selfForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!selfForm.lastName.trim()) errs.lastName = 'Last name is required';
    if (!selfForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(selfForm.email)) errs.email = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAdmin = () => {
    const errs = {};
    if (!adminForm.firstName.trim()) errs.firstName = 'First name is required';
    if (!adminForm.lastName.trim()) errs.lastName = 'Last name is required';
    if (!adminForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(adminForm.email)) errs.email = 'Invalid email address';
    if (adminForm.baseSalary !== '' && isNaN(Number(adminForm.baseSalary)))
      errs.baseSalary = 'Must be a number';
    if (adminForm.managerId !== '' && isNaN(Number(adminForm.managerId)))
      errs.managerId = 'Must be a valid ID';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isAdminOrHR) {
      if (!validateAdmin()) return;
      setIsSaving(true);
      try {
        // Build payload — only send defined/changed values (backend requires .min(1))
        // NOTE: backend field is `role` (maps to primaryRole internally via updateUser service)
        const payload = {
          firstName: adminForm.firstName || undefined,
          lastName: adminForm.lastName || undefined,
          email: adminForm.email || undefined,
          phone: adminForm.phone || undefined,
          role: adminForm.role || undefined,
          department: adminForm.department || undefined,
          employeeCode: adminForm.employeeCode || undefined,
          isActive: adminForm.isActive,
        };

        if (adminForm.baseSalary !== '') payload.baseSalary = Number(adminForm.baseSalary);
        // Always send managerId — null clears it, number sets it
        payload.managerId = adminForm.managerId !== '' ? Number(adminForm.managerId) : null;

        const response = await userApi.updateUser(userData.id, payload);

        if (response) {
          await refreshUserData();
          toast.success('Profile updated successfully');
          setIsEditing(false);
        }
      } catch (err) {
        console.error('UPDATE_USER error:', err.response?.data || err);
        toast.error(err.response?.data?.message || err?.message || 'Update failed');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Regular self-update via authApi
      if (!validateSelf()) return;
      setIsSaving(true);
      try {
        const response = await authApi.updateProfile({
          firstName: selfForm.firstName,
          lastName: selfForm.lastName,
          email: selfForm.email,
          phone: selfForm.phone,
        });
        if (response.success) {
          await refreshUserData();
          toast.success('Profile updated successfully');
          setIsEditing(false);
        } else {
          toast.error(response.message ?? 'Update failed');
        }
      } catch (err) {
        toast.error(err.response?.data?.message ?? 'Update failed');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrors({});
    if (userData) {
      setSelfForm({ firstName: userData.firstName, lastName: userData.lastName, email: userData.email, phone: userData.phone });
      setAdminForm({
        firstName: userData.firstName, lastName: userData.lastName, email: userData.email,
        phone: userData.phone, employeeCode: userData.employeeCode, role: userData.primaryRole,
        managerId: userData.managerId ?? '', department: userData.department,
        baseSalary: userData.baseSalary, isActive: userData.isActive,
      });
    }
  }, [userData]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const initials = ((userData.firstName?.[0] ?? '') + (userData.lastName?.[0] ?? '')).toUpperCase() || 'U';

  // ── Shared save/cancel buttons ────────────────────────────────────────────

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        {isSaving
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Save className="w-4 h-4" />Save Changes</>
        }
      </button>
      <button
        onClick={cancelEdit}
        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />Cancel
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">

            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl shrink-0 overflow-hidden">
              {userData.profilePhoto
                ? <img src={userData.profilePhoto} alt={userData.fullName} className="w-full h-full object-cover" />
                : <span className="text-3xl sm:text-4xl font-bold">{initials}</span>
              }
            </div>

            {/* Name + badges */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-0.5">{userData.fullName}</h1>
              {userData.designation && (
                <p className="text-white/70 text-sm mb-2">{userData.designation}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={getRoleBadgeClass(userData.primaryRole)}>{userData.primaryRole}</span>
                {userData.department && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    {userData.department}
                  </span>
                )}
                {userData.employeeCode && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                    #{userData.employeeCode}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm ${userData.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <BadgeCheck className="w-3 h-3" />
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:self-start">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              )}
              <button
                onClick={() => navigate('/forgot-password')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20 text-sm"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Forgot Password?</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 space-y-10">

          {/* Personal Information */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Personal Information
              {isAdminOrHR && isEditing && (
                <span className="ml-auto text-xs font-normal text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  Admin Edit Mode
                </span>
              )}
            </h2>

            {isEditing ? (
              isAdminOrHR
                ? /* ── ADMIN EDIT FORM ───────────────────────────── */
                <div className="space-y-5">
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ name: 'firstName', label: 'First Name *' }, { name: 'lastName', label: 'Last Name *' }].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <input
                          type="text" name={name} value={adminForm[name]}
                          onChange={handleAdminChange} disabled={isSaving}
                          className={`${INPUT_BASE} ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" name="email" value={adminForm.email}
                        onChange={handleAdminChange} disabled={isSaving}
                        className={`${INPUT_BASE} pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone + Employee Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel" name="phone" value={adminForm.phone}
                          onChange={handleAdminChange} disabled={isSaving}
                          placeholder="+91 00000 00000"
                          className={`${INPUT_BASE} pl-10 border-gray-300 dark:border-gray-600`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Code</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="employeeCode" value={adminForm.employeeCode}
                          onChange={handleAdminChange} disabled={isSaving}
                          className={`${INPUT_BASE} pl-10 border-gray-300 dark:border-gray-600`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role + Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Role"
                      name="role"
                      value={adminForm.role}
                      onChange={handleAdminChange}
                      options={ROLE_OPTIONS}
                      disabled={isSaving}
                      error={errors.role}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="department" value={adminForm.department}
                          onChange={handleAdminChange} disabled={isSaving}
                          className={`${INPUT_BASE} pl-10 border-gray-300 dark:border-gray-600`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Base Salary + Manager ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Salary (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number" name="baseSalary" value={adminForm.baseSalary}
                          onChange={handleAdminChange} disabled={isSaving} min={0}
                          className={`${INPUT_BASE} pl-10 ${errors.baseSalary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                      </div>
                      {errors.baseSalary && <p className="text-red-500 text-xs mt-1">{errors.baseSalary}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manager ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number" name="managerId" value={adminForm.managerId}
                          onChange={handleAdminChange} disabled={isSaving} min={1}
                          placeholder="Leave blank to clear"
                          className={`${INPUT_BASE} pl-10 ${errors.managerId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                      </div>
                      {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId}</p>}
                    </div>
                  </div>

                  {/* isActive toggle */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={adminForm.isActive}
                        onChange={handleAdminChange}
                        disabled={isSaving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer dark:bg-gray-600 peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminForm.isActive ? 'User is active and can log in' : 'User is deactivated'}
                      </p>
                    </div>
                  </div>

                  <ActionButtons />
                </div>

                : /* ── SELF EDIT FORM ────────────────────────────── */
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[{ name: 'firstName', label: 'First Name *' }, { name: 'lastName', label: 'Last Name *' }].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <input
                          type="text" name={name} value={selfForm[name]}
                          onChange={handleSelfChange} disabled={isSaving}
                          className={`${INPUT_BASE} ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" name="email" value={selfForm.email}
                        onChange={handleSelfChange} disabled={isSaving}
                        className={`${INPUT_BASE} pl-10 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel" name="phone" value={selfForm.phone}
                        onChange={handleSelfChange} disabled={isSaving}
                        placeholder="+91 00000 00000"
                        className={`${INPUT_BASE} pl-10 border-gray-300 dark:border-gray-600`}
                      />
                    </div>
                  </div>

                  <ActionButtons />
                </div>

            ) : (
              /* ── READ-ONLY GRID ──────────────────────────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INFO_FIELDS.map(({ key, label, icon, format }) => {
                  const raw = userData[key];
                  const display = format ? format(raw) : (raw != null && raw !== '' ? String(raw) : '—');
                  return <InfoRow key={key} icon={icon} label={label} value={display} />;
                })}

                {/* Role badge */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                    <span className={getRoleBadgeClass(userData.primaryRole)}>{userData.primaryRole}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${userData.isActive ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                    <BadgeCheck className={`w-4 h-4 ${userData.isActive ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                    <p className={`font-medium text-sm ${userData.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {userData.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700" />

          {/* Change Password */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              Change Password
            </h2>
            <ChangePasswordInline />
          </section>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;