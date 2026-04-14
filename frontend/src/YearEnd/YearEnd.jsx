// YearEnd.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  Wallet,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
  Filter,
  Search,
  BarChart3,
  PieChart,
  DollarSign,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { yearEndApi } from '../api/yearEndApi';
import { 
  LoadingSpinner, 
  formatDate,
  StatCard, 
  EmptyState, 
  AlertMessage,
  ErrorState
} from '../components/ui/StatCardSkeleton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// ==================== Year-End Specific Components ====================

const YearEndStatusBadge = ({ isFinalized }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
      isFinalized 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }`}>
      {isFinalized ? (
        <>
          <CheckCircle className="w-3 h-3" />
          Finalized
        </>
      ) : (
        <>
          <Clock className="w-3 h-3" />
          Pending
        </>
      )}
    </span>
  );
};

const YearEndCard = ({ summary, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {summary.employeeName?.charAt(0) || 'E'}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {summary.employeeName || `Employee #${summary.employeeId}`}
              </span>
              <YearEndStatusBadge isFinalized={summary.isFinalized} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total Salary: <span className="font-semibold text-gray-900 dark:text-white">₹{summary.totalSalaryPaid?.toLocaleString('en-IN')}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Leaves: <span className="font-semibold text-gray-900 dark:text-white">{summary.totalLeavesTaken}</span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Expenses: <span className="font-semibold text-gray-900 dark:text-white">₹{summary.totalExpensesClaimed?.toLocaleString('en-IN')}</span>
              </span>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-100 dark:border-gray-700"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">#{summary.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Year</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{summary.year}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Salary Paid</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ₹{summary.totalSalaryPaid?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Leaves Taken</p>
                  <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {summary.totalLeavesTaken} days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expenses Claimed</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ₹{summary.totalExpensesClaimed?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <YearEndStatusBadge isFinalized={summary.isFinalized} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const YearEndTable = ({ summaries }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-800/50">
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Salary</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Leaves</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Expenses</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        <AnimatePresence>
          {summaries.map((summary, index) => (
            <motion.tr
              key={summary.employeeId || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {summary.employeeName?.charAt(0) || 'E'}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {summary.employeeName || `Employee #${summary.employeeId}`}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                #{summary.employeeId}
              </td>
              <td className="py-3 px-4">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ₹{summary.totalSalaryPaid?.toLocaleString('en-IN')}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {summary.totalLeavesTaken} days
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  ₹{summary.totalExpensesClaimed?.toLocaleString('en-IN')}
                </span>
              </td>
              <td className="py-3 px-4">
                <YearEndStatusBadge isFinalized={summary.isFinalized} />
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

const GenerateYearEndModal = ({ isOpen, onClose, onGenerate, loading, selectedYear }) => {
  const [year, setYear] = useState(selectedYear || new Date().getFullYear());

  useEffect(() => {
    if (selectedYear) setYear(selectedYear);
  }, [selectedYear]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Generate Year-End Summary
          </h2>
          <button
            onClick={onClose}
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
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min={2000}
            max={new Date().getFullYear() + 5}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This will generate year-end summary for all employees for the year {year}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(year)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ==================== Main Component ====================

const YearEnd = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'card' : 'table';
    }
    return 'table';
  });

  // Available years for filter
  const availableYears = useMemo(() => {
    const years = new Set();
    summaries.forEach(s => years.add(s.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [summaries]);

  // Filter summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter(summary => {
      // Status filter
      if (statusFilter !== 'all') {
        const isFinalized = statusFilter === 'finalized';
        if (summary.isFinalized !== isFinalized) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = (summary.employeeName || '').toLowerCase();
        const employeeId = summary.employeeId.toString();
        return employeeName.includes(searchLower) || employeeId.includes(searchLower);
      }
      
      return true;
    });
  }, [summaries, statusFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = summaries.length;
    const totalSalaryPaid = summaries.reduce((sum, s) => sum + (s.totalSalaryPaid || 0), 0);
    const totalLeavesTaken = summaries.reduce((sum, s) => sum + (s.totalLeavesTaken || 0), 0);
    const totalExpensesClaimed = summaries.reduce((sum, s) => sum + (s.totalExpensesClaimed || 0), 0);
    const finalizedCount = summaries.filter(s => s.isFinalized).length;
    
    return { totalEmployees, totalSalaryPaid, totalLeavesTaken, totalExpensesClaimed, finalizedCount };
  }, [summaries]);

  // Fetch year-end summaries
  const fetchYearEndSummaries = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await yearEndApi.getYearEndSummaries(selectedYear);
      
      // Handle different response structures
      let summariesData = [];
      if (Array.isArray(response)) {
        summariesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        summariesData = response.data;
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        summariesData = response.data.data;
      }
      
      setSummaries(summariesData);
    } catch (err) {
      console.error('Error fetching year-end summaries:', err);
      setError(err.message || 'Failed to fetch year-end summaries');
      setAlert({ type: 'error', message: err.message || 'Failed to fetch year-end summaries' });
    } finally {
      setLoading(false);
    }
  }, [user, selectedYear]);

  // Generate year-end summary
  const handleGenerateSummary = async (year) => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await yearEndApi.generateYearEndSummary(year);
      
      if (response && response.success) {
        setAlert({ 
          type: 'success', 
          message: response.message || `Year-end summary for ${year} generated successfully!` 
        });
        setShowGenerateModal(false);
        // Refresh the data
        await fetchYearEndSummaries();
      } else {
        throw new Error(response?.message || 'Failed to generate summary');
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setAlert({ type: 'error', message: err.message || 'Failed to generate year-end summary' });
    } finally {
      setGenerating(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Year', 'Total Salary Paid', 'Total Leaves Taken', 'Total Expenses Claimed', 'Status'];
    const csvData = filteredSummaries.map(s => [
      s.employeeId,
      s.employeeName || `Employee #${s.employeeId}`,
      s.year,
      s.totalSalaryPaid,
      s.totalLeavesTaken,
      s.totalExpensesClaimed,
      s.isFinalized ? 'Finalized' : 'Pending'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-end-summary-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setAlert({ type: 'success', message: 'CSV exported successfully!' });
  };

  useEffect(() => {
    if (user) {
      fetchYearEndSummaries();
    }
  }, [fetchYearEndSummaries, user]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'card' : 'table');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear alert
  const clearAlert = () => setAlert(null);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return <LoadingSpinner text="Loading year-end summaries..." />;
  }

  // Check if user is admin (can generate summaries)
  const isAdmin = user?.role === 'admin' || user?.primaryRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Year-End Summary
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View annual employee summaries including salary, leaves, and expenses
              </p>
            </div>
            
            <div className="flex gap-2">
              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Generate Button (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Generate
                </button>
              )}
              
              {/* Export Button */}
              {summaries.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
              
              {/* View Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'card'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert Message */}
        {alert && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={clearAlert}
          />
        )}

        {/* Statistics Cards */}
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
              title="Total Salary Paid" 
              value={`₹${stats.totalSalaryPaid.toLocaleString('en-IN')}`} 
              color="approved" 
            />
            <StatCard 
              icon={Calendar} 
              title="Total Leaves" 
              value={stats.totalLeavesTaken} 
              color="pending" 
            />
            <StatCard 
              icon={DollarSign} 
              title="Total Expenses" 
              value={`₹${stats.totalExpensesClaimed.toLocaleString('en-IN')}`} 
              color="total" 
            />
            <StatCard 
              icon={CheckCircle} 
              title="Finalized" 
              value={`${stats.finalizedCount}/${stats.totalEmployees}`} 
              color="approved" 
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="finalized">Finalized</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex gap-2">
              <button
                onClick={fetchYearEndSummaries}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
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
              <YearEndTable summaries={filteredSummaries} />
            ) : (
              <div className="p-4 space-y-3">
                {filteredSummaries.map((summary, index) => (
                  <YearEndCard key={summary.employeeId || index} summary={summary} index={index} />
                ))}
              </div>
            )}
            
            {/* Results count */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredSummaries.length} of {summaries.length} employees for year {selectedYear}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      <GenerateYearEndModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateSummary}
        loading={generating}
        selectedYear={selectedYear}
      />
    </div>
  );
};

export default YearEnd;