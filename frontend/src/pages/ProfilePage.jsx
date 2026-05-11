import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User, Mail, Briefcase, Building2, Shield, Key, Edit2, Save, X,
  Hash, DollarSign, Calendar, Phone, BadgeCheck, ChevronDown,
} from 'lucide-react';
// FIX: named export — matches how authApi is exported in authApi.js
import { authApi } from '../api/authApi';
// FIX: named export — matches how userApi is exported in userApi.js
import { userApi } from '../api/userApi';
import { ChangePasswordInline } from './PasswordResetPages';

// =============================================================================
// CONSTANTS
// =============================================================================

// Roles that match the backend Joi enum exactly
const ROLE_OPTIONS = ['Admin', 'HR', 'Manager', 'Finance', 'Employee'];

const ROLE_STYLES = {
  admin: 'bg-gradient-to-r from-red-500    to-pink-500    text-white',
  manager: 'bg-gradient-to-r from-blue-500   to-cyan-500    text-white',
  hr: 'bg-gradient-to-r from-purple-500 to-indigo-500  text-white',
  finance: 'bg-gradient-to-r from-amber-500  to-orange-500  text-white',
  employee: 'bg-gradient-to-r from-green-500  to-emerald-500 text-white',
};

// =============================================================================
// STYLE HELPERS
// =============================================================================

const getRoleBadgeClass = (role) =>
  `px-3 py-1 rounded-full text-xs font-medium shadow-sm ${ROLE_STYLES[role?.toLowerCase()] ?? 'bg-gray-500 text-white'
  }`;

const INPUT_BASE =
  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'dark:bg-gray-700 dark:text-white transition-colors text-sm';

const SELECT_BASE =
  'w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ' +
  'dark:bg-gray-700 dark:text-white transition-colors text-sm appearance-none bg-white dark:bg-gray-700';

const inputCls = (hasError) =>
  `${INPUT_BASE} ${hasError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`;

// =============================================================================
// FORMATTERS
// =============================================================================

const formatDate = (v) =>
  v
    ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const formatSalary = (v) =>
  v != null && v !== ''
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)
    : '—';

// =============================================================================
// NORMALISE — shapes the raw auth context user into a flat, safe object
// =============================================================================

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
    // FIX: primaryRole may come from user.primaryRole OR user.role?.name (belongsTo association)
    primaryRole: user.primaryRole ?? user.role?.name ?? 'Employee',
    department: user.department ?? '',
    designation: user.designation ?? '',
    employeeCode: user.employeeCode ?? '',
    baseSalary: user.baseSalary ?? '',
    isActive: user.isActive ?? true,
    profilePhoto: user.profilePhoto ?? null,
    roleId: user.roleId ?? null,
    managerId: user.managerId ?? null,
    companyId: user.companyId ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
};

// =============================================================================
// READ-ONLY INFO GRID CONFIG
// =============================================================================

const INFO_FIELDS = [
  { key: 'fullName', label: 'Full Name', icon: User, format: null },
  { key: 'email', label: 'Email', icon: Mail, format: null },
  { key: 'phone', label: 'Phone', icon: Phone, format: null },
  { key: 'employeeCode', label: 'Employee Code', icon: Hash, format: null },
  { key: 'department', label: 'Department', icon: Building2, format: null },
  { key: 'designation', label: 'Designation', icon: Briefcase, format: null },
  { key: 'baseSalary', label: 'Base Salary', icon: DollarSign, format: formatSalary },
  { key: 'roleId', label: 'Role ID', icon: Shield, format: null },
  { key: 'managerId', label: 'Manager ID', icon: User, format: null },
  { key: 'companyId', label: 'Company ID', icon: Building2, format: null },
  { key: 'createdAt', label: 'Joined', icon: Calendar, format: formatDate },
  { key: 'updatedAt', label: 'Last Updated', icon: Calendar, format: formatDate },
];

// =============================================================================
// SMALL COMPONENTS
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

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;

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
        className={`${SELECT_BASE} ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    <FieldError msg={error} />
  </div>
);

// Icon-prefixed text/number/tel input — avoids repeating the same relative wrapper
const IconInput = ({ icon: Icon, type = 'text', name, value, onChange, disabled, placeholder, error, ...rest }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`${inputCls(error)} pl-10`}
      {...rest}
    />
  </div>
);

// =============================================================================
// FORM STATE FACTORIES
// =============================================================================

const buildAdminForm = (u) => ({
  firstName: u?.firstName ?? '',
  lastName: u?.lastName ?? '',
  email: u?.email ?? '',
  phone: u?.phone ?? '',
  employeeCode: u?.employeeCode ?? '',
  // FIX: use primaryRole (which normaliseUser already resolves from role?.name)
  role: u?.primaryRole ?? '',
  // FIX: store managerId as string for controlled input; empty string = "clear"
  managerId: u?.managerId != null ? String(u.managerId) : '',
  department: u?.department ?? '',
  // FIX: baseSalary as string so number input stays controlled
  baseSalary: u?.baseSalary != null && u?.baseSalary !== '' ? String(u.baseSalary) : '',
  isActive: u?.isActive ?? true,
});

const buildSelfForm = (u) => ({
  firstName: u?.firstName ?? '',
  lastName: u?.lastName ?? '',
  email: u?.email ?? '',
  phone: u?.phone ?? '',
});

// =============================================================================
// VALIDATION
// =============================================================================

const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);

const validateSelfForm = (form) => {
  const errs = {};
  if (!form.firstName.trim()) errs.firstName = 'First name is required';
  if (!form.lastName.trim()) errs.lastName = 'Last name is required';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!isValidEmail(form.email)) errs.email = 'Invalid email address';
  return errs;
};

const validateAdminForm = (form) => {
  const errs = {};
  if (!form.firstName.trim()) errs.firstName = 'First name is required';
  if (!form.lastName.trim()) errs.lastName = 'Last name is required';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!isValidEmail(form.email)) errs.email = 'Invalid email address';
  if (form.baseSalary !== '' && isNaN(Number(form.baseSalary)))
    errs.baseSalary = 'Must be a valid number';
  if (form.managerId !== '' && (isNaN(Number(form.managerId)) || Number(form.managerId) < 1))
    errs.managerId = 'Must be a positive integer';
  return errs;
};

// =============================================================================
// PAYLOAD BUILDER — matches backend updateUserSchema exactly
// =============================================================================

// FIX: Always assign fields so they can be cleared (empty strings become null)
const buildAdminPayload = (form) => {
  const payload = {};

  // String fields – send null when empty to clear DB fields
  payload.firstName = form.firstName?.trim() || null;
  payload.lastName = form.lastName?.trim() || null;
  payload.email = form.email?.trim() || null;
  payload.phone = form.phone?.trim() || null;
  payload.department = form.department?.trim() || null;
  payload.employeeCode = form.employeeCode?.trim() || null;

  // Numeric fields – empty string becomes null
  payload.baseSalary = form.baseSalary !== '' ? Number(form.baseSalary) : null;
  payload.managerId = form.managerId !== '' ? Number(form.managerId) : null;

  // Role: only send if a valid role is selected (required by backend)
  if (form.role) payload.role = form.role;

  // Boolean – always send
  payload.isActive = form.isActive;

  return payload;
};

// =============================================================================
// PROFILE PAGE
// =============================================================================

export const ProfilePage = () => {
  const { user, refreshUserData, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const userData = useMemo(() => normaliseUser(user), [user]);

  // FIX: derive from normalised primaryRole (which already covers role?.name fallback)
  const isAdminOrHR = ['admin', 'hr'].includes(userData?.primaryRole?.toLowerCase());

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [selfForm, setSelfForm] = useState(buildSelfForm(null));
  const [adminForm, setAdminForm] = useState(buildAdminForm(null));

  // Sync form state whenever userData changes (e.g. after refreshUserData resolves)
  useEffect(() => {
    if (userData) {
      setSelfForm(buildSelfForm(userData));
      setAdminForm(buildAdminForm(userData));
    }
  }, [userData]);

  // ── Change handlers ────────────────────────────────────────────────────────

  const handleSelfChange = useCallback((e) => {
    const { name, value } = e.target;
    setSelfForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleAdminChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    // FIX: checkboxes need `checked`, all other inputs use `value`
    const next = type === 'checkbox' ? checked : value;
    setAdminForm((prev) => ({ ...prev, [name]: next }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // ── Cancel ────────────────────────────────────────────────────────────────

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrors({});
    setSelfForm(buildSelfForm(userData));
    setAdminForm(buildAdminForm(userData));
  }, [userData]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (isAdminOrHR) {
      // Admin / HR → full update via userApi.updateUser
      const errs = validateAdminForm(adminForm);
      if (Object.keys(errs).length) { setErrors(errs); return; }

      setIsSaving(true);
      try {
        const payload = buildAdminPayload(adminForm);
        // userApi.updateUser returns the user object directly (no .success wrapper)
        const updated = await userApi.updateUser(userData.id, payload);
        if (updated) {
          await refreshUserData();
          toast.success('Profile updated successfully');
          setIsEditing(false);
          setErrors({});
        }
      } catch (err) {
        console.error('[ProfilePage] UPDATE_USER failed:', err?.response?.data ?? err);
        // FIX: show the message directly from the thrown error object
        toast.error(err?.message || 'Update failed');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Employee / Manager → self update via userApi.updateUser
      const errs = validateSelfForm(selfForm);
      if (Object.keys(errs).length) { setErrors(errs); return; }

      setIsSaving(true);
      try {
        const updatedUser = await userApi.updateUser(userData.id, {
          firstName: selfForm.firstName,
          lastName: selfForm.lastName,
          email: selfForm.email,
          phone: selfForm.phone,
        });
        // FIX: userApi.updateUser returns the user object directly — no success wrapper
        if (updatedUser) {
          await refreshUserData();
          toast.success('Profile updated successfully');
          setIsEditing(false);
          setErrors({});
        }
      } catch (err) {
        console.error('[ProfilePage] UPDATE_PROFILE failed:', err?.response?.data ?? err);
        toast.error(err?.message || 'Update failed');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const initials =
    ((userData.firstName?.[0] ?? '') + (userData.lastName?.[0] ?? '')).toUpperCase() || 'U';

  // ── Save / cancel button row (shared between both forms) ──────────────────

  const ActionButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        {isSaving
          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Save className="w-4 h-4" />Save Changes</>
        }
      </button>
      <button
        onClick={cancelEdit}
        disabled={isSaving}
        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <X className="w-4 h-4" />Cancel
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

        {/* ══════════════════════════════════════════ HEADER */}
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

            {/* Name + role + status badges */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-0.5">{userData.fullName}</h1>
              {userData.designation && (
                <p className="text-white/70 text-sm mb-2">{userData.designation}</p>
              )}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={getRoleBadgeClass(userData.primaryRole)}>
                  {userData.primaryRole}
                </span>
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

            {/* Header action buttons */}
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

        {/* ══════════════════════════════════════════ BODY */}
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

                /* ══════════════════ ADMIN / HR EDIT FORM */
                ? <div className="space-y-5">

                  {/* First + Last name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'firstName', label: 'First Name *' },
                      { name: 'lastName', label: 'Last Name *' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={adminForm[name]}
                          onChange={handleAdminChange}
                          disabled={isSaving}
                          className={inputCls(errors[name])}
                        />
                        <FieldError msg={errors[name]} />
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <IconInput
                      icon={Mail} type="email" name="email"
                      value={adminForm.email} onChange={handleAdminChange}
                      disabled={isSaving} error={errors.email}
                    />
                    <FieldError msg={errors.email} />
                  </div>

                  {/* Phone + Employee Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                      <IconInput
                        icon={Phone} type="tel" name="phone"
                        value={adminForm.phone} onChange={handleAdminChange}
                        disabled={isSaving} placeholder="+91 00000 00000"
                        error={errors.phone}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Code</label>
                      <IconInput
                        icon={Hash} name="employeeCode"
                        value={adminForm.employeeCode} onChange={handleAdminChange}
                        disabled={isSaving} error={errors.employeeCode}
                      />
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
                      <IconInput
                        icon={Building2} name="department"
                        value={adminForm.department} onChange={handleAdminChange}
                        disabled={isSaving} error={errors.department}
                      />
                    </div>
                  </div>

                  {/* Base Salary + Manager ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Salary (₹)</label>
                      <IconInput
                        icon={DollarSign} type="number" name="baseSalary"
                        value={adminForm.baseSalary} onChange={handleAdminChange}
                        disabled={isSaving} min={0} error={errors.baseSalary}
                      />
                      <FieldError msg={errors.baseSalary} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Manager ID
                        <span className="ml-1 font-normal text-gray-400 text-xs">(blank to clear)</span>
                      </label>
                      <IconInput
                        icon={User} type="number" name="managerId"
                        value={adminForm.managerId} onChange={handleAdminChange}
                        disabled={isSaving} min={1}
                        placeholder="Leave blank to clear"
                        error={errors.managerId}
                      />
                      <FieldError msg={errors.managerId} />
                    </div>
                  </div>

                  {/* isActive toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40">
                    {/* FIX: toggle thumb movement — uses a peer on the hidden input
                          but the thumb div must be a sibling, not a child, of the peer */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={adminForm.isActive}
                        onChange={handleAdminChange}
                        disabled={isSaving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 rounded-full bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-500 transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                    </label>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {adminForm.isActive
                          ? 'User is active and can log in'
                          : 'User is deactivated — cannot log in'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${adminForm.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {adminForm.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <ActionButtons />
                </div>

                /* ══════════════════ SELF EDIT FORM */
                : <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'firstName', label: 'First Name *' },
                      { name: 'lastName', label: 'Last Name *' },
                    ].map(({ name, label }) => (
                      <div key={name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={selfForm[name]}
                          onChange={handleSelfChange}
                          disabled={isSaving}
                          className={inputCls(errors[name])}
                        />
                        <FieldError msg={errors[name]} />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <IconInput
                      icon={Mail} type="email" name="email"
                      value={selfForm.email} onChange={handleSelfChange}
                      disabled={isSaving} error={errors.email}
                    />
                    <FieldError msg={errors.email} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <IconInput
                      icon={Phone} type="tel" name="phone"
                      value={selfForm.phone} onChange={handleSelfChange}
                      disabled={isSaving} placeholder="+91 00000 00000"
                      error={errors.phone}
                    />
                  </div>

                  <ActionButtons />
                </div>

            ) : (
              /* ══════════════════ READ-ONLY GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INFO_FIELDS.map(({ key, label, icon, format }) => {
                  const raw = userData[key];
                  const display = format
                    ? format(raw)
                    : raw != null && raw !== '' ? String(raw) : '—';
                  return <InfoRow key={key} icon={icon} label={label} value={display} />;
                })}

                {/* Role — coloured badge */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                    <span className={getRoleBadgeClass(userData.primaryRole)}>
                      {userData.primaryRole}
                    </span>
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