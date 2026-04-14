import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Building2, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { TrendingUp } from "lucide-react";
// Helper function for color classes
const getColorClass = (color) => {
  const colorMap = {
    total: 'bg-gradient-to-br from-blue-500 to-blue-600',
    pending: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    approved: 'bg-gradient-to-br from-green-500 to-emerald-500',
    rejected: 'bg-gradient-to-br from-red-500 to-rose-500',
    cancelled: 'bg-gradient-to-br from-gray-500 to-gray-600',
    days: 'bg-gradient-to-br from-purple-500 to-indigo-500'
  };
  return colorMap[color] || 'bg-gradient-to-br from-gray-500 to-gray-600';
};




const StatCard = ({
  title,
  value,
  icon: Icon,
  loading = false,
  trend,
  trendValue,
  subtext,
  color = "indigo"
}) => {
  const colorClasses = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  };

  const trendColors = {
    up: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    down: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    neutral: "text-slate-600 bg-slate-50 dark:bg-slate-800"
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>

        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {typeof Icon === "string" ? (
            <span className="text-xl">{Icon}</span>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {trend && trendValue && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingUp className="h-3 w-3 rotate-180" />}
            <span>{trendValue}</span>
          </div>
        )}

        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
};



const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="p-4 space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 animate-pulse">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ hasFilters = false, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 lg:p-12 text-center transition-colors duration-200">
      <div className="max-w-md mx-auto">

        {/* ICON */}
        <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* TITLE */}
        <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
          No leave requests found
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {hasFilters
            ? "Try adjusting your filters to see more results"
            : "No leave requests found at this time."}
        </p>

        {/* REFRESH BUTTON (optional) */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 hover:shadow-lg"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};
const ErrorState = ({ error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Failed to load data
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
      {error || 'An unexpected error occurred. Please try again.'}
    </p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      Retry
    </button>
  </motion.div>
);
// Role Badge Component
const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    employee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[role] || styles.employee}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
    isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// UserCard Component (Mobile)
const UserCard = ({ user, isCurrentUser }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
      isCurrentUser 
        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900'
        : 'border-gray-200 dark:border-gray-700'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
            )}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
      <RoleBadge role={user.role} />
    </div>
    
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <Building2 className="w-4 h-4" />
        <span>{user.department}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <span>₹</span>
        <span>₹{user.baseSalary.toLocaleString('en-IN')}</span>
      </div>
      <div className="flex items-center justify-between">
        <StatusBadge isActive={user.isActive} />
      </div>
    </div>
  </motion.div>
);

// Table Component (Desktop)
const UserTable = ({ users, currentUserId }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Employee</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Department</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Salary</th>
          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
        </tr>
      </thead>
      <tbody>
        <AnimatePresence>
          {users.map((user) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                user.id === currentUserId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <RoleBadge role={user.role} />
              </td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.department}</td>
              <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                ₹{user.baseSalary.toLocaleString('en-IN')}
              </td>
              <td className="py-3 px-4">
                <StatusBadge isActive={user.isActive} />
              </td>
            </motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </table>
  </div>
);

const getStatusBadgeStyle = (status = "") => {
  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200";

  const statusStyles = {
    pending:
      "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",

    approved:
      "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700",

    rejected:
      "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700",

    cancelled:
      "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  };

  return `${baseClasses} ${
    statusStyles[status.toLowerCase()] ||
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
  }`;
};

const AlertMessage = ({ type = "success", message, onClose, onRetry }) => {
  const isSuccess = type === "success";
  const isError = type === "error";

  const styles = {
    container: isSuccess
      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
      : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800",

    text: isSuccess
      ? "text-green-800 dark:text-green-200"
      : "text-red-800 dark:text-red-200",

    icon: isSuccess
      ? "text-green-500 dark:text-green-400"
      : "text-red-500 dark:text-red-400",

    closeBtn: isSuccess
      ? "text-green-500 hover:text-green-700 dark:hover:text-green-300"
      : "text-red-500 hover:text-red-700 dark:hover:text-red-300",
  };

  return (
    <div className="mb-6 animate-fade-in">
      <div
        className={`border rounded-xl p-4 shadow-sm transition-all duration-300 ${styles.container}`}
      >
        <div className="flex items-start gap-3">
          
          {/* ICON */}
          <div className="flex-shrink-0">
            {isSuccess ? (
              <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* MESSAGE */}
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>

            {/* RETRY BUTTON */}
            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
              >
                Try Again
              </button>
            )}
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className={`${styles.closeBtn} transition-colors`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
const getStatusIcon = (status) => {
  const iconClasses = "w-5 h-5 transition-colors duration-200";
  
  switch (status?.toLowerCase()) {
    case 'approved':
      return (
        <svg className={`${iconClasses} text-green-600 dark:text-green-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'rejected':
      return (
        <svg className={`${iconClasses} text-red-600 dark:text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 dark:border-blue-400 mx-auto`}></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export { 
    LoadingSpinner, 
    formatDate,
    getStatusIcon,
  StatCard, 
  StatCardSkeleton, 
  TableSkeleton, 
  EmptyState, 
  getStatusBadgeStyle, 
  AlertMessage ,
  UserCard,
  UserTable,
  ErrorState
};