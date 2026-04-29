// src/pages/CompanyPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Building2, Globe, Phone, Mail, MapPin, Clock, Calendar,
    DollarSign, Users, Edit2, Save, X, Upload, Trash2,
    CheckCircle, AlertCircle, Settings, TrendingUp, Shield,
    ChevronRight, RefreshCw, BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    useCompany,
    useCompanyStats,
    useUpdateCompany,
    useUpdateCompanySettings,
    useUploadCompanyLogo,
    useDeleteCompanyLogo,
} from '../company/useCompany';

// ─── helpers ────────────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR',
        minimumFractionDigits: 0
    }).format(n ?? 0);

const inputCls = (err) =>
    `w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500
   dark:bg-gray-700 dark:text-white
   ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`;

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const PLAN_BADGE = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pro: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    enterprise: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

// ─── section card ────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, action }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Icon className="w-5 h-5 text-indigo-500" />
                {title}
            </h2>
            {action}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// ─── stat card ───────────────────────────────────────────────
const StatTile = ({ label, value, icon: Icon, color = 'indigo' }) => {
    const colors = {
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
        amber: 'bg-amber-50  dark:bg-amber-900/20  text-amber-600',
    };
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  LOGO UPLOADER
// ─────────────────────────────────────────────────────────────
const LogoUploader = ({ company, companyId }) => {
    const fileRef = useRef(null);
    const uploadMutation = useUploadCompanyLogo(companyId);
    const deleteMutation = useDeleteCompanyLogo(companyId);
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
            toast.error('Only JPEG, PNG, WEBP or SVG allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Max file size is 5 MB');
            return;
        }
        setPreview(URL.createObjectURL(file));
        uploadMutation.mutate(file, {
            onSettled: () => setPreview(null),
        });
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const logoSrc = preview || company?.logoUrl;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* preview */}
            <div
                className={`relative w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden
          ${dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}
          transition-colors`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                {logoSrc ? (
                    <img src={logoSrc} alt="Company logo" className="w-full h-full object-contain p-2" />
                ) : (
                    <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                )}
                {(uploadMutation.isPending) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* actions */}
            <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    JPEG, PNG, WEBP or SVG · Max 5 MB<br />
                    Drag & drop or click to upload
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadMutation.isPending}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                        <Upload className="w-4 h-4" />
                        {uploadMutation.isPending ? 'Uploading…' : 'Upload logo'}
                    </button>
                    {company?.logoUrl && (
                        <button
                            onClick={() => deleteMutation.mutate()}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove
                        </button>
                    )}
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
//  PROFILE EDIT FORM
// ─────────────────────────────────────────────────────────────
const ProfileForm = ({ company, companyId, onCancel }) => {
    const mutation = useUpdateCompany(companyId);
    const [form, setForm] = useState({
        name: company.name ?? '',
        email: company.email ?? '',
        phone: company.phone ?? '',
        website: company.website ?? '',
        industry: company.industry ?? '',
        size: company.size ?? '',
        addressLine1: company.addressLine1 ?? '',
        addressLine2: company.addressLine2 ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        country: company.country ?? 'India',
        postalCode: company.postalCode ?? '',
    });
    const [errors, setErrors] = useState({});

    const set = (k) => (e) => {
        setForm(p => ({ ...p, [k]: e.target.value }));
        setErrors(p => ({ ...p, [k]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Company name is required';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (form.website && !/^https?:\/\/.+/.test(form.website)) e.website = 'URL must start with http(s)://';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        // strip empty strings → omit from payload
        const payload = Object.fromEntries(
            Object.entries(form).filter(([, v]) => v !== '')
        );
        mutation.mutate(payload, { onSuccess: onCancel });
    };

    const field = (label, key, type = 'text', placeholder = '') => (
        <div>
            <label className={labelCls}>{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className={inputCls(errors[key])}
            />
            {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('Company Name *', 'name')}
                {field('Official Email', 'email', 'email')}
                {field('Phone', 'phone', 'tel')}
                {field('Website', 'website', 'url', 'https://')}
                {field('Industry', 'industry')}
                <div>
                    <label className={labelCls}>Company Size</label>
                    <select value={form.size} onChange={set('size')} className={inputCls(false)}>
                        <option value="">Select…</option>
                        {['1-10', '11-50', '51-200', '201-500', '500+'].map(s =>
                            <option key={s} value={s}>{s} employees</option>
                        )}
                    </select>
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Address</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('Address Line 1', 'addressLine1')}
                {field('Address Line 2', 'addressLine2')}
                {field('City', 'city')}
                {field('State', 'state')}
                {field('Country', 'country')}
                {field('Postal Code', 'postalCode')}
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                    {mutation.isPending
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                        : <><Save className="w-4 h-4" /> Save changes</>}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl"
                >
                    <X className="w-4 h-4" /> Cancel
                </button>
            </div>
        </form>
    );
};

// ─────────────────────────────────────────────────────────────
//  SETTINGS FORM
// ─────────────────────────────────────────────────────────────
const SettingsForm = ({ company, companyId, onCancel }) => {
    const mutation = useUpdateCompanySettings(companyId);
    const [form, setForm] = useState({
        workingHoursPerDay: company.workingHoursPerDay ?? 8,
        workingDaysPerWeek: company.workingDaysPerWeek ?? 5,
        annualLeaveQuota: company.annualLeaveQuota ?? 21,
        timezone: company.timezone ?? 'Asia/Kolkata',
        currency: company.currency ?? 'INR',
        fiscalYearStart: company.fiscalYearStart ?? 4,
    });

    const num = (k) => (e) => setForm(p => ({ ...p, [k]: Number(e.target.value) }));
    const str = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = (ev) => {
        ev.preventDefault();
        mutation.mutate(form, { onSuccess: onCancel });
    };

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Working Hours / Day</label>
                    <input type="number" min={1} max={24} step={0.5}
                        value={form.workingHoursPerDay} onChange={num('workingHoursPerDay')}
                        className={inputCls(false)} />
                </div>
                <div>
                    <label className={labelCls}>Working Days / Week</label>
                    <input type="number" min={1} max={7}
                        value={form.workingDaysPerWeek} onChange={num('workingDaysPerWeek')}
                        className={inputCls(false)} />
                </div>
                <div>
                    <label className={labelCls}>Annual Leave Quota (days)</label>
                    <input type="number" min={0} max={365}
                        value={form.annualLeaveQuota} onChange={num('annualLeaveQuota')}
                        className={inputCls(false)} />
                </div>
                <div>
                    <label className={labelCls}>Fiscal Year Start</label>
                    <select value={form.fiscalYearStart} onChange={num('fiscalYearStart')} className={inputCls(false)}>
                        {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Timezone</label>
                    <input type="text" value={form.timezone} onChange={str('timezone')}
                        className={inputCls(false)} placeholder="Asia/Kolkata" />
                </div>
                <div>
                    <label className={labelCls}>Currency</label>
                    <input type="text" value={form.currency} onChange={str('currency')}
                        className={inputCls(false)} placeholder="INR" maxLength={10} />
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl disabled:opacity-50"
                >
                    {mutation.isPending
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
                        : <><Save className="w-4 h-4" /> Save settings</>}
                </button>
                <button type="button" onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl">
                    <X className="w-4 h-4" /> Cancel
                </button>
            </div>
        </form>
    );
};

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CompanyPage() {
    const { user } = useAuth();

    // In your AuthContext, company id comes from user.companyId
    // Adjust this line if your context uses a different field
    const companyId = user?.companyId ?? null;

    const [editProfile, setEditProfile] = useState(false);
    const [editSettings, setEditSettings] = useState(false);

    const { data: company, isLoading: loadingCompany, isError: errCompany } = useCompany(companyId);
    const { data: statsData, isLoading: loadingStats } = useCompanyStats(companyId);

    const isAdmin = ['admin', 'hr'].includes(user?.primaryRole?.toLowerCase());

    if (!companyId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No company linked to your account.</p>
                </div>
            </div>
        );
    }

    if (loadingCompany) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (errCompany || !company) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Failed to load company data.</p>
                </div>
            </div>
        );
    }

    const stats = statsData?.stats ?? {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">

                {/* ── HERO HEADER ───────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl text-white p-6 sm:p-8 mb-6 overflow-hidden shadow-xl"
                >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">

                        {/* logo */}
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {company.logoUrl
                                ? <img src={company.logoUrl} alt="logo" className="w-full h-full object-contain p-2" />
                                : <Building2 className="w-10 h-10 text-white/80" />
                            }
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                <h1 className="text-2xl sm:text-3xl font-bold">{company.name}</h1>
                                {company.isVerified && (
                                    <BadgeCheck className="w-6 h-6 text-blue-300" title="Verified" />
                                )}
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                  ${PLAN_BADGE[company.subscriptionPlan] ?? PLAN_BADGE.free}`}>
                                    {company.subscriptionPlan} plan
                                </span>
                                {company.industry && (
                                    <span className="px-3 py-1 rounded-full text-xs bg-white/20 backdrop-blur-sm">
                                        {company.industry}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm
                  ${company.isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                    {company.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI STATS ─────────────────────────────────────── */}
                {!loadingStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                    >
                        <StatTile label="Total Employees" value={stats.totalEmployees ?? '—'} icon={Users} color="indigo" />
                        <StatTile label="Active Employees" value={stats.activeEmployees ?? '—'} icon={CheckCircle} color="emerald" />
                        <StatTile label="Total Payroll" value={fmt(stats.totalPayroll)} icon={DollarSign} color="amber" />
                    </motion.div>
                )}

                {/* ── LOGO UPLOAD (admin/hr only) ───────────────────── */}
                {isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                        <Section title="Company Logo" icon={Building2}>
                            <LogoUploader company={company} companyId={companyId} />
                        </Section>
                    </motion.div>
                )}

                {/* ── COMPANY PROFILE ──────────────────────────────── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Section
                        title="Company Profile"
                        icon={Building2}
                        action={isAdmin && !editProfile && (
                            <button
                                onClick={() => setEditProfile(true)}
                                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                        )}
                    >
                        {editProfile ? (
                            <ProfileForm
                                company={company}
                                companyId={companyId}
                                onCancel={() => setEditProfile(false)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: Mail, label: 'Email', value: company.email },
                                    { icon: Phone, label: 'Phone', value: company.phone },
                                    { icon: Globe, label: 'Website', value: company.website, link: true },
                                    { icon: Building2, label: 'Size', value: company.size ? `${company.size} employees` : null },
                                    { icon: MapPin, label: 'City', value: company.city },
                                    { icon: MapPin, label: 'Country', value: company.country },
                                ].map(({ icon: Icon, label, value, link }) =>
                                    value ? (
                                        <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                                            <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                                {link
                                                    ? <a href={value} target="_blank" rel="noreferrer"
                                                        className="text-sm font-medium text-indigo-600 hover:underline">{value}</a>
                                                    : <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                                                }
                                            </div>
                                        </div>
                                    ) : null
                                )}

                                {/* full address */}
                                {company.addressLine1 && (
                                    <div className="sm:col-span-2 flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {[company.addressLine1, company.addressLine2, company.city,
                                                company.state, company.postalCode, company.country]
                                                    .filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                </motion.div>

                {/* ── HR SETTINGS (admin only) ─────────────────────── */}
                {isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                        <Section
                            title="HR & Payroll Settings"
                            icon={Settings}
                            action={!editSettings && (
                                <button
                                    onClick={() => setEditSettings(true)}
                                    className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                            )}
                        >
                            {editSettings ? (
                                <SettingsForm
                                    company={company}
                                    companyId={companyId}
                                    onCancel={() => setEditSettings(false)}
                                />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { icon: Clock, label: 'Working Hours / Day', value: `${company.workingHoursPerDay}h` },
                                        { icon: Calendar, label: 'Working Days / Week', value: `${company.workingDaysPerWeek} days` },
                                        { icon: Shield, label: 'Annual Leave Quota', value: `${company.annualLeaveQuota} days` },
                                        { icon: TrendingUp, label: 'Fiscal Year Start', value: new Date(2000, (company.fiscalYearStart ?? 4) - 1, 1).toLocaleString('en-IN', { month: 'long' }) },
                                        { icon: Globe, label: 'Timezone', value: company.timezone },
                                        { icon: DollarSign, label: 'Currency', value: company.currency },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl">
                                            <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
