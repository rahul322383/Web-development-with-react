// // src/pages/SettingsPage.jsx
// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import settingsAPI from '../api/settings.api';
// import { toast } from 'sonner';
// import {
//     Save,
//     RotateCcw,
//     Trash2,
//     Moon,
//     Globe,
//     Bell,
//     Clock,
//     Type,
//     AlertCircle,
//     Loader2,
//     Plus,
//     X,
//     Settings2,
//     CheckCircle2,
//     Calendar,
//     DollarSign,
//     Building2,
//     UserCheck,
//     Timer,
//     Briefcase,
//     Users,
//     Mail,
//     Phone,
//     MapPin,
//     Key,
//     Shield,
//     Eye,
//     EyeOff,
// } from 'lucide-react';

// // -----------------------------------------------------------------------------
// // Comprehensive HRMS Settings Schema
// // Categories: Appearance, Attendance, Leave, Payroll, Company, Notifications,
// //             Security, Recruitment, Performance
// // -----------------------------------------------------------------------------
// const KNOWN_SETTINGS = {
//     // -------------------- Appearance --------------------
//     theme: {
//         label: 'Theme',
//         category: 'Appearance',
//         icon: Moon,
//         type: 'select',
//         options: [
//             { value: 'light', label: 'Light' },
//             { value: 'dark', label: 'Dark' },
//             { value: 'system', label: 'System' },
//         ],
//         description: 'Choose your preferred color scheme',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },
//     language: {
//         label: 'Language',
//         category: 'Appearance',
//         icon: Globe,
//         type: 'select',
//         options: [
//             { value: 'en', label: 'English' },
//             { value: 'es', label: 'Spanish' },
//             { value: 'fr', label: 'French' },
//             { value: 'de', label: 'German' },
//             { value: 'hi', label: 'Hindi' },
//         ],
//         description: 'Select your interface language',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },
//     fontSize: {
//         label: 'Font Size',
//         category: 'Appearance',
//         icon: Type,
//         type: 'number',
//         min: 12,
//         max: 20,
//         step: 1,
//         description: 'Base font size in pixels',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },
//     compactMode: {
//         label: 'Compact Mode',
//         category: 'Appearance',
//         icon: Settings2,
//         type: 'toggle',
//         description: 'Reduce spacing and padding',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },

//     // -------------------- Attendance --------------------
//     office_start_time: {
//         label: 'Office Start Time',
//         category: 'Attendance',
//         icon: Clock,
//         type: 'time',
//         description: 'Default work day start time',
//         editableBy: ['admin', 'hr'],
//     },
//     office_end_time: {
//         label: 'Office End Time',
//         category: 'Attendance',
//         icon: Clock,
//         type: 'time',
//         description: 'Default work day end time',
//         editableBy: ['admin', 'hr'],
//     },
//     late_mark_after: {
//         label: 'Late Mark After (minutes)',
//         category: 'Attendance',
//         icon: Timer,
//         type: 'number',
//         min: 0,
//         max: 120,
//         description: 'Minutes after start time to mark late',
//         editableBy: ['admin', 'hr'],
//     },
//     half_day_hours: {
//         label: 'Half Day Hours',
//         category: 'Attendance',
//         icon: Timer,
//         type: 'number',
//         min: 1,
//         max: 8,
//         description: 'Minimum hours for half‑day attendance',
//         editableBy: ['admin', 'hr'],
//     },
//     allow_geo_fencing: {
//         label: 'Enable Geo‑Fencing',
//         category: 'Attendance',
//         icon: MapPin,
//         type: 'toggle',
//         description: 'Require location for check‑in/out',
//         editableBy: ['admin', 'hr'],
//     },
//     geo_fence_radius: {
//         label: 'Geo‑Fence Radius (meters)',
//         category: 'Attendance',
//         icon: MapPin,
//         type: 'number',
//         min: 50,
//         max: 1000,
//         description: 'Allowed distance from office location',
//         editableBy: ['admin', 'hr'],
//     },

//     // -------------------- Leave --------------------
//     max_leaves_per_year: {
//         label: 'Max Leaves Per Year',
//         category: 'Leave',
//         icon: Calendar,
//         type: 'number',
//         min: 0,
//         max: 365,
//         description: 'Total paid leaves allowed annually',
//         editableBy: ['admin', 'hr'],
//     },
//     carry_forward_limit: {
//         label: 'Carry Forward Limit',
//         category: 'Leave',
//         icon: Calendar,
//         type: 'number',
//         min: 0,
//         max: 365,
//         description: 'Max leaves that can be carried forward',
//         editableBy: ['admin', 'hr'],
//     },
//     leave_approval_required: {
//         label: 'Leave Approval Required',
//         category: 'Leave',
//         icon: UserCheck,
//         type: 'toggle',
//         description: 'Require manager approval for leave requests',
//         editableBy: ['admin', 'hr'],
//     },
//     sick_leave_separate: {
//         label: 'Separate Sick Leave Pool',
//         category: 'Leave',
//         icon: Briefcase,
//         type: 'toggle',
//         description: 'Maintain separate sick leave balance',
//         editableBy: ['admin', 'hr'],
//     },
//     sick_leave_days: {
//         label: 'Sick Leave Days',
//         category: 'Leave',
//         icon: Briefcase,
//         type: 'number',
//         min: 0,
//         max: 30,
//         description: 'Annual sick leave entitlement',
//         editableBy: ['admin', 'hr'],
//     },

//     // -------------------- Payroll --------------------
//     salary_cycle: {
//         label: 'Salary Cycle',
//         category: 'Payroll',
//         icon: DollarSign,
//         type: 'select',
//         options: [
//             { value: 'monthly', label: 'Monthly' },
//             { value: 'bi-weekly', label: 'Bi‑Weekly' },
//             { value: 'weekly', label: 'Weekly' },
//         ],
//         description: 'Frequency of salary disbursement',
//         editableBy: ['admin'],
//     },
//     payday: {
//         label: 'Payday',
//         category: 'Payroll',
//         icon: Calendar,
//         type: 'number',
//         min: 1,
//         max: 31,
//         description: 'Day of month/week for salary credit',
//         editableBy: ['admin'],
//     },
//     pf_enabled: {
//         label: 'Provident Fund (PF) Enabled',
//         category: 'Payroll',
//         icon: Shield,
//         type: 'toggle',
//         description: 'Enable PF deductions',
//         editableBy: ['admin'],
//     },
//     pf_percentage: {
//         label: 'PF Contribution (%)',
//         category: 'Payroll',
//         icon: Shield,
//         type: 'number',
//         min: 0,
//         max: 20,
//         step: 0.5,
//         description: 'Employee PF contribution percentage',
//         editableBy: ['admin'],
//     },
//     tax_enabled: {
//         label: 'Tax Deduction Enabled',
//         category: 'Payroll',
//         icon: DollarSign,
//         type: 'toggle',
//         description: 'Enable automatic tax calculation',
//         editableBy: ['admin'],
//     },
//     overtime_pay_multiplier: {
//         label: 'Overtime Pay Multiplier',
//         category: 'Payroll',
//         icon: Timer,
//         type: 'number',
//         min: 1.0,
//         max: 3.0,
//         step: 0.1,
//         description: 'Hourly rate multiplier for overtime',
//         editableBy: ['admin'],
//     },

//     // -------------------- Company --------------------
//     company_name: {
//         label: 'Company Name',
//         category: 'Company',
//         icon: Building2,
//         type: 'text',
//         description: 'Official registered name',
//         editableBy: ['admin'],
//     },
//     company_email: {
//         label: 'Company Email',
//         category: 'Company',
//         icon: Mail,
//         type: 'text',
//         description: 'Primary contact email',
//         editableBy: ['admin'],
//     },
//     company_phone: {
//         label: 'Company Phone',
//         category: 'Company',
//         icon: Phone,
//         type: 'text',
//         description: 'Primary contact number',
//         editableBy: ['admin'],
//     },
//     company_address: {
//         label: 'Company Address',
//         category: 'Company',
//         icon: MapPin,
//         type: 'text',
//         description: 'Registered office address',
//         editableBy: ['admin'],
//     },
//     company_timezone: {
//         label: 'Company Timezone',
//         category: 'Company',
//         icon: Clock,
//         type: 'select',
//         options: (() => {
//             if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
//                 return Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }));
//             }
//             return [
//                 { value: 'UTC', label: 'UTC' },
//                 { value: 'America/New_York', label: 'Eastern Time' },
//                 { value: 'Asia/Kolkata', label: 'India Standard Time' },
//                 { value: 'Europe/London', label: 'London' },
//             ];
//         })(),
//         description: 'Default timezone for company operations',
//         editableBy: ['admin'],
//     },
//     fiscal_year_start: {
//         label: 'Fiscal Year Start',
//         category: 'Company',
//         icon: Calendar,
//         type: 'date',
//         description: 'Start date of financial year (MM‑DD)',
//         editableBy: ['admin'],
//     },

//     // -------------------- Notifications --------------------
//     email_notifications: {
//         label: 'Email Notifications',
//         category: 'Notifications',
//         icon: Mail,
//         type: 'toggle',
//         description: 'Send email alerts for important events',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },
//     push_notifications: {
//         label: 'Push Notifications',
//         category: 'Notifications',
//         icon: Bell,
//         type: 'toggle',
//         description: 'Send browser/device push alerts',
//         editableBy: ['admin', 'hr', 'manager', 'employee'],
//     },
//     notify_on_leave_request: {
//         label: 'Notify on Leave Request',
//         category: 'Notifications',
//         icon: Calendar,
//         type: 'toggle',
//         description: 'Alert managers when leave is requested',
//         editableBy: ['admin', 'hr', 'manager'],
//     },
//     notify_on_attendance_anomaly: {
//         label: 'Notify on Attendance Anomaly',
//         category: 'Notifications',
//         icon: AlertCircle,
//         type: 'toggle',
//         description: 'Alert HR on late/missing check‑ins',
//         editableBy: ['admin', 'hr'],
//     },

//     // -------------------- Security --------------------
//     two_factor_auth: {
//         label: 'Two‑Factor Authentication',
//         category: 'Security',
//         icon: Shield,
//         type: 'toggle',
//         description: 'Require 2FA for all users',
//         editableBy: ['admin'],
//     },
//     session_timeout_minutes: {
//         label: 'Session Timeout (minutes)',
//         category: 'Security',
//         icon: Timer,
//         type: 'number',
//         min: 5,
//         max: 480,
//         description: 'Auto logout after inactivity',
//         editableBy: ['admin'],
//     },
//     password_expiry_days: {
//         label: 'Password Expiry (days)',
//         category: 'Security',
//         icon: Key,
//         type: 'number',
//         min: 0,
//         max: 365,
//         description: 'Force password change after N days (0 = never)',
//         editableBy: ['admin'],
//     },
//     allow_social_login: {
//         label: 'Allow Social Login',
//         category: 'Security',
//         icon: Users,
//         type: 'toggle',
//         description: 'Enable Google/Microsoft SSO',
//         editableBy: ['admin'],
//     },

//     // -------------------- Recruitment --------------------
//     auto_archive_candidates_days: {
//         label: 'Auto‑archive Candidates (days)',
//         category: 'Recruitment',
//         icon: Briefcase,
//         type: 'number',
//         min: 30,
//         max: 365,
//         description: 'Days after which inactive candidates are archived',
//         editableBy: ['admin', 'hr'],
//     },
//     require_offer_approval: {
//         label: 'Require Offer Approval',
//         category: 'Recruitment',
//         icon: UserCheck,
//         type: 'toggle',
//         description: 'Offers need second‑level approval',
//         editableBy: ['admin', 'hr'],
//     },
//     default_interview_duration: {
//         label: 'Default Interview Duration (mins)',
//         category: 'Recruitment',
//         icon: Clock,
//         type: 'number',
//         min: 15,
//         max: 120,
//         step: 15,
//         description: 'Default slot length for interviews',
//         editableBy: ['admin', 'hr'],
//     },

//     // -------------------- Performance --------------------
//     review_cycle_months: {
//         label: 'Review Cycle (months)',
//         category: 'Performance',
//         icon: Calendar,
//         type: 'number',
//         min: 3,
//         max: 12,
//         description: 'Frequency of performance reviews',
//         editableBy: ['admin', 'hr'],
//     },
//     self_appraisal_enabled: {
//         label: 'Self Appraisal Enabled',
//         category: 'Performance',
//         icon: Eye,
//         type: 'toggle',
//         description: 'Allow employees to self‑evaluate',
//         editableBy: ['admin', 'hr'],
//     },
//     peer_review_enabled: {
//         label: 'Peer Review Enabled',
//         category: 'Performance',
//         icon: Users,
//         type: 'toggle',
//         description: 'Include peer feedback in reviews',
//         editableBy: ['admin', 'hr'],
//     },
//     rating_scale_max: {
//         label: 'Rating Scale Maximum',
//         category: 'Performance',
//         icon: Settings2,
//         type: 'number',
//         min: 3,
//         max: 10,
//         description: 'Highest possible performance rating',
//         editableBy: ['admin', 'hr'],
//     },
// };

// // -----------------------------------------------------------------------------
// // Helper to infer type for unknown settings
// // -----------------------------------------------------------------------------
// const inferInputType = (value) => {
//     if (typeof value === 'boolean') return 'toggle';
//     if (typeof value === 'number') return 'number';
//     return 'text';
// };

// // -----------------------------------------------------------------------------
// // Main Component
// // -----------------------------------------------------------------------------
// const SettingsPage = () => {
//     const { isAuthenticated, user } = useAuth();
//     const [settings, setSettings] = useState({});
//     const [originalSettings, setOriginalSettings] = useState({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [error, setError] = useState(null);
//     const [editingKey, setEditingKey] = useState(null);
//     const [newSetting, setNewSetting] = useState({ key: '', value: '' });
//     const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
//     const [lastSaved, setLastSaved] = useState(null);

//     // Refs for auto‑save debounce
//     const autoSaveTimerRef = useRef(null);
//     const hasPendingChangesRef = useRef(false);

//     // -------------------------------------------------------------------------
//     // Fetch all settings
//     // -------------------------------------------------------------------------
//     const fetchSettings = useCallback(async () => {
//         if (!isAuthenticated) return;

//         try {
//             setIsLoading(true);
//             setError(null);
//             const response = await settingsAPI.getAll();

//             let settingsData = {};
//             if (response.data?.settings) {
//                 settingsData = response.data.settings;
//             } else if (response.settings) {
//                 settingsData = response.settings;
//             } else if (typeof response === 'object') {
//                 settingsData = response;
//             }

//             setSettings(settingsData);
//             setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
//         } catch (err) {
//             const message = err.response?.data?.message || err.message || 'Failed to load settings';
//             setError(message);
//             toast.error('Could not load settings');
//         } finally {
//             setIsLoading(false);
//         }
//     }, [isAuthenticated]);

//     useEffect(() => {
//         fetchSettings();
//     }, [fetchSettings]);

//     // -------------------------------------------------------------------------
//     // Check unsaved changes
//     // -------------------------------------------------------------------------
//     const hasChanges = useMemo(() => {
//         return JSON.stringify(settings) !== JSON.stringify(originalSettings);
//     }, [settings, originalSettings]);

//     // -------------------------------------------------------------------------
//     // Permission check
//     // -------------------------------------------------------------------------
//     const canEdit = useCallback((key) => {
//         const schema = KNOWN_SETTINGS[key];
//         if (!schema?.editableBy) return true;
//         return schema.editableBy.includes(user?.role);
//     }, [user]);

//     // -------------------------------------------------------------------------
//     // Update local state
//     // -------------------------------------------------------------------------
//     const handleSettingChange = (key, value) => {
//         const schema = KNOWN_SETTINGS[key];
//         let parsedValue = value;

//         if (schema?.type === 'number') {
//             parsedValue = Number(value);
//         } else if (schema?.type === 'toggle') {
//             parsedValue = Boolean(value);
//         }

//         setSettings(prev => {
//             const updated = { ...prev, [key]: parsedValue };
//             hasPendingChangesRef.current = true;
//             return updated;
//         });
//     };

//     // -------------------------------------------------------------------------
//     // Save single setting
//     // -------------------------------------------------------------------------
//     const saveSingleSetting = async (key) => {
//         try {
//             const value = settings[key];
//             await settingsAPI.updateOne(key, { value });

//             setOriginalSettings(prev => ({
//                 ...prev,
//                 [key]: value,
//             }));
//             setLastSaved(new Date());
//             toast.success(`"${key}" updated`);
//         } catch (err) {
//             const message = err.response?.data?.message || `Failed to update "${key}"`;
//             toast.error(message);
//         }
//     };

//     // -------------------------------------------------------------------------
//     // Bulk save all changed settings
//     // -------------------------------------------------------------------------
//     const saveAllSettings = async (silent = false) => {
//         if (!hasChanges) return;

//         try {
//             setIsSaving(true);
//             const changedEntries = Object.entries(settings).filter(
//                 ([key, value]) => JSON.stringify(value) !== JSON.stringify(originalSettings[key])
//             );

//             const payload = {
//                 settings: changedEntries.map(([key, value]) => ({ key, value })),
//             };

//             await settingsAPI.updateMany(payload);

//             setOriginalSettings(JSON.parse(JSON.stringify(settings)));
//             setLastSaved(new Date());
//             hasPendingChangesRef.current = false;
//             if (!silent) toast.success('All settings saved');
//         } catch (err) {
//             const message = err.response?.data?.message || 'Failed to save settings';
//             toast.error(message);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // -------------------------------------------------------------------------
//     // Auto‑save (debounced)
//     // -------------------------------------------------------------------------
//     useEffect(() => {
//         if (!autoSaveEnabled || !hasChanges) return;

//         if (autoSaveTimerRef.current) {
//             clearTimeout(autoSaveTimerRef.current);
//         }

//         autoSaveTimerRef.current = setTimeout(() => {
//             if (hasPendingChangesRef.current) {
//                 saveAllSettings(true);
//                 toast.info('Auto‑saved', { duration: 1500 });
//             }
//         }, 1500);

//         return () => {
//             if (autoSaveTimerRef.current) {
//                 clearTimeout(autoSaveTimerRef.current);
//             }
//         };
//     }, [settings, autoSaveEnabled]);

//     // -------------------------------------------------------------------------
//     // Reset changes
//     // -------------------------------------------------------------------------
//     const resetChanges = () => {
//         setSettings(JSON.parse(JSON.stringify(originalSettings)));
//         hasPendingChangesRef.current = false;
//         toast.info('Changes discarded');
//     };

//     // -------------------------------------------------------------------------
//     // Delete setting
//     // -------------------------------------------------------------------------
//     const deleteSetting = async (key) => {
//         if (!window.confirm(`Delete setting "${key}"? This cannot be undone.`)) return;

//         try {
//             await settingsAPI.remove(key);
//             setSettings(prev => {
//                 const { [key]: _, ...rest } = prev;
//                 return rest;
//             });
//             setOriginalSettings(prev => {
//                 const { [key]: _, ...rest } = prev;
//                 return rest;
//             });
//             toast.success(`"${key}" deleted`);
//         } catch (err) {
//             toast.error(err.response?.data?.message || `Failed to delete "${key}"`);
//         }
//     };

//     // -------------------------------------------------------------------------
//     // Add new custom setting
//     // -------------------------------------------------------------------------
//     const addNewSetting = async () => {
//         if (!newSetting.key.trim()) {
//             toast.error('Key cannot be empty');
//             return;
//         }
//         if (settings.hasOwnProperty(newSetting.key)) {
//             toast.error(`"${newSetting.key}" already exists`);
//             return;
//         }

//         try {
//             let parsedValue;
//             try {
//                 parsedValue = JSON.parse(newSetting.value);
//             } catch {
//                 parsedValue = newSetting.value;
//             }

//             await settingsAPI.updateOne(newSetting.key, { value: parsedValue });

//             setSettings(prev => ({ ...prev, [newSetting.key]: parsedValue }));
//             setOriginalSettings(prev => ({ ...prev, [newSetting.key]: parsedValue }));
//             setNewSetting({ key: '', value: '' });
//             setEditingKey(null);
//             toast.success(`"${newSetting.key}" added`);
//         } catch (err) {
//             toast.error(err.response?.data?.message || 'Failed to add setting');
//         }
//     };

//     // -------------------------------------------------------------------------
//     // Render input based on type
//     // -------------------------------------------------------------------------
//     const renderSettingInput = (key, value) => {
//         const schema = KNOWN_SETTINGS[key];
//         const type = schema?.type || inferInputType(value);
//         const disabled = !canEdit(key);
//         const baseClass = `bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed`;

//         switch (type) {
//             case 'toggle':
//                 return (
//                     <label className="relative inline-flex items-center cursor-pointer">
//                         <input
//                             type="checkbox"
//                             checked={Boolean(value)}
//                             onChange={(e) => handleSettingChange(key, e.target.checked)}
//                             disabled={disabled}
//                             className="sr-only peer"
//                         />
//                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
//                     </label>
//                 );

//             case 'select':
//                 return (
//                     <select
//                         value={String(value)}
//                         onChange={(e) => handleSettingChange(key, e.target.value)}
//                         disabled={disabled}
//                         className={baseClass}
//                     >
//                         {schema.options.map(opt => (
//                             <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                     </select>
//                 );

//             case 'number':
//                 return (
//                     <input
//                         type="number"
//                         min={schema.min}
//                         max={schema.max}
//                         step={schema.step}
//                         value={value}
//                         onChange={(e) => handleSettingChange(key, e.target.value)}
//                         disabled={disabled}
//                         className={baseClass}
//                     />
//                 );

//             case 'time':
//                 return (
//                     <input
//                         type="time"
//                         value={value || ''}
//                         onChange={(e) => handleSettingChange(key, e.target.value)}
//                         disabled={disabled}
//                         className={baseClass}
//                     />
//                 );

//             case 'date':
//                 return (
//                     <input
//                         type="date"
//                         value={value || ''}
//                         onChange={(e) => handleSettingChange(key, e.target.value)}
//                         disabled={disabled}
//                         className={baseClass}
//                     />
//                 );

//             default:
//                 return (
//                     <input
//                         type="text"
//                         value={String(value)}
//                         onChange={(e) => handleSettingChange(key, e.target.value)}
//                         disabled={disabled}
//                         className={baseClass}
//                     />
//                 );
//         }
//     };

//     // -------------------------------------------------------------------------
//     // Render a setting row
//     // -------------------------------------------------------------------------
//     const renderSettingRow = ([key, value]) => {
//         const schema = KNOWN_SETTINGS[key];
//         const Icon = schema?.icon || Settings2;
//         const isModified = JSON.stringify(value) !== JSON.stringify(originalSettings[key]);
//         const editable = canEdit(key);

//         return (
//             <div
//                 key={key}
//                 className={`p-4 rounded-xl border transition-all ${isModified
//                     ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-600'
//                     : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
//                     } ${!editable ? 'opacity-75' : ''}`}
//             >
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-4">
//                     <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 mb-1">
//                             <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
//                             <h3 className="font-medium text-gray-900 dark:text-white truncate">
//                                 {schema?.label || key}
//                             </h3>
//                             {isModified && (
//                                 <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
//                                     Modified
//                                 </span>
//                             )}
//                             {!editable && (
//                                 <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
//                                     Read‑only
//                                 </span>
//                             )}
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             {schema?.description || `Key: ${key}`}
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-3">
//                         <div className="w-48 sm:w-56">
//                             {renderSettingInput(key, value)}
//                         </div>

//                         <div className="flex items-center gap-1">
//                             {isModified && editable && (
//                                 <button
//                                     onClick={() => saveSingleSetting(key)}
//                                     className="p-2 text-green-600 hover:bg-green-50 rounded-lg dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
//                                     title="Save this setting"
//                                 >
//                                     <Save className="w-4 h-4" />
//                                 </button>
//                             )}
//                             {!KNOWN_SETTINGS[key] && editable && (
//                                 <button
//                                     onClick={() => deleteSetting(key)}
//                                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
//                                     title="Delete setting"
//                                 >
//                                     <Trash2 className="w-4 h-4" />
//                                 </button>
//                             )}
//                             {!isModified && JSON.stringify(value) === JSON.stringify(originalSettings[key]) && (
//                                 <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" title="Saved" />
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // -------------------------------------------------------------------------
//     // Group settings by category
//     // -------------------------------------------------------------------------
//     const groupedSettings = useMemo(() => {
//         const groups = {};
//         Object.entries(settings).forEach(([key, value]) => {
//             const category = KNOWN_SETTINGS[key]?.category || 'Custom';
//             if (!groups[category]) groups[category] = [];
//             groups[category].push([key, value]);
//         });
//         // Sort categories: Known categories first, then alphabetically
//         const categoryOrder = [
//             'Appearance', 'Company', 'Attendance', 'Leave', 'Payroll',
//             'Recruitment', 'Performance', 'Notifications', 'Security', 'Custom'
//         ];
//         const sortedGroups = {};
//         categoryOrder.forEach(cat => {
//             if (groups[cat]) sortedGroups[cat] = groups[cat];
//         });
//         // Add any other categories not in order
//         Object.keys(groups).forEach(cat => {
//             if (!sortedGroups[cat]) sortedGroups[cat] = groups[cat];
//         });
//         return sortedGroups;
//     }, [settings]);

//     // -------------------------------------------------------------------------
//     // Loading / Error / Not Authenticated
//     // -------------------------------------------------------------------------
//     if (!isAuthenticated) {
//         return (
//             <div className="max-w-6xl mx-auto mt-8 px-4">
//                 <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 p-6 rounded-lg">
//                     Please log in to manage settings.
//                 </div>
//             </div>
//         );
//     }

//     if (isLoading) {
//         return (
//             <div className="flex justify-center items-center min-h-[60vh]">
//                 <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="max-w-6xl mx-auto mt-8 px-4">
//                 <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 p-6 rounded-lg flex items-start gap-3">
//                     <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <p className="font-medium">Failed to load settings</p>
//                         <p className="text-sm mt-1">{error}</p>
//                         <button
//                             onClick={fetchSettings}
//                             className="mt-3 text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
//                         >
//                             Try again
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // -------------------------------------------------------------------------
//     // Main Render
//     // -------------------------------------------------------------------------
//     return (
//         <div className="max-w-6xl mx-auto px-4 py-8">
//             {/* Header */}
//             <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
//                 <p className="text-gray-600 dark:text-gray-400">
//                     Configure system preferences, policies, and custom options.
//                 </p>
//             </div>

//             {/* Global Actions Bar */}
//             <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap items-center justify-between gap-3">
//                 <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-2">
//                         <span className="text-sm text-gray-600 dark:text-gray-400">Auto‑save:</span>
//                         <button
//                             onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
//                             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSaveEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
//                                 }`}
//                         >
//                             <span
//                                 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
//                                     }`}
//                             />
//                         </button>
//                     </div>
//                     {lastSaved && (
//                         <span className="text-xs text-gray-500 dark:text-gray-400">
//                             Last saved: {lastSaved.toLocaleTimeString()}
//                         </span>
//                     )}
//                     {hasChanges && (
//                         <span className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
//                             Unsaved changes
//                         </span>
//                     )}
//                 </div>
//                 <div className="flex gap-2">
//                     {hasChanges && (
//                         <>
//                             <button
//                                 onClick={resetChanges}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
//                             >
//                                 <RotateCcw className="w-4 h-4" />
//                                 Reset
//                             </button>
//                             <button
//                                 onClick={() => saveAllSettings(false)}
//                                 disabled={isSaving}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-colors flex items-center gap-2 disabled:opacity-50"
//                             >
//                                 {isSaving ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 animate-spin" />
//                                         Saving...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save className="w-4 h-4" />
//                                         Save All
//                                     </>
//                                 )}
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </div>

//             {/* Settings grouped by category */}
//             <div className="space-y-8">
//                 {Object.keys(groupedSettings).length === 0 ? (
//                     <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//                         No settings found. Add your first custom setting below.
//                     </div>
//                 ) : (
//                     Object.entries(groupedSettings).map(([category, items]) => (
//                         <section key={category}>
//                             <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//                                 {category}
//                                 <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                                     ({items.length})
//                                 </span>
//                             </h2>
//                             <div className="space-y-4">
//                                 {items.map(renderSettingRow)}
//                             </div>
//                         </section>
//                     ))
//                 )}
//             </div>

//             {/* Add Custom Setting */}
//             <div className="mt-8 p-5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
//                 {editingKey === 'new' ? (
//                     <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                             <h3 className="font-medium text-gray-900 dark:text-white">Add Custom Setting</h3>
//                             <button
//                                 onClick={() => {
//                                     setEditingKey(null);
//                                     setNewSetting({ key: '', value: '' });
//                                 }}
//                                 className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>
//                         <div className="grid sm:grid-cols-2 gap-4">
//                             <input
//                                 type="text"
//                                 placeholder="Key (e.g., dashboard.widgets)"
//                                 value={newSetting.key}
//                                 onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
//                                 className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                             />
//                             <input
//                                 type="text"
//                                 placeholder="Value (string, true/false, number)"
//                                 value={newSetting.value}
//                                 onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
//                                 className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
//                             />
//                         </div>
//                         <div className="flex justify-end gap-2">
//                             <button
//                                 onClick={() => {
//                                     setEditingKey(null);
//                                     setNewSetting({ key: '', value: '' });
//                                 }}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={addNewSetting}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
//                             >
//                                 <Plus className="w-4 h-4" />
//                                 Add Setting
//                             </button>
//                         </div>
//                     </div>
//                 ) : (
//                     <button
//                         onClick={() => setEditingKey('new')}
//                         className="w-full flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-3 rounded-lg transition-colors"
//                     >
//                         <Plus className="w-5 h-5" />
//                         <span className="font-medium">Add Custom Setting</span>
//                     </button>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default SettingsPage;

// src/pages/SettingsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import settingsAPI from '../api/settings.api';
import { toast } from 'sonner';
import {
    Save,
    RotateCcw,
    Trash2,
    Moon,
    Globe,
    Bell,
    Clock,
    Type,
    AlertCircle,
    Loader2,
    Plus,
    X,
    Settings2,
    CheckCircle2,
    Calendar,
    DollarSign,
    Building2,
    UserCheck,
    Timer,
    Briefcase,
    Users,
    Mail,
    Phone,
    MapPin,
    Key,
    Shield,
    Eye,
    EyeOff,
    Search,
    Undo2,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Comprehensive HRMS Settings Schema
// -----------------------------------------------------------------------------
const KNOWN_SETTINGS = {
    // (Keep the exact same schema as before – I'll include a condensed version here
    // for brevity in this answer, but you can copy the full schema from previous code.)
    // Appearance
    theme: { label: 'Theme', category: 'Appearance', icon: Moon, type: 'select', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }], description: 'Choose your preferred color scheme', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    language: { label: 'Language', category: 'Appearance', icon: Globe, type: 'select', options: [{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }, { value: 'de', label: 'German' }, { value: 'hi', label: 'Hindi' }], description: 'Select your interface language', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    fontSize: { label: 'Font Size', category: 'Appearance', icon: Type, type: 'number', min: 12, max: 20, step: 1, description: 'Base font size in pixels', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    compactMode: { label: 'Compact Mode', category: 'Appearance', icon: Settings2, type: 'toggle', description: 'Reduce spacing and padding', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    // Attendance
    office_start_time: { label: 'Office Start Time', category: 'Attendance', icon: Clock, type: 'time', description: 'Default work day start time', editableBy: ['admin', 'hr'] },
    office_end_time: { label: 'Office End Time', category: 'Attendance', icon: Clock, type: 'time', description: 'Default work day end time', editableBy: ['admin', 'hr'] },
    late_mark_after: { label: 'Late Mark After (minutes)', category: 'Attendance', icon: Timer, type: 'number', min: 0, max: 120, description: 'Minutes after start time to mark late', editableBy: ['admin', 'hr'] },
    half_day_hours: { label: 'Half Day Hours', category: 'Attendance', icon: Timer, type: 'number', min: 1, max: 8, description: 'Minimum hours for half‑day attendance', editableBy: ['admin', 'hr'] },
    allow_geo_fencing: { label: 'Enable Geo‑Fencing', category: 'Attendance', icon: MapPin, type: 'toggle', description: 'Require location for check‑in/out', editableBy: ['admin', 'hr'] },
    geo_fence_radius: { label: 'Geo‑Fence Radius (meters)', category: 'Attendance', icon: MapPin, type: 'number', min: 50, max: 1000, description: 'Allowed distance from office location', editableBy: ['admin', 'hr'] },
    // Leave
    max_leaves_per_year: { label: 'Max Leaves Per Year', category: 'Leave', icon: Calendar, type: 'number', min: 0, max: 365, description: 'Total paid leaves allowed annually', editableBy: ['admin', 'hr'] },
    carry_forward_limit: { label: 'Carry Forward Limit', category: 'Leave', icon: Calendar, type: 'number', min: 0, max: 365, description: 'Max leaves that can be carried forward', editableBy: ['admin', 'hr'] },
    leave_approval_required: { label: 'Leave Approval Required', category: 'Leave', icon: UserCheck, type: 'toggle', description: 'Require manager approval for leave requests', editableBy: ['admin', 'hr'] },
    sick_leave_separate: { label: 'Separate Sick Leave Pool', category: 'Leave', icon: Briefcase, type: 'toggle', description: 'Maintain separate sick leave balance', editableBy: ['admin', 'hr'] },
    sick_leave_days: { label: 'Sick Leave Days', category: 'Leave', icon: Briefcase, type: 'number', min: 0, max: 30, description: 'Annual sick leave entitlement', editableBy: ['admin', 'hr'] },
    // Payroll
    salary_cycle: { label: 'Salary Cycle', category: 'Payroll', icon: DollarSign, type: 'select', options: [{ value: 'monthly', label: 'Monthly' }, { value: 'bi-weekly', label: 'Bi‑Weekly' }, { value: 'weekly', label: 'Weekly' }], description: 'Frequency of salary disbursement', editableBy: ['admin'] },
    payday: { label: 'Payday', category: 'Payroll', icon: Calendar, type: 'number', min: 1, max: 31, description: 'Day of month/week for salary credit', editableBy: ['admin'] },
    pf_enabled: { label: 'Provident Fund (PF) Enabled', category: 'Payroll', icon: Shield, type: 'toggle', description: 'Enable PF deductions', editableBy: ['admin'] },
    pf_percentage: { label: 'PF Contribution (%)', category: 'Payroll', icon: Shield, type: 'number', min: 0, max: 20, step: 0.5, description: 'Employee PF contribution percentage', editableBy: ['admin'] },
    tax_enabled: { label: 'Tax Deduction Enabled', category: 'Payroll', icon: DollarSign, type: 'toggle', description: 'Enable automatic tax calculation', editableBy: ['admin'] },
    overtime_pay_multiplier: { label: 'Overtime Pay Multiplier', category: 'Payroll', icon: Timer, type: 'number', min: 1.0, max: 3.0, step: 0.1, description: 'Hourly rate multiplier for overtime', editableBy: ['admin'] },
    // Company
    company_name: { label: 'Company Name', category: 'Company', icon: Building2, type: 'text', description: 'Official registered name', editableBy: ['admin'] },
    company_email: { label: 'Company Email', category: 'Company', icon: Mail, type: 'text', description: 'Primary contact email', editableBy: ['admin'] },
    company_phone: { label: 'Company Phone', category: 'Company', icon: Phone, type: 'text', description: 'Primary contact number', editableBy: ['admin'] },
    company_address: { label: 'Company Address', category: 'Company', icon: MapPin, type: 'text', description: 'Registered office address', editableBy: ['admin'] },
    company_timezone: { label: 'Company Timezone', category: 'Company', icon: Clock, type: 'select', options: (() => { if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) return Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz })); return [{ value: 'UTC', label: 'UTC' }, { value: 'America/New_York', label: 'Eastern Time' }, { value: 'Asia/Kolkata', label: 'India Standard Time' }, { value: 'Europe/London', label: 'London' }]; })(), description: 'Default timezone for company operations', editableBy: ['admin'] },
    fiscal_year_start: { label: 'Fiscal Year Start', category: 'Company', icon: Calendar, type: 'date', description: 'Start date of financial year (MM‑DD)', editableBy: ['admin'] },
    // Notifications
    email_notifications: { label: 'Email Notifications', category: 'Notifications', icon: Mail, type: 'toggle', description: 'Send email alerts for important events', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    push_notifications: { label: 'Push Notifications', category: 'Notifications', icon: Bell, type: 'toggle', description: 'Send browser/device push alerts', editableBy: ['admin', 'hr', 'manager', 'employee'] },
    notify_on_leave_request: { label: 'Notify on Leave Request', category: 'Notifications', icon: Calendar, type: 'toggle', description: 'Alert managers when leave is requested', editableBy: ['admin', 'hr', 'manager'] },
    notify_on_attendance_anomaly: { label: 'Notify on Attendance Anomaly', category: 'Notifications', icon: AlertCircle, type: 'toggle', description: 'Alert HR on late/missing check‑ins', editableBy: ['admin', 'hr'] },
    // Security
    two_factor_auth: { label: 'Two‑Factor Authentication', category: 'Security', icon: Shield, type: 'toggle', description: 'Require 2FA for all users', editableBy: ['admin'] },
    session_timeout_minutes: { label: 'Session Timeout (minutes)', category: 'Security', icon: Timer, type: 'number', min: 5, max: 480, description: 'Auto logout after inactivity', editableBy: ['admin'] },
    password_expiry_days: { label: 'Password Expiry (days)', category: 'Security', icon: Key, type: 'number', min: 0, max: 365, description: 'Force password change after N days (0 = never)', editableBy: ['admin'] },
    allow_social_login: { label: 'Allow Social Login', category: 'Security', icon: Users, type: 'toggle', description: 'Enable Google/Microsoft SSO', editableBy: ['admin'] },
    // Recruitment
    auto_archive_candidates_days: { label: 'Auto‑archive Candidates (days)', category: 'Recruitment', icon: Briefcase, type: 'number', min: 30, max: 365, description: 'Days after which inactive candidates are archived', editableBy: ['admin', 'hr'] },
    require_offer_approval: { label: 'Require Offer Approval', category: 'Recruitment', icon: UserCheck, type: 'toggle', description: 'Offers need second‑level approval', editableBy: ['admin', 'hr'] },
    default_interview_duration: { label: 'Default Interview Duration (mins)', category: 'Recruitment', icon: Clock, type: 'number', min: 15, max: 120, step: 15, description: 'Default slot length for interviews', editableBy: ['admin', 'hr'] },
    // Performance
    review_cycle_months: { label: 'Review Cycle (months)', category: 'Performance', icon: Calendar, type: 'number', min: 3, max: 12, description: 'Frequency of performance reviews', editableBy: ['admin', 'hr'] },
    self_appraisal_enabled: { label: 'Self Appraisal Enabled', category: 'Performance', icon: Eye, type: 'toggle', description: 'Allow employees to self‑evaluate', editableBy: ['admin', 'hr'] },
    peer_review_enabled: { label: 'Peer Review Enabled', category: 'Performance', icon: Users, type: 'toggle', description: 'Include peer feedback in reviews', editableBy: ['admin', 'hr'] },
    rating_scale_max: { label: 'Rating Scale Maximum', category: 'Performance', icon: Settings2, type: 'number', min: 3, max: 10, description: 'Highest possible performance rating', editableBy: ['admin', 'hr'] },
};

// Helper to infer type for unknown settings
const inferInputType = (value) => {
    if (typeof value === 'boolean') return 'toggle';
    if (typeof value === 'number') return 'number';
    return 'text';
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
const SettingsPage = () => {
    const { isAuthenticated, user } = useAuth();
    const [settings, setSettings] = useState({});
    const [originalSettings, setOriginalSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingKey, setEditingKey] = useState(null);
    const [newSetting, setNewSetting] = useState({ key: '', value: '' });
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [lastSaved, setLastSaved] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSaveAnimation, setShowSaveAnimation] = useState(false);

    const autoSaveTimerRef = useRef(null);
    const hasPendingChangesRef = useRef(false);

    // -------------------------------------------------------------------------
    // Fetch all settings
    // -------------------------------------------------------------------------
    const fetchSettings = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await settingsAPI.getAll();
            let settingsData = {};
            if (response.data?.settings) settingsData = response.data.settings;
            else if (response.settings) settingsData = response.settings;
            else if (typeof response === 'object') settingsData = response;
            setSettings(settingsData);
            setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load settings';
            setError(message);
            toast.error('Could not load settings');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // -------------------------------------------------------------------------
    // Stable diff (no JSON.stringify)
    // -------------------------------------------------------------------------
    const hasChanges = useMemo(() => {
        for (const key in settings) {
            if (settings[key] !== originalSettings[key]) return true;
        }
        for (const key in originalSettings) {
            if (settings[key] !== originalSettings[key]) return true;
        }
        return false;
    }, [settings, originalSettings]);

    // Permission check
    const canEdit = useCallback((key) => {
        const schema = KNOWN_SETTINGS[key];
        if (!schema?.editableBy) return true;
        return schema.editableBy.includes(user?.role);
    }, [user]);

    // -------------------------------------------------------------------------
    // Update local state
    // -------------------------------------------------------------------------
    const handleSettingChange = (key, value) => {
        const schema = KNOWN_SETTINGS[key];
        let parsedValue = value;
        if (schema?.type === 'number') parsedValue = Number(value);
        else if (schema?.type === 'toggle') parsedValue = Boolean(value);

        setSettings(prev => {
            const updated = { ...prev, [key]: parsedValue };
            hasPendingChangesRef.current = true;
            return updated;
        });
    };

    // -------------------------------------------------------------------------
    // Save single setting
    // -------------------------------------------------------------------------
    const saveSingleSetting = async (key) => {
        try {
            const value = settings[key];
            await settingsAPI.updateOne(key, { value });
            setOriginalSettings(prev => ({ ...prev, [key]: value }));
            setLastSaved(new Date());
            setShowSaveAnimation(true);
            setTimeout(() => setShowSaveAnimation(false), 1500);
            toast.success(`"${key}" updated`);
        } catch (err) {
            const message = err.response?.data?.message || `Failed to update "${key}"`;
            toast.error(message);
        }
    };

    // -------------------------------------------------------------------------
    // Bulk save all changed settings (stable diff)
    // -------------------------------------------------------------------------
    const saveAllSettings = async (silent = false) => {
        if (!hasChanges) return;
        try {
            setIsSaving(true);
            const changedEntries = Object.entries(settings).filter(
                ([key, val]) => val !== originalSettings[key]
            );
            const payload = { settings: changedEntries.map(([key, value]) => ({ key, value })) };
            await settingsAPI.updateMany(payload);
            setOriginalSettings(JSON.parse(JSON.stringify(settings)));
            setLastSaved(new Date());
            hasPendingChangesRef.current = false;
            setShowSaveAnimation(true);
            setTimeout(() => setShowSaveAnimation(false), 1500);
            if (!silent) toast.success('All settings saved');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to save settings';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    // -------------------------------------------------------------------------
    // Auto‑save (debounced 2.5s)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!autoSaveEnabled || !hasChanges) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            if (hasPendingChangesRef.current) {
                saveAllSettings(true);
                toast.info('Auto‑saved', { duration: 1500 });
            }
        }, 2500);
        return () => clearTimeout(autoSaveTimerRef.current);
    }, [settings, autoSaveEnabled, hasChanges]);

    // -------------------------------------------------------------------------
    // Reset changes (and optionally undo last change)
    // -------------------------------------------------------------------------
    const resetChanges = () => {
        setSettings(JSON.parse(JSON.stringify(originalSettings)));
        hasPendingChangesRef.current = false;
        toast.info('Changes discarded');
    };

    const undoLastChange = () => {
        // Revert to original (same as reset but with different message)
        setSettings(JSON.parse(JSON.stringify(originalSettings)));
        hasPendingChangesRef.current = false;
        toast.info('Last change undone');
    };

    // -------------------------------------------------------------------------
    // Delete setting
    // -------------------------------------------------------------------------
    const deleteSetting = async (key) => {
        if (!window.confirm(`Delete setting "${key}"? This cannot be undone.`)) return;
        try {
            await settingsAPI.remove(key);
            setSettings(prev => { const { [key]: _, ...rest } = prev; return rest; });
            setOriginalSettings(prev => { const { [key]: _, ...rest } = prev; return rest; });
            toast.success(`"${key}" deleted`);
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to delete "${key}"`);
        }
    };

    // -------------------------------------------------------------------------
    // Add new custom setting
    // -------------------------------------------------------------------------
    const addNewSetting = async () => {
        if (!newSetting.key.trim()) {
            toast.error('Key cannot be empty');
            return;
        }
        if (settings.hasOwnProperty(newSetting.key)) {
            toast.error(`"${newSetting.key}" already exists`);
            return;
        }
        try {
            let parsedValue;
            try { parsedValue = JSON.parse(newSetting.value); } catch { parsedValue = newSetting.value; }
            await settingsAPI.updateOne(newSetting.key, { value: parsedValue });
            setSettings(prev => ({ ...prev, [newSetting.key]: parsedValue }));
            setOriginalSettings(prev => ({ ...prev, [newSetting.key]: parsedValue }));
            setNewSetting({ key: '', value: '' });
            setEditingKey(null);
            toast.success(`"${newSetting.key}" added`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add setting');
        }
    };

    // -------------------------------------------------------------------------
    // Render input based on type
    // -------------------------------------------------------------------------
    const renderSettingInput = (key, value) => {
        const schema = KNOWN_SETTINGS[key];
        const type = schema?.type || inferInputType(value);
        const disabled = !canEdit(key);
        const baseClass = `bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed`;

        switch (type) {
            case 'toggle':
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={Boolean(value)} onChange={(e) => handleSettingChange(key, e.target.checked)} disabled={disabled} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                );
            case 'select':
                return (
                    <select value={String(value)} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={disabled} className={baseClass}>
                        {schema.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                );
            case 'number':
                return <input type="number" min={schema.min} max={schema.max} step={schema.step} value={value} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={disabled} className={baseClass} />;
            case 'time':
                return <input type="time" value={value || ''} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={disabled} className={baseClass} />;
            case 'date':
                return <input type="date" value={value || ''} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={disabled} className={baseClass} />;
            default:
                return <input type="text" value={String(value)} onChange={(e) => handleSettingChange(key, e.target.value)} disabled={disabled} className={baseClass} />;
        }
    };

    // -------------------------------------------------------------------------
    // Render a setting row (with search highlight)
    // -------------------------------------------------------------------------
    const renderSettingRow = ([key, value]) => {
        const schema = KNOWN_SETTINGS[key];
        const Icon = schema?.icon || Settings2;
        const isModified = settings[key] !== originalSettings[key];
        const editable = canEdit(key);
        const isHighlighted = searchQuery && (key.toLowerCase().includes(searchQuery.toLowerCase()) || (schema?.label && schema.label.toLowerCase().includes(searchQuery.toLowerCase())));

        return (
            <div key={key} className={`p-4 rounded-xl border transition-all ${isModified ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-600' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'} ${!editable ? 'opacity-75' : ''} ${isHighlighted ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {schema?.label || key}
                            </h3>
                            {isModified && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Modified</span>
                            )}
                            {!editable && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Restricted
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {schema?.description || `Key: ${key}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-48 sm:w-56">
                            {renderSettingInput(key, value)}
                        </div>
                        <div className="flex items-center gap-1">
                            {editable && isModified && (
                                <button onClick={() => saveSingleSetting(key)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg dark:text-green-400 dark:hover:bg-green-900/20 transition-colors" title="Save this setting">
                                    <Save className="w-4 h-4" />
                                </button>
                            )}
                            {editable && !KNOWN_SETTINGS[key] && (
                                <button onClick={() => deleteSetting(key)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20 transition-colors" title="Delete setting">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            {!isModified && settings[key] === originalSettings[key] && (
                                <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" title="Saved" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // Group settings by category (filtered by search)
    // -------------------------------------------------------------------------
    const groupedSettings = useMemo(() => {
        const groups = {};
        const lowerSearch = searchQuery.toLowerCase();
        Object.entries(settings).forEach(([key, value]) => {
            const schema = KNOWN_SETTINGS[key];
            const label = schema?.label || key;
            if (lowerSearch && !key.toLowerCase().includes(lowerSearch) && !label.toLowerCase().includes(lowerSearch)) return;
            const category = schema?.category || 'Custom';
            if (!groups[category]) groups[category] = [];
            groups[category].push([key, value]);
        });
        const categoryOrder = ['Appearance', 'Company', 'Attendance', 'Leave', 'Payroll', 'Recruitment', 'Performance', 'Notifications', 'Security', 'Custom'];
        const sortedGroups = {};
        categoryOrder.forEach(cat => { if (groups[cat]) sortedGroups[cat] = groups[cat]; });
        Object.keys(groups).forEach(cat => { if (!sortedGroups[cat]) sortedGroups[cat] = groups[cat]; });
        return sortedGroups;
    }, [settings, searchQuery]);

    // -------------------------------------------------------------------------
    // Loading / Error / Not Authenticated
    // -------------------------------------------------------------------------
    if (!isAuthenticated) {
        return (
            <div className="max-w-6xl mx-auto mt-8 px-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 p-6 rounded-lg">
                    Please log in to manage settings.
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i}>
                            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                            <div className="space-y-4">
                                {[1, 2].map(j => (
                                    <div key={j} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto mt-8 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Failed to load settings</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-6">{error}</p>
                    <button onClick={fetchSettings} className="px-5 py-2.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors font-medium">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // Main Render
    // -------------------------------------------------------------------------
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Configure system preferences, policies, and custom options.
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Global Actions Bar */}
            <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Auto‑save:</span>
                        <button onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoSaveEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {lastSaved && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Last saved: {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                    {hasChanges && (
                        <span className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            Unsaved changes
                        </span>
                    )}
                    {showSaveAnimation && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 animate-bounce">
                            <CheckCircle2 className="w-4 h-4" />
                            Saved
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {hasChanges && (
                        <>
                            <button onClick={undoLastChange} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2" title="Undo all changes">
                                <Undo2 className="w-4 h-4" />
                                Undo
                            </button>
                            <button onClick={resetChanges} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <RotateCcw className="w-4 h-4" />
                                Reset
                            </button>
                            <button onClick={() => saveAllSettings(false)} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-colors flex items-center gap-2 disabled:opacity-50">
                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save All</>}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Settings grouped by category */}
            <div className="space-y-8">
                {Object.keys(groupedSettings).length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No settings found. Try a different search or add a custom setting below.
                    </div>
                ) : (
                    Object.entries(groupedSettings).map(([category, items]) => (
                        <section key={category}>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                {category}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({items.length})</span>
                            </h2>
                            <div className="space-y-4">
                                {items.map(renderSettingRow)}
                            </div>
                        </section>
                    ))
                )}
            </div>

            {/* Add Custom Setting */}
            <div className="mt-8 p-5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                {editingKey === 'new' ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white">Add Custom Setting</h3>
                            <button onClick={() => { setEditingKey(null); setNewSetting({ key: '', value: '' }); }} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="Key (e.g., dashboard.widgets)" value={newSetting.key} onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" placeholder="Value (string, true/false, number)" value={newSetting.value} onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingKey(null); setNewSetting({ key: '', value: '' }); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                            <button onClick={addNewSetting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Setting
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setEditingKey('new')} className="w-full flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-3 rounded-lg transition-colors">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add Custom Setting</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;