import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  RefreshCw,
  Download,
  Users,
  Wallet,
  FileText,
  CheckCircle,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  DollarSign,
  AlertTriangle,
  FileX,
  Loader2,
  Leaf,
  CreditCard,
} from 'lucide-react';
import { yearEndApi } from '../api/yearEndApi';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

// FIX #10: Named constant instead of magic number
const POST_GENERATE_REFETCH_DELAY_MS = 300;

// ─────────────────────────────────────────────
// INLINE UI COMPONENTS
// ─────────────────────────────────────────────

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
    <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>
  </div>
);

const AlertMessage = ({ type, message, onClose }) => {
  const bg =
    type === 'success'
      ? 'bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300'
      : 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-300';
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`border-l-4 p-4 rounded-r-lg flex items-center justify-between mb-4 ${bg}`}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400" />
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Something went wrong</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    )}
  </div>
);

const EmptyState = ({ hasFilters, onRefresh }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <FileX className="w-16 h-16 text-gray-400 dark:text-gray-500" />
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
      {hasFilters ? 'No matching records' : 'No year‑end summaries yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">
      {hasFilters
        ? 'Try adjusting your search or filters.'
        : 'Generate the first summary for the selected year.'}
    </p>
    {hasFilters && (
      <button
        onClick={onRefresh}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      >
        <X className="w-4 h-4" /> Clear Filters
      </button>
    )}
  </div>
);

const StatCard = ({ icon: Icon, title, value, color }) => {
  const gradients = {
    total: 'from-violet-500 to-indigo-600',
    approved: 'from-emerald-500 to-green-600',
    pending: 'from-amber-500 to-orange-600',
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[color] || gradients.total} flex items-center justify-center text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// BADGE HELPERS
// ─────────────────────────────────────────────

const LeaveTypeBadge = ({ type }) => {
  const colors = {
    SICK: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    CASUAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    ANNUAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
    >
      {type}
    </span>
  );
};

const StatusBadge = ({ status, isFinalized }) => {
  // Reusable for both leave status and expense status fields
  const isApproved = status?.toLowerCase().includes('approved');
  const isRejected = status?.toLowerCase().includes('rejected');
  // If isFinalized is explicitly passed (for row-level status), use that logic
  if (typeof isFinalized === 'boolean') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${isFinalized
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}
      >
        {isFinalized ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {isFinalized ? 'Finalized' : 'Pending'}
      </span>
    );
  }
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${isApproved
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : isRejected
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        }`}
    >
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────
// DETAIL TABLES
// ─────────────────────────────────────────────

const LeavesTable = ({ leaves }) => (
  <div className="mt-2">
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
      <Leaf className="w-4 h-4 text-green-500" /> Leaves ({leaves.length})
    </h4>
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['Period', 'Type', 'Unit', 'Days', 'Status', 'Reason', 'Note'].map((h) => (
              <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {leaves.map((l) => (
            <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                {l.startDate} → {l.endDate}
              </td>
              <td className="py-2 px-3">
                <LeaveTypeBadge type={l.leaveType} />
              </td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 capitalize">
                {l.leaveUnit?.replace('_', ' ') || '-'}
              </td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{l.daysRequested}</td>
              <td className="py-2 px-3">
                <StatusBadge status={l.status} />
              </td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{l.reason || '-'}</td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{l.decisionNote || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ExpensesTable = ({ expenses }) => (
  <div className="mt-2">
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
      <CreditCard className="w-4 h-4 text-blue-500" /> Expenses ({expenses.length})
    </h4>
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['Category', 'Amount', 'Currency', 'Manager', 'Finance', 'Payment', 'Paid At', 'Description'].map((h) => (
              <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {expenses.map((e) => (
            <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 capitalize">{e.category}</td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 font-medium">
                ₹{Number(e.amount).toLocaleString('en-IN')}
              </td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{e.currency || 'INR'}</td>
              <td className="py-2 px-3">
                <StatusBadge status={e.managerApprovalStatus} />
              </td>
              <td className="py-2 px-3">
                <StatusBadge status={e.financeApprovalStatus} />
              </td>
              <td className="py-2 px-3">
                <StatusBadge status={e.paymentStatus} />
              </td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                {e.paidAt
                  ? new Date(e.paidAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  : '-'}
              </td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{e.description || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// CARD VIEW
// ─────────────────────────────────────────────

const CardView = ({ summary, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {summary.employeeName[0]}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{summary.employeeName}</span>
              <StatusBadge isFinalized={summary.isFinalized} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Salary: ₹{Number(summary.totalSalaryPaid).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-600 dark:text-gray-400">Leaves: {summary.totalLeavesTaken}</span>
              <span className="text-gray-600 dark:text-gray-400">
                Expenses: ₹{Number(summary.totalExpensesClaimed).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Employee ID</span>
                  <p className="font-medium text-gray-900 dark:text-white">{summary.employeeId}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Year</span>
                  <p className="font-medium text-gray-900 dark:text-white">{summary.year}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Salary</span>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    ₹{Number(summary.totalSalaryPaid).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Leaves</span>
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    {summary.totalLeavesTaken} days
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</span>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    ₹{Number(summary.totalExpensesClaimed).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                  <StatusBadge isFinalized={summary.isFinalized} />
                </div>
              </div>
              {summary.leaves?.length > 0 && <LeavesTable leaves={summary.leaves} />}
              {summary.expenses?.length > 0 && <ExpensesTable expenses={summary.expenses} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// EXPANDABLE TABLE ROW
// FIX #5: <motion.tr> height animation doesn't work in tables.
// The expanded content is rendered in a plain <tr>, with the animation
// applied to an inner <div> instead of the row itself.
// ─────────────────────────────────────────────

const ExpandableTableRow = ({ summary, index }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {summary.employeeName[0]}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{summary.employeeName}</span>
          </div>
        </td>
        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{summary.employeeId}</td>
        <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">
          ₹{Number(summary.totalSalaryPaid).toLocaleString('en-IN')}
        </td>
        <td className="py-3 px-4 text-orange-600 dark:text-orange-400 font-medium">{summary.totalLeavesTaken}</td>
        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
          ₹{Number(summary.totalExpensesClaimed).toLocaleString('en-IN')}
        </td>
        <td className="py-3 px-4">
          <StatusBadge isFinalized={summary.isFinalized} />
        </td>
        <td className="py-3 px-4">
          <ChevronRight
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </td>
      </motion.tr>

      {/* FIX #5: Plain <tr> + inner animated <div> — avoids broken height animation on <tr> */}
      {expanded && (
        <tr className="bg-gray-50 dark:bg-gray-800/50">
          <td colSpan={7} className="p-0 overflow-hidden">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {summary.leaves?.length > 0 && <LeavesTable leaves={summary.leaves} />}
                {summary.expenses?.length > 0 && <ExpensesTable expenses={summary.expenses} />}
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// HELPERS (defined at module level — no ordering issues)
// ─────────────────────────────────────────────

// FIX #3: Pure function outside component — no stale-closure risk in useCallback
const transformSummaries = (raw) => {
  if (!Array.isArray(raw)) raw = raw?.data ?? raw?.summaries ?? [];
  return raw.map((s) => ({
    ...s,
    employeeName:
      s.employee?.firstName || s.employee?.lastName
        ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim()
        : `Employee ${s.employeeId}`,
    employeeEmail: s.employee?.email || '',
    leaves: s.leaves || [],
    expenses: s.expenses || [],
  }));
};

const escapeCSV = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

const buildCSV = (summaries, year) => {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Year',
    'Total Salary Paid',
    'Total Leaves Taken',
    'Total Expenses Claimed',
    'Status',
  ];
  const rows = summaries.map((s) => [
    s.employeeId,
    s.employeeName,
    s.year ?? year,
    s.totalSalaryPaid,
    s.totalLeavesTaken,
    s.totalExpensesClaimed,
    s.isFinalized ? 'Finalized' : 'Pending',
  ]);
  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const YearEnd = () => {
  const { user } = useAuth();

  // FIX #6: Lazy initializer avoids SSR flash — viewMode is set correctly on first render
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'card' : 'table'
  );

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [alert, setAlert] = useState(null);

  // FIX #10: Store timer ref so we can clean it up on unmount
  const refetchTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(refetchTimerRef.current), []);

  // ── Derived state ────────────────────────────────────────────────────────

  const isAdmin = useMemo(() => {
    if (!user) return false;
    // FIX #7: Guard each field before accessing, handle all role shapes
    const roles = [user.role, user.primaryRole, ...(Array.isArray(user.roles) ? user.roles : [])]
      .filter(Boolean)
      .map((r) => (typeof r === 'string' ? r : r?.name))
      .filter(Boolean)
      .map((r) => r.toLowerCase());
    return roles.includes('admin');
  }, [user]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // FIX #1: filteredSummaries defined BEFORE handleExportCSV so the closure always
  // sees the correct value. Both are memos/callbacks depending on the same state.
  const filteredSummaries = useMemo(
    () =>
      summaries.filter((s) => {
        if (statusFilter !== 'all') {
          if (s.isFinalized !== (statusFilter === 'finalized')) return false;
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            (s.employeeName || '').toLowerCase().includes(term) ||
            String(s.employeeId).includes(term)
          );
        }
        return true;
      }),
    [summaries, statusFilter, searchTerm]
  );

  const stats = useMemo(() => {
    const totalEmployees = summaries.length;
    const totalSalary = summaries.reduce((sum, s) => sum + (Number(s.totalSalaryPaid) || 0), 0);
    const totalLeaves = summaries.reduce((sum, s) => sum + (s.totalLeavesTaken || 0), 0);
    const totalExpenses = summaries.reduce((sum, s) => sum + (Number(s.totalExpensesClaimed) || 0), 0);
    const finalized = summaries.filter((s) => s.isFinalized).length;
    return { totalEmployees, totalSalary, totalLeaves, totalExpenses, finalized };
  }, [summaries]);

  // ── Actions ──────────────────────────────────────────────────────────────

  // FIX #2: clearAlert and clearFilters defined early, before any JSX that references them
  const clearAlert = useCallback(() => setAlert(null), []);
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
  }, []);

  const fetchYearEndSummaries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await yearEndApi.getYearEndSummaries(selectedYear);
      setSummaries(transformSummaries(res));
    } catch (err) {
      setError(err.message || 'Failed to fetch year-end summaries');
      setAlert({ type: 'error', message: err.message || 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  const handleGenerateSummary = useCallback(
    async (year) => {
      if (generating) return;
      try {
        setGenerating(true);
        setError(null);
        const response = await yearEndApi.generateYearEndSummary(year);
        const isSuccess = response?.success === true || response?.data?.success === true;
        if (isSuccess) {
          setAlert({
            type: 'success',
            message: response?.message || response?.data?.message || `Year-end ${year} generated!`,
          });
          setShowGenerateModal(false);
          // FIX #10: Uses named constant; delay exists to give the DB time to commit
          refetchTimerRef.current = setTimeout(() => fetchYearEndSummaries(), POST_GENERATE_REFETCH_DELAY_MS);
        } else {
          throw new Error(response?.message || response?.data?.message || 'Generation failed');
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message });
      } finally {
        setGenerating(false);
      }
    },
    [generating, fetchYearEndSummaries]
  );

  // FIX #4: useCallback with filteredSummaries in deps — always exports the current filtered list
  // FIX #8: Guards for environments without URL.createObjectURL (e.g. some SSR contexts)
  const handleExportCSV = useCallback(() => {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      setAlert({ type: 'error', message: 'CSV export is not supported in this browser.' });
      return;
    }
    const csvContent = buildCSV(filteredSummaries, selectedYear);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-end-summary-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setAlert({ type: 'success', message: 'CSV exported successfully!' });
  }, [filteredSummaries, selectedYear]);

  // FIX #9: Clamped year input handler — rejects NaN, clamps to valid range
  const handleYearInputChange = useCallback((e) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      setSelectedYear(Math.max(2000, Math.min(new Date().getFullYear() + 5, parsed)));
    }
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user) fetchYearEndSummaries();
  }, [fetchYearEndSummaries, user]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner text="Loading year-end summaries..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Year‑End Summary</h1>
              <p className="text-gray-600 dark:text-gray-400">
                View annual employee summaries including salary, leaves, and expenses
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {isAdmin && (
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" /> Generate
                </button>
              )}

              {summaries.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}

              {/* View mode toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                {[
                  {
                    mode: 'card',
                    label: 'Cards',
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    ),
                  },
                  {
                    mode: 'table',
                    label: 'Table',
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    ),
                  },
                ].map(({ mode, label, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-md text-sm flex items-center gap-1 ${viewMode === mode
                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert */}
        <AnimatePresence>
          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={clearAlert} />}
        </AnimatePresence>

        {/* Stats */}
        {!error && summaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={Users} title="Total Employees" value={stats.totalEmployees} color="total" />
            <StatCard icon={Wallet} title="Total Salary" value={`₹${stats.totalSalary.toLocaleString('en-IN')}`} color="approved" />
            <StatCard icon={Calendar} title="Total Leaves" value={stats.totalLeaves} color="pending" />
            <StatCard icon={DollarSign} title="Total Expenses" value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`} color="total" />
            <StatCard icon={CheckCircle} title="Finalized" value={`${stats.finalized}/${stats.totalEmployees}`} color="approved" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="finalized">Finalized</option>
              <option value="pending">Pending</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={fetchYearEndSummaries}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <ErrorState error={error} onRetry={fetchYearEndSummaries} />
        ) : filteredSummaries.length === 0 ? (
          <EmptyState hasFilters={!!(searchTerm || statusFilter !== 'all')} onRefresh={clearFilters} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      {['Employee', 'ID', 'Total Salary', 'Leaves', 'Expenses', 'Status', ''].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredSummaries.map((s, idx) => (
                      <ExpandableTableRow key={s.employeeId ?? idx} summary={s} index={idx} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredSummaries.map((s, idx) => (
                  <CardView key={s.employeeId ?? idx} summary={s} index={idx} />
                ))}
              </div>
            )}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredSummaries.length} of {summaries.length} employees for year {selectedYear}
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generate Year‑End Summary
                </h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Year
                </label>
                {/* FIX #9: Clamped input — NaN is rejected, value never silently stuck */}
                <input
                  type="number"
                  value={selectedYear}
                  onChange={handleYearInputChange}
                  min={2000}
                  max={new Date().getFullYear() + 5}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This will generate year‑end summary for all employees for {selectedYear}.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerateSummary(selectedYear)}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearEnd;