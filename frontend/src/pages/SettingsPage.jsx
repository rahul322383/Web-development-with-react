import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import {
    Save, Loader2, CheckCircle2, Search, Settings2,
    Palette, Clock, DollarSign, Shield, Users, Bell,
    MapPin, FileText, BarChart2, Zap, Globe, Link,
    TrendingUp, GitBranch, Monitor, Calendar, Briefcase,
    CreditCard, Bot, Building2, Sun, Moon, Monitor as MonitorIcon
} from 'lucide-react';
import { toast } from 'sonner';
import settingsAPI from '../api/settings.api';

// -----------------------------------------------------------------------------
// CATEGORY META
// -----------------------------------------------------------------------------

const CATEGORY_META = {
    company: { label: 'Company', icon: Building2 },
    employee: { label: 'Employee', icon: Users },
    appearance: { label: 'Appearance', icon: Palette },
    attendance: { label: 'Attendance', icon: Clock },
    leave: { label: 'Leave', icon: Calendar },
    payroll: { label: 'Payroll', icon: DollarSign },
    notification: { label: 'Notification', icon: Bell },
    security: { label: 'Security', icon: Shield },
    shift: { label: 'Shift', icon: Clock },
    geo: { label: 'Geo', icon: MapPin },
    document: { label: 'Document', icon: FileText },
    appraisal: { label: 'Appraisal', icon: BarChart2 },
    recruitment: { label: 'Recruitment', icon: Briefcase },
    expense: { label: 'Expense', icon: CreditCard },
    ai: { label: 'AI', icon: Bot },
    integration: { label: 'Integration', icon: Link },
    localization: { label: 'Localization', icon: Globe },
    analytics: { label: 'Analytics', icon: TrendingUp },
    workflow: { label: 'Workflow', icon: GitBranch },
    system: { label: 'System', icon: Monitor },
};

// -----------------------------------------------------------------------------
// SETTINGS SCHEMA
// -----------------------------------------------------------------------------

const SETTINGS_SCHEMA = {
    company_name: { category: 'company', label: 'Company Name', type: 'text', defaultValue: '' },
    company_email: { category: 'company', label: 'Company Email', type: 'text', defaultValue: '' },
    timezone: {
        category: 'company', label: 'Timezone', type: 'select', defaultValue: 'Asia/Kolkata',
        options: [
            { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
            { label: 'UTC', value: 'UTC' },
            { label: 'America/New_York (EST)', value: 'America/New_York' },
            { label: 'Europe/London (GMT)', value: 'Europe/London' },
        ],
    },
    currency: {
        category: 'company', label: 'Currency', type: 'select', defaultValue: 'INR',
        options: [{ label: 'INR ₹', value: 'INR' }, { label: 'USD $', value: 'USD' }, { label: 'EUR €', value: 'EUR' }],
    },
    date_format: {
        category: 'company', label: 'Date Format', type: 'select', defaultValue: 'DD/MM/YYYY',
        options: [{ label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' }, { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }, { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }],
    },
    language: {
        category: 'company', label: 'Language', type: 'select', defaultValue: 'en',
        options: [{ label: 'English', value: 'en' }, { label: 'Hindi', value: 'hi' }],
    },
    fiscal_year_start: {
        category: 'company', label: 'Fiscal Year Start', type: 'select', defaultValue: 'April',
        options: ['January', 'April', 'July', 'October'].map(m => ({ label: m, value: m })),
    },
    employee_code_prefix: { category: 'employee', label: 'Employee Code Prefix', type: 'text', defaultValue: 'EMP' },
    auto_generate_employee_id: { category: 'employee', label: 'Auto Generate Employee ID', type: 'toggle', defaultValue: true },
    probation_period_days: { category: 'employee', label: 'Probation Period (days)', type: 'number', defaultValue: 90 },
    allow_profile_edit: { category: 'employee', label: 'Allow Profile Edit', type: 'toggle', defaultValue: true },
    theme: {
        category: 'appearance', label: 'Theme', type: 'select', defaultValue: 'system',
        options: [
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
            { label: 'System', value: 'system' },
        ],
    },
    compact_mode: { category: 'appearance', label: 'Compact Mode', type: 'toggle', defaultValue: false },
    sidebar_collapsed: { category: 'appearance', label: 'Sidebar Collapsed', type: 'toggle', defaultValue: false },
    primary_color: { category: 'appearance', label: 'Primary Color', type: 'color', defaultValue: '#4F46E5' },
    grace_period: { category: 'attendance', label: 'Grace Period (mins)', type: 'number', defaultValue: 10 },
    late_mark_minutes: { category: 'attendance', label: 'Late Mark After (mins)', type: 'number', defaultValue: 30 },
    half_day_minutes: { category: 'attendance', label: 'Half Day Minutes', type: 'number', defaultValue: 240 },
    geo_fencing_enabled: { category: 'attendance', label: 'Geo Fencing', type: 'toggle', defaultValue: false },
    face_recognition_required: { category: 'attendance', label: 'Face Recognition Required', type: 'toggle', defaultValue: false },
    overtime_enabled: { category: 'attendance', label: 'Overtime Enabled', type: 'toggle', defaultValue: false },
    carry_forward_enabled: { category: 'leave', label: 'Carry Forward Enabled', type: 'toggle', defaultValue: true },
    max_carry_forward_days: { category: 'leave', label: 'Max Carry Forward (days)', type: 'number', defaultValue: 10 },
    sandwich_leave_enabled: { category: 'leave', label: 'Sandwich Leave', type: 'toggle', defaultValue: false },
    leave_approval_levels: { category: 'leave', label: 'Approval Levels', type: 'number', defaultValue: 1 },
    negative_leave_allowed: { category: 'leave', label: 'Negative Leave Allowed', type: 'toggle', defaultValue: false },
    salary_cycle: {
        category: 'payroll', label: 'Salary Cycle', type: 'select', defaultValue: 'monthly',
        options: [{ label: 'Monthly', value: 'monthly' }, { label: 'Weekly', value: 'weekly' }],
    },
    tax_enabled: { category: 'payroll', label: 'Tax Enabled', type: 'toggle', defaultValue: true },
    pf_enabled: { category: 'payroll', label: 'PF Enabled', type: 'toggle', defaultValue: true },
    esi_enabled: { category: 'payroll', label: 'ESI Enabled', type: 'toggle', defaultValue: false },
    bonus_enabled: { category: 'payroll', label: 'Bonus Enabled', type: 'toggle', defaultValue: false },
    auto_generate_payslip: { category: 'payroll', label: 'Auto Generate Payslip', type: 'toggle', defaultValue: true },
    email_notifications: { category: 'notification', label: 'Email Notifications', type: 'toggle', defaultValue: true },
    push_notifications: { category: 'notification', label: 'Push Notifications', type: 'toggle', defaultValue: true },
    sms_notifications: { category: 'notification', label: 'SMS Notifications', type: 'toggle', defaultValue: false },
    birthday_reminders: { category: 'notification', label: 'Birthday Reminders', type: 'toggle', defaultValue: true },
    attendance_alerts: { category: 'notification', label: 'Attendance Alerts', type: 'toggle', defaultValue: true },
    two_factor_auth: { category: 'security', label: 'Two-Factor Auth', type: 'toggle', defaultValue: false },
    password_expiry_days: { category: 'security', label: 'Password Expiry (days)', type: 'number', defaultValue: 90 },
    max_login_attempts: { category: 'security', label: 'Max Login Attempts', type: 'number', defaultValue: 5 },
    session_timeout_minutes: { category: 'security', label: 'Session Timeout (mins)', type: 'number', defaultValue: 30 },
    default_shift: { category: 'shift', label: 'Default Shift', type: 'text', defaultValue: 'General' },
    night_shift_allowance: { category: 'shift', label: 'Night Shift Allowance', type: 'toggle', defaultValue: false },
    rotational_shift_enabled: { category: 'shift', label: 'Rotational Shift', type: 'toggle', defaultValue: false },
    gps_tracking_enabled: { category: 'geo', label: 'GPS Tracking', type: 'toggle', defaultValue: false },
    allowed_radius_meters: { category: 'geo', label: 'Allowed Radius (m)', type: 'number', defaultValue: 200 },
    work_from_home_enabled: { category: 'geo', label: 'Work From Home Enabled', type: 'toggle', defaultValue: true },
    max_upload_size_mb: { category: 'document', label: 'Max Upload Size (MB)', type: 'number', defaultValue: 10 },
    document_expiry_alert_days: { category: 'document', label: 'Expiry Alert Before (days)', type: 'number', defaultValue: 30 },
    appraisal_cycle: {
        category: 'appraisal', label: 'Appraisal Cycle', type: 'select', defaultValue: 'yearly',
        options: [{ label: 'Yearly', value: 'yearly' }, { label: 'Half-Yearly', value: 'half-yearly' }, { label: 'Quarterly', value: 'quarterly' }],
    },
    self_review_enabled: { category: 'appraisal', label: 'Self Review', type: 'toggle', defaultValue: true },
    manager_review_enabled: { category: 'appraisal', label: 'Manager Review', type: 'toggle', defaultValue: true },
    rating_scale_max: { category: 'appraisal', label: 'Rating Scale Max', type: 'number', defaultValue: 5 },
    auto_assign_interviewer: { category: 'recruitment', label: 'Auto Assign Interviewer', type: 'toggle', defaultValue: false },
    candidate_resume_required: { category: 'recruitment', label: 'Resume Required', type: 'toggle', defaultValue: true },
    offer_letter_approval_required: { category: 'recruitment', label: 'Offer Letter Approval', type: 'toggle', defaultValue: true },
    expense_approval_levels: { category: 'expense', label: 'Approval Levels', type: 'number', defaultValue: 1 },
    max_claim_amount: { category: 'expense', label: 'Max Claim Amount', type: 'number', defaultValue: 50000 },
    receipt_required: { category: 'expense', label: 'Receipt Required', type: 'toggle', defaultValue: true },
    ai_resume_screening: { category: 'ai', label: 'AI Resume Screening', type: 'toggle', defaultValue: false },
    auto_leave_prediction: { category: 'ai', label: 'Auto Leave Prediction', type: 'toggle', defaultValue: false },
    chatbot_enabled: { category: 'ai', label: 'Chatbot Enabled', type: 'toggle', defaultValue: false },
    slack_enabled: { category: 'integration', label: 'Slack', type: 'toggle', defaultValue: false },
    google_calendar_sync: { category: 'integration', label: 'Google Calendar', type: 'toggle', defaultValue: false },
    zoom_integration: { category: 'integration', label: 'Zoom', type: 'toggle', defaultValue: false },
    country: { category: 'localization', label: 'Country', type: 'text', defaultValue: 'India' },
    holiday_calendar: {
        category: 'localization', label: 'Holiday Calendar', type: 'select', defaultValue: 'IN',
        options: [{ label: 'India (IN)', value: 'IN' }, { label: 'US', value: 'US' }, { label: 'UK', value: 'UK' }],
    },
    currency_symbol: { category: 'localization', label: 'Currency Symbol', type: 'text', defaultValue: '₹' },
    dashboard_refresh_interval: { category: 'analytics', label: 'Dashboard Refresh (mins)', type: 'number', defaultValue: 5 },
    allow_data_export: { category: 'analytics', label: 'Allow Data Export', type: 'toggle', defaultValue: true },
    chart_theme: {
        category: 'analytics', label: 'Chart Theme', type: 'select', defaultValue: 'modern',
        options: [{ label: 'Modern', value: 'modern' }, { label: 'Classic', value: 'classic' }, { label: 'Minimal', value: 'minimal' }],
    },
    multi_level_approval: { category: 'workflow', label: 'Multi Level Approval', type: 'toggle', defaultValue: false },
    auto_escalation_enabled: { category: 'workflow', label: 'Auto Escalation', type: 'toggle', defaultValue: false },
    approval_timeout_days: { category: 'workflow', label: 'Approval Timeout (days)', type: 'number', defaultValue: 3 },
    maintenance_mode: { category: 'system', label: 'Maintenance Mode', type: 'toggle', defaultValue: false },
    debug_logging: { category: 'system', label: 'Debug Logging', type: 'toggle', defaultValue: false },
    api_rate_limit: { category: 'system', label: 'API Rate Limit', type: 'number', defaultValue: 100 },
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const getDatatype = (v) =>
    typeof v === 'boolean' ? 'boolean'
        : typeof v === 'number' ? 'number'
            : typeof v === 'object' ? 'json'
                : 'string';

const buildInitialState = () => {
    const obj = {};
    Object.entries(SETTINGS_SCHEMA).forEach(([k, v]) => { obj[k] = v.defaultValue; });
    return obj;
};

// -----------------------------------------------------------------------------
// GLOBAL THEME HOOK
// -----------------------------------------------------------------------------

const useThemeSync = (theme) => {
    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = (mode) => {
            if (mode === 'dark') {
                root.classList.add('dark');
                root.classList.remove('light');
            } else {
                root.classList.add('light');
                root.classList.remove('dark');
            }
        };

        if (theme === 'dark') {
            applyTheme('dark');
            return;
        }
        if (theme === 'light') {
            applyTheme('light');
            return;
        }

        // System preference
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e) => applyTheme(e.matches ? 'dark' : 'light');

        applyTheme(mq.matches ? 'dark' : 'light');
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [theme]);
};

// -----------------------------------------------------------------------------
// SETTING ROW
// -----------------------------------------------------------------------------

const SettingRow = memo(({ settingKey, config, value, isChanged, onChange }) => {
    const baseInputClass =
        'w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 ' +
        'rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ' +
        'dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500';

    const renderInput = () => {
        switch (config.type) {
            case 'toggle':
                return (
                    <button
                        onClick={() => onChange(settingKey, !value)}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-700'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                );

            case 'select':
                return (
                    <select value={value} onChange={(e) => onChange(settingKey, e.target.value)} className={baseInputClass}>
                        {config.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                );

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(settingKey, e.target.value)}
                            className="h-10 w-16 cursor-pointer rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent p-0.5"
                        />
                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{value}</span>
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => onChange(settingKey, Number(e.target.value))}
                        className={baseInputClass}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(settingKey, e.target.value)}
                        className={baseInputClass}
                    />
                );
        }
    };

    return (
        <div
            className={`group border rounded-2xl p-4 sm:p-5 transition-all ${isChanged
                    ? 'border-amber-400 bg-amber-50/50 dark:border-amber-600/40 dark:bg-amber-900/10'
                    : 'border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-white dark:bg-slate-900'
                }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Settings2 className="w-4 h-4 shrink-0 text-indigo-500" />
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{config.label}</h3>
                        {isChanged ? (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                Modified
                            </span>
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 font-mono truncate">{settingKey}</p>
                </div>
                <div className="w-full sm:w-64 shrink-0 flex justify-start sm:justify-end">
                    {renderInput()}
                </div>
            </div>
        </div>
    );
});

// -----------------------------------------------------------------------------
// MAIN SETTINGS PAGE
// -----------------------------------------------------------------------------

const SettingsPage = () => {
    const [settings, setSettings] = useState(buildInitialState);
    const [originalSettings, setOriginalSettings] = useState(buildInitialState);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('company');

    // Sync theme to HTML element
    useThemeSync(settings.theme);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await settingsAPI.getAll({ scopeType: 'company', scopeId: 1 });
            const data = response?.data || [];
            const formatted = buildInitialState();
            data.forEach(item => {
                if (Object.prototype.hasOwnProperty.call(formatted, item.key)) {
                    formatted[item.key] = item.value;
                }
            });
            setSettings(formatted);
            setOriginalSettings(structuredClone(formatted));
        } catch {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ── Change handler ─────────────────────────────────────────────────────────
    const handleChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    // ── Has changes ────────────────────────────────────────────────────────────
    const hasChanges = useMemo(
        () => Object.keys(settings).some(k => settings[k] !== originalSettings[k]),
        [settings, originalSettings]
    );

    // ── Save ───────────────────────────────────────────────────────────────────
    const saveAll = async () => {
        try {
            setSaving(true);
            const changed = Object.entries(settings).filter(([k, v]) => v !== originalSettings[k]);
            if (!changed.length) return;

            const payload = {
                settings: changed.map(([key, value]) => ({
                    scopeType: 'company',
                    scopeId: 1,
                    category: SETTINGS_SCHEMA[key]?.category || 'custom',
                    key,
                    value,
                    datatype: getDatatype(value),
                })),
            };

            await settingsAPI.updateMany(payload);
            setOriginalSettings(structuredClone(settings));
            toast.success('Settings saved successfully');
        } catch {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // ── Filtered list ──────────────────────────────────────────────────────────
    const filteredSettings = useMemo(() => {
        const q = search.toLowerCase();
        return Object.entries(SETTINGS_SCHEMA).filter(([key, config]) => {
            if (config.category !== activeCategory) return false;
            if (!q) return true;
            return key.toLowerCase().includes(q) || config.label.toLowerCase().includes(q);
        });
    }, [activeCategory, search]);

    // ── Category counts ────────────────────────────────────────────────────────
    const changedCounts = useMemo(() => {
        const counts = {};
        Object.entries(SETTINGS_SCHEMA).forEach(([key, config]) => {
            if (settings[key] !== originalSettings[key]) {
                counts[config.category] = (counts[config.category] || 0) + 1;
            }
        });
        return counts;
    }, [settings, originalSettings]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 animate-pulse text-sm">Loading configuration…</p>
            </div>
        );

    const ActiveIcon = CATEGORY_META[activeCategory]?.icon || Settings2;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings2 className="w-7 h-7 text-indigo-600" />
                            Settings
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                            Configure your HRMS workspace — {Object.keys(SETTINGS_SCHEMA).length} options across {Object.keys(CATEGORY_META).length} categories
                        </p>
                    </div>
                    <button
                        onClick={saveAll}
                        disabled={!hasChanges || saving}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none transition-all text-sm font-medium"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                        {hasChanges && (
                            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {Object.values(changedCounts).reduce((a, b) => a + b, 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* SEARCH */}
                <div className="relative group mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search settings by name or key…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white placeholder:text-gray-400 transition-shadow shadow-sm"
                    />
                </div>

                {/* MAIN CONTENT: sidebar + settings */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* SIDEBAR CATEGORIES */}
                    <nav className="lg:w-56 shrink-0">
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-thin">
                            {Object.entries(CATEGORY_META).map(([cat, { label, icon: Icon }]) => {
                                const isActive = activeCategory === cat;
                                const count = changedCounts[cat];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => { setActiveCategory(cat); setSearch(''); }}
                                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap w-full text-left ${isActive
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        <span className="flex-1">{label}</span>
                                        {count > 0 && (
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                    }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* SETTINGS PANEL */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-4">
                            <ActiveIcon className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white capitalize">
                                {CATEGORY_META[activeCategory]?.label}
                            </h2>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                {filteredSettings.length} setting{filteredSettings.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="grid gap-3">
                            {filteredSettings.length > 0 ? (
                                filteredSettings.map(([key, config]) => (
                                    <SettingRow
                                        key={key}
                                        settingKey={key}
                                        config={config}
                                        value={settings[key]}
                                        isChanged={settings[key] !== originalSettings[key]}
                                        onChange={handleChange}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800">
                                    <Search className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">No settings match your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;