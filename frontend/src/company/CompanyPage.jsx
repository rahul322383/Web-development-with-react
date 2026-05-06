
'use strict';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import companyApi from '../api/companyApi';
import {authApi} from '../api/authApi';  

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
const cls = (...a) => a.filter(Boolean).join(' ');
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtCur = (n) => `₹${fmt(n)}`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

const PLAN_META = {
  free: { label: 'Free', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200' },
  starter: { label: 'Starter', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  pro: { label: 'Pro', color: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300' },
  enterprise: { label: 'Enterprise', color: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' },
};

const STATUS_META = {
  true: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-300', pill: 'bg-emerald-50 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-700' },
  false: { label: 'Inactive', dot: 'bg-red-400', text: 'text-red-700 dark:text-red-300', pill: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700' },
};

const validateCompanyForm = (data, isUpdate = false) => {
  const errors = {};
  if (!isUpdate || 'name' in data) {
    if (!data.name || data.name.trim().length < 2) errors.name = 'Company name is required (min 2 characters).';
    else if (data.name.length > 150) errors.name = 'Company name must be 150 characters or fewer.';
  }
  if (data.email && data.email.length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Please enter a valid email address.';
  }
  if (data.phone && data.phone.length > 20) errors.phone = 'Phone number must be 20 characters or fewer.';
  if (data.website && data.website.length > 0) {
    try { new URL(data.website); } catch { errors.website = 'Please enter a valid URL.'; }
  }
  if (data.industry && data.industry.length > 100) errors.industry = 'Industry must be 100 characters or fewer.';
  if (data.size && !['1-10', '11-50', '51-200', '201-500', '500+'].includes(data.size)) errors.size = 'Invalid company size.';
  if (data.city && data.city.length > 100) errors.city = 'City must be 100 characters or fewer.';
  if (data.state && data.state.length > 100) errors.state = 'State must be 100 characters or fewer.';
  if (data.country && data.country.length > 100) errors.country = 'Country must be 100 characters or fewer.';
  if (data.postalCode && data.postalCode.length > 20) errors.postalCode = 'Postal code must be 20 characters or fewer.';
  if (data.timezone && data.timezone.length > 60) errors.timezone = 'Timezone must be 60 characters or fewer.';
  if (data.currency && data.currency.length > 10) errors.currency = 'Currency must be 10 characters or fewer.';
  return Object.keys(errors).length ? errors : null;
};

const extractError = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

/* ------------------------------------------------------------------ */
/*  TOAST                                                              */
/* ------------------------------------------------------------------ */
const useToast = () => {
  const [msgs, setMsgs] = useState([]);
  const toast = useCallback((text, type = 'success') => {
    const id = Date.now();
    setMsgs((prev) => [...prev, { id, text, type }]);
    setTimeout(() => setMsgs((prev) => prev.filter((m) => m.id !== id)), 3500);
  }, []);
  const Toast = () => (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {msgs.map((m) => (
        <div
          key={m.id}
          className={cls(
            'px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2.5 pointer-events-auto',
            'animate-[slideIn_0.25s_ease]',
            m.type === 'error' ? 'bg-red-600 text-white' : m.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
          )}
        >
          {m.type === 'error' ? '✕' : m.type === 'warning' ? '⚠' : '✓'}
          {m.text}
        </div>
      ))}
    </div>
  );
  return { toast, Toast };
};

/* ------------------------------------------------------------------ */
/*  MODAL                                                              */
/* ------------------------------------------------------------------ */
const Modal = ({ open, onClose, title, children, wide }) => {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cls('bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-y-auto', wide ? 'max-w-4xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-all">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ open, onClose, message, onConfirm }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Confirm">
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</Btn>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/*  FORM ELEMENTS                                                      */
/* ------------------------------------------------------------------ */
const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>}
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const Input = ({ label, error, ...p }) => (
  <Field label={label} error={error}>
    <input
      {...p}
      className={cls(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400',
        'transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500',
        error ? 'border-red-300' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500',
        p.className
      )}
    />
  </Field>
);

const Select = ({ label, error, children, ...p }) => (
  <Field label={label} error={error}>
    <select
      {...p}
      className={cls(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400',
        'transition-all',
        error ? 'border-red-300' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
      )}
    >{children}</select>
  </Field>
);

const Textarea = ({ label, error, ...p }) => (
  <Field label={label} error={error}>
    <textarea
      {...p}
      rows={3}
      className={cls(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400',
        'transition-all placeholder:text-slate-300 dark:placeholder:text-slate-500',
        error ? 'border-red-300' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
      )}
    />
  </Field>
);

const Btn = ({ variant = 'primary', size = 'md', loading, icon, children, className, ...p }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-100',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-100',
    outline: 'border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
    amber: 'bg-amber-500 text-white hover:bg-amber-600',
  };
  return (
    <button {...p} disabled={loading || p.disabled} className={cls(base, sizes[size], variants[variant], className)}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  );
};

const Bar = ({ pct, color = 'bg-violet-500', label }) => (
  <div className="flex flex-col gap-1">
    {label && <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{label}</span><span>{fmtPct(pct)}</span></div>}
    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className={cls('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  </div>
);

const PlanBadge = ({ plan }) => {
  const m = PLAN_META[plan] || PLAN_META.free;
  return <span className={cls('px-2.5 py-0.5 rounded-full text-xs font-semibold', m.color)}>{m.label}</span>;
};

const ActiveBadge = ({ active }) => {
  const key = String(active);
  const m = STATUS_META[key] || STATUS_META['false'];
  return (
    <span className={cls('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', m.pill, m.text)}>
      <span className={cls('w-1.5 h-1.5 rounded-full', m.dot)} />
      {m.label}
    </span>
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const Empty = ({ text = 'No data found' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 gap-2">
    <span className="text-4xl">🗂</span>
    <p className="text-sm">{text}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-full mb-2" />
    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3" />
  </div>
);

const SkeletonStatGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
        <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const Avatar = ({ name = '', size = 36 }) => {
  const safeName = name.trim() || '?';
  const initials = safeName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'];
  const color = colors[safeName.charCodeAt(0) % colors.length];
  return (
    <div className={cls('rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0', color)} style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
};

const TABS = ['Overview', 'Dashboard', 'Settings', 'Users', 'Subscription', 'Notify'];

/* ------------------------------------------------------------------ */
/*  FORMS                                                              */
/* ------------------------------------------------------------------ */
const CompanyForm = ({ initial = {}, onSubmit, loading, errors = {} }) => {
  const [f, setF] = useState({ name: '', email: '', phone: '', website: '', industry: '', size: '', city: '', state: '', country: 'India', postalCode: '', timezone: 'Asia/Kolkata', currency: 'INR', ...initial });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><Input label="Company Name *" value={f.name} onChange={set('name')} required placeholder="Acme Corp" error={errors.name} /></div>
      <Input label="Email" type="email" value={f.email} onChange={set('email')} placeholder="hr@acme.com" error={errors.email} />
      <Input label="Phone" value={f.phone} onChange={set('phone')} placeholder="+91 98000 00000" error={errors.phone} />
      <Input label="Website" value={f.website} onChange={set('website')} placeholder="https://acme.com" error={errors.website} />
      <Select label="Industry" value={f.industry} onChange={set('industry')} error={errors.industry}>
        <option value="">Select industry</option>
        {['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
      </Select>
      <Select label="Company Size" value={f.size} onChange={set('size')} error={errors.size}>
        <option value="">Select size</option>
        {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Input label="City" value={f.city} onChange={set('city')} placeholder="Mumbai" error={errors.city} />
      <Input label="State" value={f.state} onChange={set('state')} placeholder="Maharashtra" error={errors.state} />
      <Input label="Country" value={f.country} onChange={set('country')} placeholder="India" error={errors.country} />
      <Input label="Postal Code" value={f.postalCode} onChange={set('postalCode')} placeholder="400001" error={errors.postalCode} />
      <Select label="Timezone" value={f.timezone} onChange={set('timezone')} error={errors.timezone}>
        {['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore'].map(t => <option key={t} value={t}>{t}</option>)}
      </Select>
      <Select label="Currency" value={f.currency} onChange={set('currency')} error={errors.currency}>
        {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <div className="col-span-2 pt-2"><Btn type="submit" loading={loading} className="w-full">{initial.id ? 'Save Changes' : 'Create Company'}</Btn></div>
    </form>
  );
};

const SettingsForm = ({ initial = {}, onSubmit, loading }) => {
  const [f, setF] = useState({ workingHoursPerDay: 8, workingDaysPerWeek: 5, annualLeaveQuota: 21, timezone: 'Asia/Kolkata', currency: 'INR', fiscalYearStart: 4, ...initial });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(f); }} className="grid grid-cols-2 gap-4">
      <Input label="Working Hours / Day" type="number" min={1} max={24} value={f.workingHoursPerDay} onChange={set('workingHoursPerDay')} />
      <Input label="Working Days / Week" type="number" min={1} max={7} value={f.workingDaysPerWeek} onChange={set('workingDaysPerWeek')} />
      <Input label="Annual Leave Quota" type="number" min={0} max={365} value={f.annualLeaveQuota} onChange={set('annualLeaveQuota')} />
      <Select label="Fiscal Year Start (Month)" value={f.fiscalYearStart} onChange={set('fiscalYearStart')}>
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
      </Select>
      <Select label="Timezone" value={f.timezone} onChange={set('timezone')}>
        {['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York'].map(t => <option key={t} value={t}>{t}</option>)}
      </Select>
      <Select label="Currency" value={f.currency} onChange={set('currency')}>
        {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
      <div className="col-span-2 pt-2"><Btn type="submit" loading={loading} className="w-full">Save Settings</Btn></div>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/*  TAB COMPONENTS                                                     */
/* ------------------------------------------------------------------ */
const TabOverview = ({ company, onEdit, onToggle, onLogoUpload, onLogoDelete, stats, loadingStats, toast, confirm }) => {
  const fileRef = useRef();
  const handleLogoDelete = () => confirm('Delete company logo?', () => onLogoDelete());
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 shadow-lg overflow-hidden flex items-center justify-center text-2xl font-bold text-violet-600 dark:text-violet-300">
                {company.logoUrl ? <img src={company.logoUrl} alt="logo" className="w-full h-full object-cover" /> : company.name?.[0]?.toUpperCase()}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                <button onClick={() => fileRef.current?.click()} className="text-white text-[10px] bg-white/20 px-2 py-0.5 rounded-md hover:bg-white/30">Upload</button>
                {company.logoUrl && <button onClick={handleLogoDelete} className="text-white text-[10px] bg-red-500/70 px-2 py-0.5 rounded-md hover:bg-red-500">Delete</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onLogoUpload(e.target.files[0]); }} />
            </div>
            <div className="flex gap-2">
              <Btn variant="outline" size="sm" onClick={onEdit}>✎ Edit</Btn>
              {company.isActive ? <Btn variant="danger" size="sm" onClick={() => onToggle(false)}>Deactivate</Btn> : <Btn variant="success" size="sm" onClick={() => onToggle(true)}>Reactivate</Btn>}
            </div>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{company.name}</h2>
            <ActiveBadge active={company.isActive} />
            <PlanBadge plan={company.subscriptionPlan} />
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">{[company.city, company.state, company.country].filter(Boolean).join(', ') || 'No address set'}&nbsp;{company.industry && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{company.industry}</span>}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[['Email', company.email || '—'], ['Phone', company.phone || '—'], ['Website', company.website || '—'], ['Slug', company.slug || '—'], ['Timezone', company.timezone || '—'], ['Currency', company.currency || '—'], ['Size', company.size || '—'], ['Created', company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—']].map(([k, v]) => (
              <div key={k} className="flex flex-col"><span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{k}</span><span className="text-slate-700 dark:text-slate-200 truncate">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
      {loadingStats ? <SkeletonStatGrid count={4} /> : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={fmt(stats.totalEmployees)} icon="👥" />
          <StatCard title="Active Employees" value={fmt(stats.activeEmployees)} icon="✅" color="emerald" />
          <StatCard title="Inactive Employees" value={fmt(stats.inactiveEmployees)} icon="⛔" color="rose" />
          <StatCard title="Total Payroll" value={fmtCur(stats.totalPayroll)} icon="💰" color="amber" />
        </div>
      ) : null}
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
      <span className="text-lg">{icon}</span>
    </div>
    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
    {sub && <span className="text-xs text-slate-400 dark:text-slate-500">{sub}</span>}
  </div>
);

const TabDashboard = ({ companyId, toast }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companyApi.getDashboard(companyId, year);
      setDash(res.data.dashboard);
    } catch (e) { toast(extractError(e), 'error'); }
    finally { setLoading(false); }
  }, [companyId, year, toast]);
  useEffect(() => { load(); }, [load]);
  if (loading) return <SkeletonStatGrid count={4} />;
  if (!dash) return <Empty text="No dashboard data" />;
  const { employees, leaves, attendance, payroll } = dash;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Annual Overview</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">‹</button>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-12 text-center">{year}</span>
          <button onClick={() => setYear((y) => y + 1)} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">›</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={fmt(employees?.total)} sub={`${fmt(employees?.active)} active`} icon="👥" />
        <StatCard title="Leaves Approved" value={fmt(leaves?.approved)} sub={`${fmt(leaves?.pending)} pending`} icon="📋" />
        <StatCard title="Attendance Rate" value={fmtPct(attendance?.attendancePct)} sub="present + late days" icon="📊" />
        <StatCard title="Total Payroll" value={fmtCur(payroll?.totalPaid)} icon="💰" color="amber" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Leave Breakdown</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[{ label: 'Approved', val: leaves?.approved, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900' }, { label: 'Pending', val: leaves?.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900' }, { label: 'Rejected', val: leaves?.rejected, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900' }].map(({ label, val, color, bg }) => (
            <div key={label} className={cls('rounded-xl p-4', bg)}>
              <p className={cls('text-2xl font-bold', color)}>{fmt(val)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-4">
        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Attendance Distribution</h4>
        <div className="flex flex-col gap-3">
          <Bar pct={attendance?.attendancePct} color="bg-violet-500" label="Overall Attendance" />
          {[['Present', 'present', 'bg-emerald-400'], ['Absent', 'absent', 'bg-red-400'], ['Late', 'late', 'bg-amber-400'], ['On Leave', 'onLeave', 'bg-blue-400']].map(([label, key, color]) => {
            const total = attendance?.present + attendance?.absent + attendance?.late + attendance?.onLeave || 1;
            return <Bar key={key} pct={(attendance?.[key] / total) * 100} color={color} label={label} />;
          })}
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">Payroll Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900 rounded-xl p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Total Paid</p><p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{fmtCur(payroll?.totalPaid)}</p></div>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Avg per Employee</p><p className="text-xl font-bold text-blue-700 dark:text-blue-300">{fmtCur(payroll?.avgPerEmployee)}</p></div>
        </div>
      </div>
    </div>
  );
};

const TabSettings = ({ companyId, toast }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!companyId) return;
    companyApi.getSettings(companyId).then(r => setSettings(r.data.settings)).catch(e => toast(extractError(e), 'error')).finally(() => setLoading(false));
  }, [companyId, toast]);
  const save = async (vals) => {
    setSaving(true);
    try {
      const r = await companyApi.saveSettings(companyId, vals);
      setSettings(r.data.settings || vals);
      toast('Settings saved successfully');
    } catch (e) { toast(extractError(e), 'error'); }
    finally { setSaving(false); }
  };
  if (loading) return <Spinner />;
  return (
    <div className="max-w-lg">
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">Configure working policies and localisation for this company.</p>
      <SettingsForm initial={settings || {}} onSubmit={save} loading={saving} />
    </div>
  );
};

const TabUsers = ({ companyId, toast, confirm }) => {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [addId, setAddId] = useState('');
  const [adding, setAdding] = useState(false);
  const [roleModal, setRoleModal] = useState(null);
  const [newRoleId, setNewRoleId] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(timer); }, [search]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await companyApi.getUsers(companyId, { page, search: debouncedSearch || undefined, limit: 10 });
      setUsers(r.data.users || []);
      setMeta({ total: r.data.total, totalPages: r.data.totalPages });
    } catch (e) { toast(extractError(e), 'error'); } finally { setLoading(false); }
  }, [companyId, page, debouncedSearch, toast]);
  useEffect(() => { load(); }, [load]);
  const handleAdd = async () => { if (!addId) return; setAdding(true); try { await companyApi.addUser(companyId, addId); toast('User added'); setAddOpen(false); setAddId(''); load(); } catch (e) { toast(extractError(e), 'error'); } finally { setAdding(false); } };
  const handleRemove = (uid, name) => { confirm(`Remove ${name} from this company?`, async () => { try { await companyApi.removeUser(companyId, uid); toast('User removed'); load(); } catch (e) { toast(extractError(e), 'error'); } }); };
  const handleRoleSave = async () => { if (!newRoleId) return; setSavingRole(true); try { await companyApi.updateRole(companyId, roleModal.userId, newRoleId); toast('Role updated'); setRoleModal(null); load(); } catch (e) { toast(extractError(e), 'error'); } finally { setSavingRole(false); } };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder:text-slate-300 dark:placeholder:text-slate-500 dark:text-slate-100" />
        <Btn onClick={() => setAddOpen(true)}>＋ Add User</Btn>
      </div>
      {loading ? <Spinner /> : users.length === 0 ? <Empty text="No users found" /> : (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600">
              <tr>{['User', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email} />
                      <div><p className="font-medium text-slate-800 dark:text-slate-100">{u.firstName} {u.lastName}</p><p className="text-xs text-slate-400 dark:text-slate-500">ID: {u.id}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-4 py-3"><span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-medium">{u.role?.name || 'No role'}</span></td>
                  <td className="px-4 py-3"><ActiveBadge active={u.isActive} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setRoleModal({ userId: u.id, name: `${u.firstName} ${u.lastName}` }); setNewRoleId(u.role?.id || ''); }} className="text-xs text-violet-600 hover:text-violet-800 font-medium">Change Role</button>
                      <span className="text-slate-200 dark:text-slate-600">|</span>
                      <button onClick={() => handleRemove(u.id, `${u.firstName} ${u.lastName}`)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
              <span className="text-xs text-slate-400 dark:text-slate-500">Total: {fmt(meta.total)} users</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-300">← Prev</button>
                <span className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400">Page {page} / {meta.totalPages}</span>
                <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-300">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User to Company">
        <div className="flex flex-col gap-4">
          <Input label="User ID" value={addId} onChange={(e) => setAddId(e.target.value)} placeholder="Enter the numeric user ID" />
          <Btn onClick={handleAdd} loading={adding} className="w-full">Add User</Btn>
        </div>
      </Modal>
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title={`Change Role — ${roleModal?.name}`}>
        <div className="flex flex-col gap-4">
          <Input label="New Role ID" value={newRoleId} onChange={(e) => setNewRoleId(e.target.value)} placeholder="Enter role ID" />
          <Btn onClick={handleRoleSave} loading={savingRole} className="w-full">Update Role</Btn>
        </div>
      </Modal>
    </div>
  );
};

const TabSubscription = ({ companyId, toast }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState('free');
  const [expires, setExpires] = useState('');
  useEffect(() => {
    if (!companyId) return;
    companyApi.getSub(companyId).then(r => { setStatus(r.data.status); setPlan(r.data.status?.plan || 'free'); }).catch(e => toast(extractError(e), 'error')).finally(() => setLoading(false));
  }, [companyId, toast]);
  const save = async () => {
    setSaving(true);
    try {
      const r = await companyApi.updateSub(companyId, { plan, expiresAt: expires || null });
      setStatus(r.data.status);
      toast('Subscription updated');
    } catch (e) { toast(extractError(e), 'error'); }
    finally { setSaving(false); }
  };
  if (loading) return <Spinner />;
  const active = status?.active;
  const daysLeft = status?.daysLeft;
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className={cls('rounded-2xl p-5 border', active ? 'bg-emerald-50 dark:bg-emerald-900 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800')}>
        <div className="flex items-center justify-between mb-3"><h4 className="font-semibold text-slate-700 dark:text-slate-200">Current Subscription</h4><ActiveBadge active={active} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-slate-400 dark:text-slate-500">Plan</p><PlanBadge plan={status?.plan} /></div>
          <div><p className="text-xs text-slate-400 dark:text-slate-500">Days Remaining</p><p className={cls('text-lg font-bold', daysLeft < 10 ? 'text-red-600' : 'text-slate-800 dark:text-slate-100')}>{daysLeft === null ? '∞ Unlimited' : daysLeft === 0 ? 'Expired' : `${daysLeft} days`}</p></div>
          {status?.expiredAt && <div className="col-span-2"><p className="text-xs text-red-500">Expired on {new Date(status.expiredAt).toLocaleDateString()}</p></div>}
        </div>
        {daysLeft !== null && daysLeft >= 0 && <div className="mt-3"><Bar pct={Math.min((daysLeft / 365) * 100, 100)} color={daysLeft < 10 ? 'bg-red-400' : daysLeft < 30 ? 'bg-amber-400' : 'bg-emerald-400'} /></div>}
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-4">
        <h4 className="font-semibold text-slate-700 dark:text-slate-200">Change Plan</h4>
        <Select label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)}>{['free', 'starter', 'pro', 'enterprise'].map(p => <option key={p} value={p}>{PLAN_META[p].label}</option>)}</Select>
        <Input label="Expiry Date (optional)" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        <Btn onClick={save} loading={saving}>Update Subscription</Btn>
      </div>
    </div>
  );
};

const TabNotify = ({ companyId, toast }) => {
  const [f, setF] = useState({ title: '', message: '', type: 'COMPANY_ANNOUNCEMENT' });
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const set = (k) => (e) => setF(p => ({ ...p, [k]: e.target.value }));
  const send = async () => {
    if (!f.title || !f.message) return toast('Title and message are required', 'warning');
    setSending(true);
    try {
      const r = await companyApi.notify(companyId, f);
      setLastResult(r.data);
      toast(`Notification sent to ${r.data.recipientCount} users`);
      setF({ title: '', message: '', type: 'COMPANY_ANNOUNCEMENT' });
    } catch (e) { toast(extractError(e), 'error'); }
    finally { setSending(false); }
  };
  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <p className="text-sm text-slate-400 dark:text-slate-500">Broadcast a notification to all active users in this company.</p>
      {lastResult && <div className="bg-emerald-50 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><span>✓</span> Sent to {lastResult.recipientCount} recipient(s)</div>}
      <Select label="Notification Type" value={f.type} onChange={set('type')}>{['COMPANY_ANNOUNCEMENT', 'POLICY_UPDATE', 'SYSTEM_ALERT', 'REMINDER'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</Select>
      <Input label="Title" value={f.title} onChange={set('title')} placeholder="Important update" />
      <Textarea label="Message" value={f.message} onChange={set('message')} placeholder="Write your announcement here…" />
      <Btn onClick={send} loading={sending} icon="📢">Send to All Users</Btn>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  COMPANY DETAIL (single company view)                               */
/* ------------------------------------------------------------------ */
const CompanyDetail = ({ company: initial, onBack, onUpdated, toast }) => {
  const [company, setCompany] = useState(initial || {});
  const [tab, setTab] = useState('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [confirmData, setConfirmData] = useState(null);
  const confirm = useCallback((message, onConfirm) => setConfirmData({ message, onConfirm }), []);

  useEffect(() => { if (!company?.id) return; companyApi.getStats(company.id).then(r => setStats(r.data.stats)).catch(() => { }).finally(() => setLoadingStats(false)); }, [company.id]);

  const reload = async () => {
    try { const r = await companyApi.get(company.id); setCompany(r.data.company); onUpdated?.(r.data.company); } catch (e) { toast(extractError(e), 'error'); }
  };

  const handleEdit = async (vals) => {
    setSaving(true);
    try { await companyApi.update(company.id, vals); toast('Company updated'); setEditOpen(false); reload(); } catch (e) { toast(extractError(e), 'error'); } finally { setSaving(false); }
  };

  const handleToggle = async (activate) => {
    try {
      if (activate) await companyApi.reactivate(company.id); else await companyApi.deactivate(company.id);
      toast(`Company ${activate ? 'reactivated' : 'deactivated'}`);
      reload();
    } catch (e) { toast(extractError(e), 'error'); }
  };

  const handleLogoUpload = async (file) => {
    const fd = new FormData(); fd.append('logo', file);
    try { await companyApi.uploadLogo(company.id, fd); toast('Logo uploaded'); reload(); } catch (e) { toast(extractError(e), 'error'); }
  };

  const handleLogoDelete = async () => {
    try { await companyApi.deleteLogo(company.id); toast('Logo deleted'); reload(); } catch (e) { toast(extractError(e), 'error'); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
        <button onClick={onBack} className="hover:text-violet-600 transition-colors font-medium">Companies</button>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-medium">{company.name}</span>
      </div>
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cls('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === t ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300')}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && <TabOverview company={company} onEdit={() => setEditOpen(true)} onToggle={handleToggle} onLogoUpload={handleLogoUpload} onLogoDelete={handleLogoDelete} stats={stats} loadingStats={loadingStats} toast={toast} confirm={confirm} />}
      {tab === 'Dashboard' && <TabDashboard companyId={company.id} toast={toast} />}
      {tab === 'Settings' && <TabSettings companyId={company.id} toast={toast} />}
      {tab === 'Users' && <TabUsers companyId={company.id} toast={toast} confirm={confirm} />}
      {tab === 'Subscription' && <TabSubscription companyId={company.id} toast={toast} />}
      {tab === 'Notify' && <TabNotify companyId={company.id} toast={toast} />}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Company" wide>
        <CompanyForm key={company.id} initial={company} onSubmit={handleEdit} loading={saving} errors={{}} />
      </Modal>
      <ConfirmModal open={!!confirmData} onClose={() => setConfirmData(null)} message={confirmData?.message} onConfirm={confirmData?.onConfirm || (() => { })} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  ROOT COMPONENT                                                     */
/* ------------------------------------------------------------------ */
export default function CompanyManagement() {
  const { toast, Toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
        const userRes = await authApi.getMe();
        const user = userRes.data?.user || userRes.data;
        setCurrentUser(user);
        if (user?.company_id) {
          const compRes = await companyApi.get(user.company_id);
          setCompany(compRes.data.company || compRes.data);
        }
      } catch (e) {
        toast(extractError(e), 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      <Toast />
      {company ? <CompanyDetail company={company} onUpdated={setCompany} toast={toast} /> : <Empty text="No company found for your account" />}
    </div>
  );
}