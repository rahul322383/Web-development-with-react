// Payroll.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Lock, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  X,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { payrollApi } from '../api/payrollApi';
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

// ==================== Payroll Specific Components ====================

const PayrollStatusBadge = ({ status }) => {
  const statusConfig = {
    'Queued': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
    'Processing': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: RefreshCw },
    'Paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
    'Locked': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: Lock },
    'Failed': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle }
  };

  const config = statusConfig[status] || statusConfig['Queued'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const PayrollCard = ({ payroll }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {payroll.month}/{payroll.year}
              </span>
              <PayrollStatusBadge status={payroll.status} />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Net Salary: <span className="font-semibold text-gray-900 dark:text-white">₹{payroll.netSalary?.toLocaleString('en-IN')}</span>
              </span>
              {payroll.paidAt && (
                <span className="text-gray-500 dark:text-gray-400">
                  Paid: {formatDate(payroll.paidAt)}
                </span>
              )}
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
            <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Basic Salary</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{payroll.basicSalary?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allowances</p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    + ₹{payroll.allowances?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Deductions</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    - ₹{payroll.deductions?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created On</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(payroll.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PayrollTable = ({ payrolls }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 dark:bg-gray-800/50">
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month/Year</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basic Salary</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allowances</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deductions</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Salary</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        <AnimatePresence>
          {payrolls.map((payroll, index) => (
            <motion.tr
              key={payroll.id || index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  {payroll.month}/{payroll.year}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                ₹{payroll.basicSalary?.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-green-600 dark:text-green-400">
                + ₹{payroll.allowances?.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4 text-red-600 dark:text-red-400">
                - ₹{payroll.deductions?.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4">
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{payroll.netSalary?.toLocaleString('en-IN')}
                </span>
              </td>
              <td className="py-3 px-4">
                <PayrollStatusBadge status={payroll.status} />
              </td>
              <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                {payroll.paidAt ? formatDate(payroll.paidAt) : '-'}
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

// ==================== Main Component ====================

const Payroll = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'card' : 'table';
    }
    return 'table';
  });
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [alert, setAlert] = useState(null);

  // Available years for filtering
  const availableYears = useMemo(() => {
    const years = new Set();
    payrolls.forEach(p => years.add(p.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [payrolls]);

  // Filter payrolls
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(payroll => {
      if (selectedYear !== 'all' && payroll.year !== parseInt(selectedYear)) return false;
      if (selectedStatus !== 'all' && payroll.status !== selectedStatus) return false;
      return true;
    });
  }, [payrolls, selectedYear, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPaid = payrolls
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    const totalPending = payrolls
      .filter(p => p.status === 'Processing' || p.status === 'Queued')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
    
    const averageSalary = payrolls.length > 0 
      ? payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0) / payrolls.length 
      : 0;

    return { totalPaid, totalPending, averageSalary };
  }, [payrolls]);

  // Fetch payroll history
  const fetchPayrollHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollApi.getPayrollByEmployee(user.id);
      
      // Handle different response structures
      let payrollData = [];
      if (Array.isArray(response)) {
        payrollData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        payrollData = response.data;
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        payrollData = response.data.data;
      }
      
      setPayrolls(payrollData);
    } catch (err) {
      console.error('Error fetching payroll:', err);
      setError(err.message || 'Failed to fetch payroll history');
      setAlert({ type: 'error', message: err.message || 'Failed to fetch payroll history' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPayrollHistory();
    }
  }, [fetchPayrollHistory, user]);

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

  if (loading) {
    return <LoadingSpinner text="Loading payroll data..." />;
  }

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
                Payroll History
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your salary records and payment history
              </p>
              {user && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Employee: {user.firstName} {user.lastName} ({user.employeeCode})
                </p>
              )}
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'card'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Table
              </button>
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
        {!error && payrolls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard 
              icon={Wallet} 
              title="Total Paid" 
              value={`₹${stats.totalPaid.toLocaleString('en-IN')}`} 
              color="approved" 
            />
            <StatCard 
              icon={Clock} 
              title="Pending Amount" 
              value={`₹${stats.totalPending.toLocaleString('en-IN')}`} 
              color="pending" 
            />
            <StatCard 
              icon={TrendingUp} 
              title="Average Salary" 
              value={`₹${Math.round(stats.averageSalary).toLocaleString('en-IN')}`} 
              color="total" 
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Processing">Processing</option>
                <option value="Queued">Queued</option>
                <option value="Locked">Locked</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchPayrollHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {error ? (
          <ErrorState error={error} onRetry={fetchPayrollHistory} />
        ) : filteredPayrolls.length === 0 ? (
          <EmptyState 
            hasFilters={selectedYear !== 'all' || selectedStatus !== 'all'} 
            onRefresh={() => {
              setSelectedYear('all');
              setSelectedStatus('all');
            }}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {viewMode === 'table' ? (
              <PayrollTable payrolls={filteredPayrolls} />
            ) : (
              <div className="p-4 space-y-3">
                {filteredPayrolls.map((payroll, index) => (
                  <PayrollCard key={payroll.id || index} payroll={payroll} />
                ))}
              </div>
            )}
            
            {/* Results count */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredPayrolls.length} of {payrolls.length} payroll records
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payroll;