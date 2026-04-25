

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi} from '../api/leaveApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
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

// ==================== Constants ====================
const LEAVE_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

const STATUS_OPTIONS = ['all', ...Object.values(LEAVE_STATUS)];

const STATUS_BADGE_VARIANTS = {
  [LEAVE_STATUS.PENDING]: 'warning',
  [LEAVE_STATUS.APPROVED]: 'success',
  [LEAVE_STATUS.REJECTED]: 'danger',
  [LEAVE_STATUS.CANCELLED]: 'secondary'
};

const STATUS_ICONS = {
  [LEAVE_STATUS.PENDING]: Clock,
  [LEAVE_STATUS.APPROVED]: CheckCircle,
  [LEAVE_STATUS.REJECTED]: X,
  [LEAVE_STATUS.CANCELLED]: Info
};

const STATUS_COLORS = {
  [LEAVE_STATUS.PENDING]: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400'
  },
  [LEAVE_STATUS.APPROVED]: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-500 dark:text-emerald-400'
  },
  [LEAVE_STATUS.REJECTED]: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: 'text-rose-500 dark:text-rose-400'
  },
  [LEAVE_STATUS.CANCELLED]: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-500 dark:text-gray-400'
  }
};

const QUERY_KEYS = {
  MY_LEAVES: 'myLeaves',
  LEAVE_BALANCE: 'leaveBalance',
  PENDING_LEAVES: 'pendingLeaves'
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
};

const LEAVE_TYPES = [
  { id: 'annual', name: 'Annual Leave', icon: Umbrella, color: 'blue' },
  { id: 'sick', name: 'Sick Leave', icon: Heart, color: 'rose' },
  { id: 'personal', name: 'Personal Leave', icon: User, color: 'purple' },
  { id: 'maternity', name: 'Maternity Leave', icon: Baby, color: 'pink' },
  { id: 'paternity', name: 'Paternity Leave', icon: Baby, color: 'indigo' },
  { id: 'bereavement', name: 'Bereavement Leave', icon: Heart, color: 'gray' },
  { id: 'study', name: 'Study Leave', icon: GraduationCap, color: 'green' },
  { id: 'unpaid', name: 'Unpaid Leave', icon: Briefcase, color: 'orange' }
];

// ==================== Utility Functions ====================
const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(endDate - startDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch (error) {
    console.error('Error calculating days:', error);
    return 0;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  } catch {
    return dateString;
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

const sanitizeInput = (input) => {
  if (!input) return '';
  return input.replace(/[<>]/g, '').trim();
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayName = (dateString) => {
  try {
    return format(new Date(dateString), 'EEE');
  } catch {
    return '';
  }
};

const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

// ==================== Custom Hooks ====================
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const useAuth = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);

  const hasRole = useCallback((allowedRoles) => {
    if (!user?.role) return false;
    const userRole = user.role.toLowerCase();
    return allowedRoles.map(r => r.toLowerCase()).includes(userRole);
  }, [user]);

  const isManager = useMemo(() => {
    return hasRole(['manager', 'admin', 'hr']);
  }, [hasRole]);

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [navigate]);

  return { user, hasRole, isManager };
};

const useLeaveBalance = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.LEAVE_BALANCE],
    queryFn: async () => {
      const response = await leaveApi.getLeaveBalance({ requestId: 'leaveBalance' });

      const responseData = response?.data?.data || response?.data || response;

      return {
        id: responseData.id,
        employeeId: responseData.employeeId,
        totalAnnual: responseData.totalAnnual || 0,
        used: responseData.used || 0,
        remaining: responseData.remaining || 0,
        year: responseData.year || new Date().getFullYear(),
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        allLeaves: responseData.leaves?.all || [],
        approvedLeaves: responseData.leaves?.approved || [],
        rejectedLeaves: responseData.leaves?.rejected || [],
        pendingLeaves: responseData.leaves?.pending || []
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000)
  });
};

const useMyLeaves = (filters = {}) => {
  const { status, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = filters;

  return useQuery({
    queryKey: [QUERY_KEYS.MY_LEAVES, { status, page, limit }],
    queryFn: async () => {
      const response = await leaveApi.getMyLeaves({
        requestId: 'myLeaves',
        status: status !== 'all' ? status : undefined,
        page,
        limit
      });

      const responseData = response?.data?.data || response?.data || response;

      return {
        leaves: responseData.leaves?.all || responseData.leaves || responseData || [],
        pagination: responseData.pagination || {
          total: responseData.leaves?.all?.length || 0,
          page: PAGINATION.DEFAULT_PAGE,
          limit: PAGINATION.DEFAULT_LIMIT,
          totalPages: 1
        }
      };
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
    retry: 2
  });
};

const usePendingLeaves = (enabled = false) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PENDING_LEAVES],
    queryFn: async () => {
      const response = await leaveApi.getPendingLeaves({ requestId: 'pendingLeaves' });
      const responseData = response?.data?.data || response?.data || [];
      return responseData.leaves?.pending || responseData || [];
    },
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 60000,
    retry: 3
  });
};

const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveData) => {
      const response = await leaveApi.applyLeave({
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        reason: sanitizeInput(leaveData.reason),
        leaveType: leaveData.leaveType || 'annual'
      });

      if (!response?.success && response?.success !== undefined) {
        throw new Error(response?.message || 'Failed to apply leave');
      }

      return response?.data?.data || response?.data || response;
    },
    onSuccess: () => {
      toast.success('Leave application submitted successfully', {
        description: 'Your manager will review your request shortly.',
        icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
      });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
    },
    onError: (error) => {
      toast.error('Failed to apply for leave', {
        description: error.message || 'Please try again later.'
      });
    }
  });
};

const useReviewLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leaveId, reviewData }) => {
      const response = await leaveApi.reviewLeave(leaveId, {
        status: reviewData.status,
        decisionNote: sanitizeInput(reviewData.decisionNote)
      });

      if (!response?.success && response?.success !== undefined) {
        throw new Error(response?.message || 'Failed to review leave');
      }

      return response;
    },
    onSuccess: (_, { reviewData }) => {
      const statusMessages = {
        [LEAVE_STATUS.APPROVED]: 'Leave request approved successfully',
        [LEAVE_STATUS.REJECTED]: 'Leave request rejected'
      };

      toast.success(statusMessages[reviewData.status] || 'Review submitted successfully');

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
    },
    onError: (error) => {
      toast.error('Failed to review leave', {
        description: error.message || 'Please try again later.'
      });
    }
  });
};

const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveId) => {
      const response = await leaveApi.cancelLeave(leaveId);

      if (!response?.success && response?.success !== undefined) {
        throw new Error(response?.message || 'Failed to cancel leave');
      }

      return response;
    },
    onSuccess: () => {
      toast.success('Leave request cancelled successfully');

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_LEAVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
    },
    onError: (error) => {
      toast.error('Failed to cancel leave', {
        description: error.message || 'Please try again later.'
      });
    }
  });
};

// ==================== UI Components ====================
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

const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo', subtitle, onClick }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
    emerald: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
    amber: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
    rose: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700',
    blue: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    purple: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700'
  };

  return (
    <Card
      className={`relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
              }`}>
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
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

const EmptyState = ({ message, icon: Icon, action, description, illustration }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-2xl" />
      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
        {Icon && <Icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{message}</h3>
    {description && <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

const LoadingState = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl animate-pulse" />
      <Loader2 className="relative h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
    </div>
    <p className="text-gray-600 dark:text-gray-400 mt-6 font-medium">{message}</p>
  </div>
);

const SkeletonLoader = ({ rows = 5 }) => (
  <div className="space-y-4 p-6">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-14 rounded-xl" />
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-red-400 rounded-full opacity-20 blur-2xl" />
      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
    <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">{message}</p>
    <Button onClick={onRetry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

const RoleGuard = ({ children, allowedRoles, user }) => {
  if (!user?.role) return null;
  const userRole = user.role.toLowerCase();
  const hasAccess = allowedRoles.map(r => r.toLowerCase()).includes(userRole);

  if (!hasAccess) return null;
  return children;
};

// ==================== Leave Balance Components ====================
const LeaveBalanceOverview = ({ balance, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!balance) return null;

  const usedPercentage = calculatePercentage(balance.used, balance.totalAnnual);
  const remainingPercentage = calculatePercentage(balance.remaining, balance.totalAnnual);

  const stats = [
    {
      title: 'Total Annual Leave',
      value: `${balance.totalAnnual} days`,
      icon: CalendarDays,
      color: 'indigo',
      subtitle: `Year ${balance.year}`,
      trend: null
    },
    {
      title: 'Days Used',
      value: `${balance.used} days`,
      icon: TrendingUp,
      color: 'amber',
      subtitle: `${usedPercentage}% of total`,
      trend: usedPercentage
    },
    {
      title: 'Days Remaining',
      value: `${balance.remaining} days`,
      icon: Sparkles,
      color: 'emerald',
      subtitle: `${remainingPercentage}% available`,
      trend: remainingPercentage
    },
    {
      title: 'Pending Requests',
      value: `${balance.pendingLeaves?.length || 0}`,
      icon: Clock,
      color: 'purple',
      subtitle: 'Awaiting approval',
      trend: null
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-gray-800 dark:to-purple-950/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave Balance Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Used ({balance.used} days)</span>
                  <span className="text-gray-600 dark:text-gray-400">Remaining ({balance.remaining} days)</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                    style={{ width: `${usedPercentage}%` }}
                  />
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
                    style={{ width: `${remainingPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="inline-flex p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 mb-2">
                    <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.used}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Used Days</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mb-2">
                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.remaining}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-2">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.totalAnnual}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-48 h-48 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
              <circle
                cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="8"
                strokeDasharray={`${usedPercentage * 2.51} 251`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold fill-gray-900 dark:fill-white">
                {remainingPercentage}%
              </text>
            </svg>
          </div>
        </div>
      </Card>
    </>
  );
};

// ==================== Leave Table Components ====================
const LeaveTableRow = ({ leave, onReview, onCancel, isManager }) => {
  const StatusIcon = STATUS_ICONS[leave.status] || Info;
  const statusColors = STATUS_COLORS[leave.status] || STATUS_COLORS[LEAVE_STATUS.PENDING];
  const isPending = leave.status === LEAVE_STATUS.PENDING;

  return (
    <TableRow className={`group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${leave.isOptimistic ? 'opacity-70 animate-pulse' : ''}`}>
      <TableCell>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {formatShortDate(leave.startDate)}
            </span>
            <span className="text-gray-400 dark:text-gray-500">→</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatShortDate(leave.endDate)}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {getDayName(leave.startDate)} - {getDayName(leave.endDate)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${statusColors.bg}`}>
            <Calendar className={`h-4 w-4 ${statusColors.icon}`} />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{leave.daysRequested} days</span>
        </div>
      </TableCell>

      <TableCell className="max-w-xs">
        <div>
          <p className="text-gray-900 dark:text-white line-clamp-2" title={leave.reason}>
            {leave.reason}
          </p>
          {leave.leaveType && (
            <Badge variant="info" className="mt-1 text-xs">
              {leave.leaveType}
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <Badge variant={STATUS_BADGE_VARIANTS[leave.status]} icon={StatusIcon}>
          {leave.status}
        </Badge>
        {leave.decisionNote && leave.status === LEAVE_STATUS.REJECTED && (
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 line-clamp-1" title={leave.decisionNote}>
            {leave.decisionNote}
          </p>
        )}
      </TableCell>

      <TableCell>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(leave.createdAt)}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isPending && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(leave)}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          )}

          {isManager && isPending && (
            <Button
              size="sm"
              onClick={() => onReview(leave)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              Review
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="dark:text-gray-400"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const LeaveTable = ({ leaves, onReview, onCancel, isManager }) => {
  if (!leaves || leaves.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Date Range</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Duration</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Reason</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Applied</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map(leave => (
            <LeaveTableRow
              key={leave.id}
              leave={leave}
              onReview={onReview}
              onCancel={onCancel}
              isManager={isManager}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ==================== Pending Approvals Components ====================
const PendingApprovalRow = ({ leave, onReview }) => {
  const employee = leave.Employee || {};

  return (
    <TableRow className="group border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {employee.firstName?.[0]}{employee.lastName?.[0] || ''}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {employee.firstName} {employee.lastName || ''}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{employee.email || 'No email'}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {formatShortDate(leave.startDate)} - {formatShortDate(leave.endDate)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getDayName(leave.startDate)} - {getDayName(leave.endDate)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="warning" icon={Clock}>
          {leave.daysRequested} days
        </Badge>
      </TableCell>

      <TableCell className="max-w-xs">
        <p className="text-gray-900 dark:text-white line-clamp-2" title={leave.reason}>
          {leave.reason}
        </p>
      </TableCell>

      <TableCell>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(leave.createdAt)}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={() => onReview({ ...leave, decision: LEAVE_STATUS.APPROVED })}
          >
            <Check className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            onClick={() => onReview({ ...leave, decision: LEAVE_STATUS.REJECTED })}
          >
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => onReview(leave)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
          >
            Review
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const PendingApprovalsTable = ({ pendingLeaves, onReview }) => {
  if (!pendingLeaves || pendingLeaves.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Employee</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Date Range</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Duration</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Reason</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Applied</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingLeaves.map(leave => (
            <PendingApprovalRow key={leave.id} leave={leave} onReview={onReview} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// ==================== Apply Leave Form ====================
const ApplyLeaveForm = ({ balance, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'annual'
  });

  const calculatedDays = useMemo(() =>
    calculateDays(formData.startDate, formData.endDate),
    [formData.startDate, formData.endDate]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (!formData.endDate) {
      toast.error('Please select an end date');
      return false;
    }

    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);
    const today = new Date();

    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (startDateObj < today) {
      toast.error('Start date cannot be in the past');
      return false;
    }

    if (startDateObj > endDateObj) {
      toast.error('End date must be after or equal to start date');
      return false;
    }

    if (!formData.reason?.trim()) {
      toast.error('Please provide a reason for leave');
      return false;
    }

    if (formData.reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters)');
      return false;
    }

    if (balance && calculatedDays > balance.remaining) {
      toast.error(`You only have ${balance.remaining} days remaining. You requested ${calculatedDays} days.`);
      return false;
    }

    return true;
  }, [formData, balance, calculatedDays]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const hasExceededBalance = balance && calculatedDays > balance.remaining;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="startDate" className="text-gray-700 dark:text-gray-300 font-medium">
            Start Date <span className="text-rose-500">*</span>
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              min={getTodayDate()}
              required
              disabled={isSubmitting}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="endDate" className="text-gray-700 dark:text-gray-300 font-medium">
            End Date <span className="text-rose-500">*</span>
          </Label>
          <div className="relative mt-1.5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || getTodayDate()}
              required
              disabled={isSubmitting}
              className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="leaveType" className="text-gray-700 dark:text-gray-300 font-medium">
          Leave Type
        </Label>
        <select
          id="leaveType"
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {LEAVE_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>

      {formData.startDate && formData.endDate && (
        <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${hasExceededBalance
            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800'
          }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Duration</span>
            <span className={`text-2xl font-bold ${hasExceededBalance
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-indigo-600 dark:text-indigo-400'
              }`}>
              {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
            </span>
          </div>

          <ProgressBar
            value={calculatedDays}
            max={balance?.totalAnnual || 30}
            color={hasExceededBalance ? 'rose' : 'indigo'}
          />

          {balance && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Available: <span className="font-medium text-gray-900 dark:text-white">{balance.remaining} days</span>
              </span>
              {hasExceededBalance ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Exceeds balance by {calculatedDays - balance.remaining} days
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Within available balance
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="reason" className="text-gray-700 dark:text-gray-300 font-medium">
          Reason for Leave <span className="text-rose-500">*</span>
        </Label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          value={formData.reason}
          onChange={handleChange}
          placeholder="Please provide a detailed reason for your leave request..."
          required
          disabled={isSubmitting}
          className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
          <Info className="h-3 w-3" />
          Minimum 10 characters ({formData.reason?.length || 0}/10)
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || hasExceededBalance}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

// ==================== Review Leave Form ====================
const ReviewLeaveForm = ({ leave, onSubmit, onCancel, isSubmitting }) => {
  const [reviewData, setReviewData] = useState({
    status: leave.decision || '',
    decisionNote: ''
  });

  const handleSubmit = () => {
    if (!reviewData.status) {
      toast.error('Please select a decision');
      return;
    }

    if (reviewData.status === LEAVE_STATUS.REJECTED && !reviewData.decisionNote?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    onSubmit(reviewData);
  };

  const employee = leave.Employee || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {employee.firstName?.[0]}{employee.lastName?.[0] || ''}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {employee.firstName} {employee.lastName || 'Unknown'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email || 'No email provided'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</p>
            <p className="text-gray-900 dark:text-white font-medium mt-1">{employee.id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</p>
            <p className="text-gray-900 dark:text-white font-medium mt-1">{employee.department || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Leave Period</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
            <Badge variant="warning" icon={Clock}>
              {leave.daysRequested} {leave.daysRequested === 1 ? 'day' : 'days'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Applied On</span>
            <span className="text-sm text-gray-900 dark:text-white">{formatDateTime(leave.createdAt)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Reason</p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{leave.reason}</p>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-gray-900 dark:text-white mb-3 block">
          Decision <span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setReviewData({ status: LEAVE_STATUS.APPROVED, decisionNote: '' })}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${reviewData.status === LEAVE_STATUS.APPROVED
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reviewData.status === LEAVE_STATUS.APPROVED ? 'bg-emerald-500' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                <Check className={`h-5 w-5 ${reviewData.status === LEAVE_STATUS.APPROVED ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Approve</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Grant this leave request</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setReviewData(prev => ({ ...prev, status: LEAVE_STATUS.REJECTED }))}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${reviewData.status === LEAVE_STATUS.REJECTED
                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reviewData.status === LEAVE_STATUS.REJECTED ? 'bg-rose-500' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                <X className={`h-5 w-5 ${reviewData.status === LEAVE_STATUS.REJECTED ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Reject</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Decline this request</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {reviewData.status === LEAVE_STATUS.REJECTED && (
        <div>
          <Label htmlFor="decisionNote" className="text-gray-700 dark:text-gray-300 font-medium">
            Rejection Reason <span className="text-rose-500">*</span>
          </Label>
          <textarea
            id="decisionNote"
            name="decisionNote"
            rows={3}
            value={reviewData.decisionNote}
            onChange={(e) => setReviewData(prev => ({ ...prev, decisionNote: e.target.value }))}
            placeholder="Please provide a reason for rejection..."
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none transition-all duration-200"
            required
          />
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
            <Info className="h-3 w-3" />
            This reason will be shared with the employee
          </p>
        </div>
      )}

      {reviewData.status === LEAVE_STATUS.APPROVED && (
        <div>
          <Label htmlFor="decisionNote" className="text-gray-700 dark:text-gray-300 font-medium">
            Additional Comments (Optional)
          </Label>
          <textarea
            id="decisionNote"
            name="decisionNote"
            rows={2}
            value={reviewData.decisionNote}
            onChange={(e) => setReviewData(prev => ({ ...prev, decisionNote: e.target.value }))}
            placeholder="Add any additional comments..."
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
          />
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !reviewData.status}
          className={`${reviewData.status === LEAVE_STATUS.APPROVED
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
              : reviewData.status === LEAVE_STATUS.REJECTED
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            } text-white shadow-lg`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              {reviewData.status === LEAVE_STATUS.APPROVED && <Check className="h-4 w-4 mr-2" />}
              {reviewData.status === LEAVE_STATUS.REJECTED && <X className="h-4 w-4 mr-2" />}
              Submit Review
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
export const Leave = () => {
  const { user, isManager } = useAuth();
  const queryClient = useQueryClient();

  // Local UI State
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const debouncedFilter = useDebounce(statusFilter, 300);

  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance
  } = useLeaveBalance();

  const {
    data: leavesData,
    isLoading: leavesLoading,
    error: leavesError,
    refetch: refetchLeaves
  } = useMyLeaves({
    status: debouncedFilter,
    page: currentPage,
    limit: PAGINATION.DEFAULT_LIMIT
  });

  const {
    data: pendingLeaves = [],
    isLoading: pendingLoading,
    refetch: refetchPending
  } = usePendingLeaves(isManager && activeTab === 'pending-approvals');

  const applyLeaveMutation = useApplyLeave();
  const reviewLeaveMutation = useReviewLeave();
  const cancelLeaveMutation = useCancelLeave();

  const leaves = leavesData?.leaves || [];
  const pagination = leavesData?.pagination || {
    total: 0,
    page: PAGINATION.DEFAULT_PAGE,
    totalPages: 0
  };
  const balance = balanceData;

  const filteredLeaves = useMemo(() => {
    if (!searchQuery) return leaves;
    return leaves.filter(leave =>
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaves, searchQuery]);

  useEffect(() => {
    setCurrentPage(PAGINATION.DEFAULT_PAGE);
  }, [statusFilter]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchLeaves(),
      refetchBalance(),
      isManager && refetchPending()
    ].filter(Boolean));
    toast.success('Data refreshed successfully');
  }, [refetchLeaves, refetchBalance, refetchPending, isManager]);

  const handleApplyLeave = useCallback((formData) => {
    applyLeaveMutation.mutate(formData, {
      onSuccess: () => {
        setIsApplyModalOpen(false);
      }
    });
  }, [applyLeaveMutation]);

  const handleReviewLeave = useCallback((reviewData) => {
    if (selectedLeave) {
      reviewLeaveMutation.mutate({
        leaveId: selectedLeave.id,
        reviewData
      }, {
        onSuccess: () => {
          setIsReviewModalOpen(false);
          setSelectedLeave(null);
        }
      });
    }
  }, [selectedLeave, reviewLeaveMutation]);

  const handleCancelLeave = useCallback(() => {
    if (selectedLeave) {
      cancelLeaveMutation.mutate(selectedLeave.id, {
        onSuccess: () => {
          setIsCancelModalOpen(false);
          setSelectedLeave(null);
        }
      });
    }
  }, [selectedLeave, cancelLeaveMutation]);

  const handleOpenReview = useCallback((leave) => {
    setSelectedLeave(leave);
    setIsReviewModalOpen(true);
  }, []);

  const handleOpenCancel = useCallback((leave) => {
    setSelectedLeave(leave);
    setIsCancelModalOpen(true);
  }, []);

  const handleQuickApprove = useCallback((leave) => {
    reviewLeaveMutation.mutate({
      leaveId: leave.id,
      reviewData: { status: LEAVE_STATUS.APPROVED, decisionNote: '' }
    });
  }, [reviewLeaveMutation]);

  const handleQuickReject = useCallback((leave) => {
    reviewLeaveMutation.mutate({
      leaveId: leave.id,
      reviewData: { status: LEAVE_STATUS.REJECTED, decisionNote: 'Rejected by manager' }
    });
  }, [reviewLeaveMutation]);

  const isLoading = leavesLoading || balanceLoading;
  const error = leavesError || balanceError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Leave Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Manage your leave requests and track your balance effortlessly
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search leaves..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
              >
                <Plus className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            </div>
          </div>
        </div>

        {/* Leave Balance Overview */}
        <LeaveBalanceOverview balance={balance} isLoading={balanceLoading} />

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => { setActiveTab('my-leaves'); setCurrentPage(PAGINATION.DEFAULT_PAGE); }}
              className={`relative py-3 px-1 font-medium transition-all duration-200 ${activeTab === 'my-leaves'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Leaves
                <Badge variant="secondary" className="ml-2">
                  {leaves.length}
                </Badge>
              </div>
              {activeTab === 'my-leaves' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
              )}
            </button>

            <RoleGuard allowedRoles={['manager', 'admin', 'hr']} user={user}>
              <button
                onClick={() => { setActiveTab('pending-approvals'); setCurrentPage(PAGINATION.DEFAULT_PAGE); }}
                className={`relative py-3 px-1 font-medium transition-all duration-200 ${activeTab === 'pending-approvals'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Approvals
                  {pendingLeaves.length > 0 && (
                    <Badge variant="danger" className="ml-2 animate-pulse">
                      {pendingLeaves.length}
                    </Badge>
                  )}
                </div>
                {activeTab === 'pending-approvals' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
              </button>
            </RoleGuard>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`relative py-3 px-1 font-medium transition-all duration-200 ${activeTab === 'calendar'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </div>
              {activeTab === 'calendar' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'my-leaves' && leaves.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            {STATUS_OPTIONS.map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`capitalize transition-all duration-200 ${statusFilter === status
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                {status === 'all' ? 'All Requests' : status}
              </Button>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState message={error.message || 'Failed to load data'} onRetry={handleRefresh} />
        )}

        {/* My Leaves Section */}
        {activeTab === 'my-leaves' && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 shadow-xl">
            {isLoading ? (
              <SkeletonLoader rows={5} />
            ) : filteredLeaves.length === 0 ? (
              <EmptyState
                message={searchQuery ? "No matching leave requests found" : "No leave requests yet"}
                description={searchQuery ? "Try adjusting your search" : "Your leave requests will appear here"}
                icon={Calendar}
                action={
                  <Button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Apply for Leave
                  </Button>
                }
              />
            ) : (
              <>
                <LeaveTable
                  leaves={filteredLeaves}
                  onReview={handleOpenReview}
                  onCancel={handleOpenCancel}
                  isManager={isManager}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={pagination.total}
                  itemsPerPage={PAGINATION.DEFAULT_LIMIT}
                />
              </>
            )}
          </Card>
        )}

        {/* Pending Approvals Section */}
        {activeTab === 'pending-approvals' && (
          <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700 shadow-xl">
            <RoleGuard allowedRoles={['manager', 'admin', 'hr']} user={user}>
              {pendingLoading ? (
                <SkeletonLoader rows={3} />
              ) : pendingLeaves.length === 0 ? (
                <EmptyState
                  message="No pending approvals"
                  description="All leave requests have been reviewed"
                  icon={CheckCircle}
                />
              ) : (
                <PendingApprovalsTable
                  pendingLeaves={pendingLeaves}
                  onReview={handleOpenReview}
                />
              )}
            </RoleGuard>
          </Card>
        )}

        {/* Calendar View Section */}
        {activeTab === 'calendar' && (
          <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 shadow-xl">
            <EmptyState
              message="Calendar View Coming Soon"
              description="We're working on a beautiful calendar view for your leaves"
              icon={CalendarDays}
            />
          </Card>
        )}

        {/* Apply Leave Modal */}
        <Modal
          open={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Leave"
          size="lg"
        >
          <ApplyLeaveForm
            balance={balance}
            onSubmit={handleApplyLeave}
            onCancel={() => setIsApplyModalOpen(false)}
            isSubmitting={applyLeaveMutation.isPending}
          />
        </Modal>

        {/* Review Leave Modal */}
        <Modal
          open={isReviewModalOpen}
          onClose={() => { setIsReviewModalOpen(false); setSelectedLeave(null); }}
          title="Review Leave Request"
          size="xl"
        >
          {selectedLeave && (
            <ReviewLeaveForm
              leave={selectedLeave}
              onSubmit={handleReviewLeave}
              onCancel={() => { setIsReviewModalOpen(false); setSelectedLeave(null); }}
              isSubmitting={reviewLeaveMutation.isPending}
            />
          )}
        </Modal>

        {/* Cancel Leave Confirmation Modal */}
        <Modal
          open={isCancelModalOpen}
          onClose={() => { setIsCancelModalOpen(false); setSelectedLeave(null); }}
          title="Cancel Leave Request"
        >
          {selectedLeave && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-800 dark:text-amber-200 font-semibold mb-2">
                      Are you sure you want to cancel this leave request?
                    </p>
                    <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Dates:</span>
                        <span className="font-medium">{formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Duration:</span>
                        <Badge variant="warning">{selectedLeave.daysRequested} days</Badge>
                      </div>
                      {selectedLeave.status === LEAVE_STATUS.PENDING && (
                        <p className="text-amber-600 dark:text-amber-400 text-xs mt-3 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          This action cannot be undone. The request will be permanently removed.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => { setIsCancelModalOpen(false); setSelectedLeave(null); }}
                  disabled={cancelLeaveMutation.isPending}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Keep Request
                </Button>
                <Button
                  onClick={handleCancelLeave}
                  disabled={cancelLeaveMutation.isPending}
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-500/25"
                >
                  {cancelLeaveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yes, Cancel Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Leave;