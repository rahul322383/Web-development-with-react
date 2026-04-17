import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  Sun,
  Moon,
  User,
  Mail,
  Briefcase,
  TrendingUp,
  CalendarDays,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Users,
  FileText,
  Bell,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Share2,
  Printer,
  Settings,
  LogOut,
  Home,
  LayoutDashboard,
  Menu,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Shield,
  Award,
  Target,
  Coffee,
  Umbrella,
  Plane,
  Heart,
  Baby,
  GraduationCap,
  Building,
  Laptop,
  Smartphone,
  Send
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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
  subtitle,
  color = "indigo",
  onClick
}) => {
  const gradients = {
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600"
  };

  const trendStyles = {
    up: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    down: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="rounded-xl p-6 border bg-white dark:bg-slate-900 animate-pulse">
        <div className="flex justify-between">
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-6 border bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all ${onClick ? "cursor-pointer" : ""
        }`}
    >
      {/* Hover gradient glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-0 hover:opacity-5 transition`}
      />

      <div className="relative">
        {/* Top Section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>

          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}
          >
            {typeof Icon === "string" ? (
              <span className="text-white text-xl">{Icon}</span>
            ) : (
              <Icon className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex justify-between items-center">
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendStyles[trend]}`}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && (
                <TrendingUp className="h-3 w-3 rotate-180" />
              )}
              <span>{trendValue}</span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
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


const EmptyState = ({
  title = "No data found",
  description,
  icon: Icon,
  illustration,
  action,
  hasFilters = false,
  onRefresh,
  compact = false
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center 
      ${compact ? "py-10" : "py-16 px-6"} 
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
      rounded-2xl shadow-sm transition-all`}
    >
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 hover:opacity-5 blur-2xl transition" />

      <div className="relative max-w-md mx-auto">
        {/* ICON / ILLUSTRATION */}
        <div className="mb-6 flex justify-center">
          {illustration ? (
            <img src={illustration} alt="empty" className="h-28 object-contain" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
              {Icon ? (
                <Icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* TITLE */}
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {description ||
            (hasFilters
              ? "Try adjusting your filters to see more results."
              : "There’s nothing here yet.")}
        </p>

        {/* ACTION BUTTON / CUSTOM ACTION */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          {action}

          {!action && onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white 
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
              transition-all hover:shadow-lg"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
const ErrorState = ({
  title = "Something went wrong",
  message,
  error,
  icon: Icon,
  onRetry,
  action,
  compact = false
}) => {
  const displayMessage =
    message || error || "An unexpected error occurred. Please try again.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col items-center justify-center text-center 
      ${compact ? "py-10" : "py-16 px-6"} 
      bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
      rounded-2xl shadow-sm`}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-red-400 opacity-0 hover:opacity-5 blur-2xl transition" />

      <div className="relative max-w-md mx-auto">
        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 flex items-center justify-center">
            {Icon ? (
              <Icon className="h-10 w-10 text-rose-600 dark:text-rose-400" />
            ) : (
              <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
            )}
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* MESSAGE */}
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {displayMessage}
        </p>

        {/* ACTION */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          {action}

          {!action && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white 
              bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 
              transition-all hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
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

const Badge = ({ children, variant = 'default', className = '', icon: Icon }) => {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all duration-200 ${variants[variant]} ${className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
};

const ProgressBar = ({ value, max = 100, color = 'indigo', showPercentage = true, height = 'h-2' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    indigo: 'bg-indigo-600 dark:bg-indigo-500',
    emerald: 'bg-emerald-600 dark:bg-emerald-500',
    amber: 'bg-amber-600 dark:bg-amber-500',
    rose: 'bg-rose-600 dark:bg-rose-500',
    blue: 'bg-blue-600 dark:bg-blue-500',
    purple: 'bg-purple-600 dark:bg-purple-500'
  };

  return (
    <div className="space-y-1.5">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${colors[color]} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{value} days</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};



const Modal = ({ open, onClose, title, children, size = 'md', showClose = true }) => {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 duration-200`}>
        {title && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 ${currentPage === pageNum
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                    : 'dark:border-gray-600 dark:text-gray-300'
                  }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl animate-pulse" />
      <Loader2 className="relative h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
    </div>
    <p className="text-gray-600 dark:text-gray-400 mt-6 font-medium">{message}</p>
  </div>
);
export { 
  LoadingState,
Modal,
  Pagination,
ProgressBar,
Badge,
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