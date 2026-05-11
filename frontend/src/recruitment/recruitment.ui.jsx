// recruitment.ui.jsx  — shared primitives used across all recruitment pages

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const JOB_STATUS_CONFIG = {
  Draft:     { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',       dot: 'bg-gray-400' },
  Published: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Paused:    { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',  dot: 'bg-amber-500' },
  Closed:    { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',          dot: 'bg-red-500' },
  Expired:   { color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',     dot: 'bg-slate-400' },
};

export const APP_STATUS_CONFIG = {
  Applied:             { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',       step: 1 },
  Screening:           { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', step: 2 },
  Shortlisted:         { color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', step: 3 },
  'Interview Scheduled':{ color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', step: 4 },
  Interviewed:         { color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300', step: 5 },
  Selected:            { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', step: 6 },
  Rejected:            { color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',             step: 0 },
  'Offer Sent':        { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', step: 7 },
  'Offer Accepted':    { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',          step: 8 },
  Joined:              { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',      step: 9 },
};

export const INTERVIEW_RESULT_CONFIG = {
  Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Passed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Failed:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'No Show':'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

export const Badge = ({ label, colorClass }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
    {label}
  </span>
);

export const JobStatusBadge = ({ status }) => {
  const cfg = JOB_STATUS_CONFIG[status] ?? JOB_STATUS_CONFIG.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export const AppStatusBadge = ({ status }) => {
  const cfg = APP_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export const InterviewResultBadge = ({ result }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${INTERVIEW_RESULT_CONFIG[result] ?? ''}`}>
    {result}
  </span>
);

// ── Spinner ────────────────────────────────────────────────────────────────

export const Spinner = ({ className = 'w-8 h-8' }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${className}`} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Spinner className="w-10 h-10" />
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────

export const Empty = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 text-3xl">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xs">{description}</p>}
    {action}
  </div>
);

// ── Modal shell ────────────────────────────────────────────────────────────

export const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
          ✕
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ── Form primitives ────────────────────────────────────────────────────────

const inputBase = 'w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors';

export const Input = ({ label, error, required, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input className={`${inputBase} ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} {...props} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, required, rows = 4, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea rows={rows} className={`${inputBase} resize-none ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} {...props} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, error, required, children, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select className={`${inputBase} appearance-none ${error ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}`} {...props}>
      {children}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Btn = ({ variant = 'primary', size = 'md', loading, children, className = '', ...props }) => {
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
    ghost:     'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────

export const StatCard = ({ icon, label, value, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600',
    emerald:'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600',
    amber:  'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
};

// ── Confirm dialog ─────────────────────────────────────────────────────────

export const Confirm = ({ message, onConfirm, onCancel, danger = false }) => (
  <Modal title="Confirm" onClose={onCancel}>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Btn>
    </div>
  </Modal>
);

// ── Pagination ─────────────────────────────────────────────────────────────

export const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  return (
    <div className="flex items-center justify-between mt-6 px-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</Btn>
        <Btn variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next →</Btn>
      </div>
    </div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Format helpers ─────────────────────────────────────────────────────────

export const fmtSalary = (v, currency = 'INR') =>
  v != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v)
    : '—';

export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
