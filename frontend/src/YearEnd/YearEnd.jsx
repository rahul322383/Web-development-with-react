import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Search,
  DollarSign,
  AlertTriangle,
  FileX,
  Loader2,
} from 'lucide-react';
import { yearEndApi } from '../api/yearEndApi';
import { useAuth } from '../context/AuthContext';

/* ---------- inline UI components (dark‑mode ready) ---------- */
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
      className={`border-l-4 p-4 rounded-r-lg flex items-center justify-between ${bg}`}
    >
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertTriangle className="w-5 h-5" />
        )}
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
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
      Something went wrong
    </h3>
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
          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradients[color] || gradients.total
            } flex items-center justify-center text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {title}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ---------- main YearEnd component ---------- */
const YearEnd = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  // initial responsive view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewMode(window.innerWidth < 768 ? 'card' : 'table');
    }
  }, []);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    const roles = [
      user.role,
      user.primaryRole,
      ...(user.roles || []),
    ]
      .filter(Boolean)
      .map((r) => (typeof r === 'string' ? r : r.name))
      .map((r) => r?.toLowerCase());
    return roles.includes('admin');
  }, [user]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // transform raw data once
  const transformSummaries = (raw) => {
    if (!Array.isArray(raw)) raw = raw?.data ?? raw?.summaries ?? [];
    return raw.map((s) => ({
      ...s,
      employeeName:
        s.employee?.firstName || s.employee?.lastName
          ? `${s.employee.firstName || ''} ${s.employee.lastName || ''}`.trim()
          : `Employee ${s.employeeId}`,
      employeeEmail: s.employee?.email || '',
    }));
  };

  const fetchYearEndSummaries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await yearEndApi.getYearEndSummaries(selectedYear);
      const data = transformSummaries(res);
      setSummaries(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch year-end summaries');
      setAlert({ type: 'error', message: err.message || 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  const handleGenerateSummary = async (year) => {
    if (generating) return;
    try {
      setGenerating(true);
      setError(null);
      const response = await yearEndApi.generateYearEndSummary(year);
      const isSuccess =
        response?.success === true || response?.data?.success === true;
      if (isSuccess) {
        setAlert({
          type: 'success',
          message:
            response?.message ||
            response?.data?.message ||
            `Year-end ${year} generated!`,
        });
        setShowGenerateModal(false);
        // tiny delay to let the backend settle
        setTimeout(() => fetchYearEndSummaries(), 300);
      } else {
        throw new Error(
          response?.message || response?.data?.message || 'Generation failed'
        );
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const escapeCSV = (val) => `"${String(val).replace(/"/g, '""')}"`;
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'Employee Name',
      'Year',
      'Total Salary Paid',
      'Total Leaves Taken',
      'Total Expenses Claimed',
      'Status',
    ];
    const rows = filteredSummaries.map((s) => [
      s.employeeId,
      s.employeeName,
      s.year,
      s.totalSalaryPaid,
      s.totalLeavesTaken,
      s.totalExpensesClaimed,
      s.isFinalized ? 'Finalized' : 'Pending',
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-end-summary-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setAlert({ type: 'success', message: 'CSV exported successfully!' });
  };

  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      if (statusFilter !== 'all') {
        const isFinalized = statusFilter === 'finalized';
        if (s.isFinalized !== isFinalized) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const name = (s.employeeName || '').toLowerCase();
        const id = String(s.employeeId);
        return name.includes(term) || id.includes(term);
      }
      return true;
    });
  }, [summaries, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalEmployees = summaries.length;
    const totalSalary = summaries.reduce(
      (sum, s) => sum + (Number(s.totalSalaryPaid) || 0),
      0
    );
    const totalLeaves = summaries.reduce(
      (sum, s) => sum + (s.totalLeavesTaken || 0),
      0
    );
    const totalExpenses = summaries.reduce(
      (sum, s) => sum + (Number(s.totalExpensesClaimed) || 0),
      0
    );
    const finalized = summaries.filter((s) => s.isFinalized).length;
    return { totalEmployees, totalSalary, totalLeaves, totalExpenses, finalized };
  }, [summaries]);

  useEffect(() => {
    if (user) fetchYearEndSummaries();
  }, [fetchYearEndSummaries, user]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };
  const clearAlert = () => setAlert(null);

  if (loading) return <LoadingSpinner text="Loading year-end summaries..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Year‑End Summary
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View annual employee summaries including salary, leaves, and
                expenses
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
              {/* view toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md text-sm flex items-center gap-1 ${viewMode === 'card'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  title="Card view"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md text-sm flex items-center gap-1 ${viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  title="Table view"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Table
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* alert */}
        <AnimatePresence>
          {alert && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={clearAlert}
            />
          )}
        </AnimatePresence>

        {/* summary statistics */}
        {!error && summaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              icon={Users}
              title="Total Employees"
              value={stats.totalEmployees}
              color="total"
            />
            <StatCard
              icon={Wallet}
              title="Total Salary"
              value={`₹${stats.totalSalary.toLocaleString('en-IN')}`}
              color="approved"
            />
            <StatCard
              icon={Calendar}
              title="Total Leaves"
              value={stats.totalLeaves}
              color="pending"
            />
            <StatCard
              icon={DollarSign}
              title="Total Expenses"
              value={`₹${stats.totalExpenses.toLocaleString('en-IN')}`}
              color="total"
            />
            <StatCard
              icon={CheckCircle}
              title="Finalized"
              value={`${stats.finalized}/${stats.totalEmployees}`}
              color="approved"
            />
          </div>
        )}

        {/* search + filters */}
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

        {/* main content */}
        {error ? (
          <ErrorState error={error} onRetry={fetchYearEndSummaries} />
        ) : filteredSummaries.length === 0 ? (
          <EmptyState
            hasFilters={!!(searchTerm || statusFilter !== 'all')}
            onRefresh={clearFilters}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Employee
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        ID
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Total Salary
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Leaves
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Expenses
                      </th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredSummaries.map((s, idx) => (
                      <tr
                        key={s.employeeId || idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {s.employeeName[0]}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {s.employeeName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {s.employeeId}
                        </td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">
                          ₹{Number(s.totalSalaryPaid).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-orange-600 dark:text-orange-400 font-medium">
                          {s.totalLeavesTaken}
                        </td>
                        <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
                          ₹{Number(s.totalExpensesClaimed).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${s.isFinalized
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }`}
                          >
                            {s.isFinalized ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Finalized
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" /> Pending
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredSummaries.map((s, idx) => (
                  <CardView key={s.employeeId || idx} summary={s} index={idx} />
                ))}
              </div>
            )}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredSummaries.length} of {summaries.length} employees
              for year {selectedYear}
            </div>
          </div>
        )}
      </div>

      {/* generate modal */}
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
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(parseInt(e.target.value, 10) || selectedYear)
                  }
                  min={2000}
                  max={new Date().getFullYear() + 5}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This will generate year‑end summary for all employees for{' '}
                  {selectedYear}.
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

/* -------- CardView sub‑component (used when viewMode = 'card') -------- */
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
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {summary.employeeName[0]}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {summary.employeeName}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${summary.isFinalized
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}
              >
                {summary.isFinalized ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> Finalized
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" /> Pending
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Salary: ₹{Number(summary.totalSalaryPaid).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Leaves: {summary.totalLeavesTaken}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Expenses: ₹{Number(summary.totalExpensesClaimed).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''
              }`}
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
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Employee ID
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.employeeId}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Year</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {summary.year}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Salary
                </span>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  ₹{Number(summary.totalSalaryPaid).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Leaves
                </span>
                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  {summary.totalLeavesTaken} days
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Total Expenses
                </span>
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  ₹{Number(summary.totalExpensesClaimed).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${summary.isFinalized
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}
                >
                  {summary.isFinalized ? (
                    <>
                      <CheckCircle className="w-3 h-3" /> Finalized
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> Pending
                    </>
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default YearEnd;