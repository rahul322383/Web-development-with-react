// Leave.jsx
import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    memo,
    useRef,
} from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leaveApi';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
    Calendar, Plus, Clock, CheckCircle, AlertCircle, RefreshCw,
    ChevronLeft, ChevronRight, Loader2, X, FileText, Check, Trash2,
    Info, AlertTriangle, TrendingUp, CalendarDays, Search, Eye,
    ArrowUpRight, ArrowDownRight, Sparkles, Umbrella, Heart,
    Briefcase, Send,
} from 'lucide-react';

/* ========================== Constants ========================== */
const LEAVE_STATUS = Object.freeze({
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
});

const STATUS_BADGE_VARIANTS = Object.freeze({
    [LEAVE_STATUS.PENDING]: 'warning',
    [LEAVE_STATUS.APPROVED]: 'success',
    [LEAVE_STATUS.REJECTED]: 'danger',
    [LEAVE_STATUS.CANCELLED]: 'secondary',
});

const STATUS_ICONS = Object.freeze({
    [LEAVE_STATUS.PENDING]: Clock,
    [LEAVE_STATUS.APPROVED]: CheckCircle,
    [LEAVE_STATUS.REJECTED]: X,
    [LEAVE_STATUS.CANCELLED]: Info,
});

const QUERY_KEYS = Object.freeze({
    MY_LEAVES: 'myLeaves',
    LEAVE_BALANCE: 'leaveBalance',
    PENDING_LEAVES: 'pendingLeaves',
});

const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
});

const LEAVE_TYPES = Object.freeze([
    { id: 'CASUAL', name: 'Casual Leave', icon: Umbrella, color: 'blue' },
    { id: 'SICK', name: 'Sick Leave', icon: Heart, color: 'rose' },
    { id: 'PAID', name: 'Paid Leave', icon: Briefcase, color: 'green' },
    { id: 'UNPAID', name: 'Unpaid Leave', icon: Clock, color: 'gray' },
]);

const MANAGER_ROLES = new Set(['manager', 'admin', 'hr']);

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/* ========================== Utilities ========================== */
const dateCache = new Map();
const parseDate = (str) => {
    if (!str) return null;
    if (dateCache.has(str)) return dateCache.get(str);
    const d = new Date(str);
    if (isNaN(d.getTime())) {
        dateCache.set(str, null);
        return null;
    }
    // Avoid unbounded cache
    if (dateCache.size > 500) dateCache.clear();
    dateCache.set(str, d);
    return d;
};

const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(`${start}T00:00:00`);
    const e = new Date(`${end}T00:00:00`);
    if (isNaN(s) || isNaN(e)) return 0;
    return Math.floor(Math.abs(e - s) / MS_PER_DAY) + 1;
};

const formatDate = (str) => {
    const d = parseDate(str);
    return d ? format(d, 'MMM dd, yyyy') : 'N/A';
};

const formatShortDate = (str) => {
    const d = parseDate(str);
    return d ? format(d, 'dd MMM yyyy') : 'N/A';
};

const getDayName = (str) => {
    const d = parseDate(str);
    return d ? format(d, 'EEE') : '';
};

const sanitizeInput = (s) => (s ? s.replace(/[<>]/g, '').trim() : '');

const getTodayDate = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

const calculatePercentage = (v, total) =>
    total ? Math.round((v / total) * 100) : 0;

const unwrap = (resp) => {
    let d = resp?.data ?? resp;
    for (let i = 0; i < 3; i++) {
        if (d && typeof d === 'object' && 'data' in d && !('leaves' in d) && !('summary' in d)) {
            d = d.data;
        } else break;
    }
    return d;
};

/* ========================== Hooks ========================== */
const useDebounce = (value, delay = 300) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
};

const useLeaveBalance = () =>
    useQuery({
        queryKey: [QUERY_KEYS.LEAVE_BALANCE],
        queryFn: async () => {
            const data = unwrap(await leaveApi.getLeaveBalance()) || {};
            return {
                id: data.id,
                totalAnnual: data.totalAnnual || 0,
                used: data.used || 0,
                remaining: data.remaining || 0,
                year: data.year || new Date().getFullYear(),
                leaves: data.leaves || [],
                pendingLeaves: data.leaves?.pending || [],
            };
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 3,
    });

const useMyLeaves = (status, page, limit) =>
    useQuery({
        queryKey: [QUERY_KEYS.MY_LEAVES, { status, page, limit }],
        queryFn: async () => {
            const data = unwrap(
                await leaveApi.getMyLeaves({
                    status: status !== 'all' ? status : undefined,
                    page,
                    limit,
                })
            ) || {};
            return {
                leaves: data.leaves?.all || data.leaves || (Array.isArray(data) ? data : []),
                pagination: data.pagination || { total: 0, page, totalPages: 0 },
            };
        },
        placeholderData: (prev) => prev,
        staleTime: 2 * 60 * 1000,
        retry: 2,
    });

const usePendingLeaves = (enabled) =>
    useQuery({
        queryKey: [QUERY_KEYS.PENDING_LEAVES],
        queryFn: async () => {
            const data = unwrap(await leaveApi.getPendingLeaves()) || [];
            return data.leaves?.pending || (Array.isArray(data) ? data : []);
        },
        enabled,
        staleTime: 30 * 1000,
        refetchInterval: enabled ? 60_000 : false,
    });

const invalidateAll = (queryClient) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MY_LEAVES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PENDING_LEAVES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVE_BALANCE] });
};

const useApplyLeave = (user) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData) =>
            leaveApi.applyLeave({
                employeeId: user?.id,               // correct field
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: sanitizeInput(formData.reason),
                leaveType: formData.leaveType,
                leaveUnit: formData.leaveUnit || 'FULL_DAY',
            }),
        onSuccess: () => {
            toast.success('Leave applied successfully');
            invalidateAll(queryClient);
        },
        onError: (error) => toast.error('Failed to apply', { description: error.message }),
    });
};

const useReviewLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ leaveId, reviewData }) =>
            leaveApi.reviewLeave(leaveId, {
                status: reviewData.status,
                decisionNote: sanitizeInput(reviewData.decisionNote),
            }),
        onSuccess: () => {
            toast.success('Review submitted');
            invalidateAll(queryClient);
        },
        onError: (error) => toast.error('Review failed', { description: error.message }),
    });
};

const useCancelLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (leaveId) => leaveApi.cancelLeave(leaveId),
        onSuccess: () => {
            toast.success('Leave cancelled');
            invalidateAll(queryClient);
        },
        onError: (error) => toast.error('Cancel failed', { description: error.message }),
    });
};

/* ========================== UI primitives ========================== */
const BADGE_VARIANTS = Object.freeze({
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
    secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800',
});

const Badge = memo(({ children, variant = 'default', className = '', icon: Icon }) => (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${BADGE_VARIANTS[variant]} ${className}`}>
        {Icon && <Icon className="h-3 w-3" />}
        {children}
    </span>
));
Badge.displayName = 'Badge';

const PROGRESS_COLORS = Object.freeze({
    indigo: 'bg-indigo-600 dark:bg-indigo-500',
    emerald: 'bg-emerald-600 dark:bg-emerald-500',
    amber: 'bg-amber-600 dark:bg-amber-500',
    rose: 'bg-rose-600 dark:bg-rose-500',
});

const ProgressBar = memo(({ value, max = 100, color = 'indigo', showPercentage = true, height = 'h-2' }) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
        <div className="space-y-1.5">
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${height}`}>
                <div
                    className={`${PROGRESS_COLORS[color]} ${height} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            {showPercentage && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{value} days</span>
                    <span>{Math.round(percent)}%</span>
                </div>
            )}
        </div>
    );
});
ProgressBar.displayName = 'ProgressBar';

const STATCARD_GRADIENTS = Object.freeze({
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    purple: 'from-purple-500 to-purple-600',
});

const StatCard = memo(({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => (
    <Card className="relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        <div className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${STATCARD_GRADIENTS[color]} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                {trend != null && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
        </div>
    </Card>
));
StatCard.displayName = 'StatCard';

const MODAL_SIZES = Object.freeze({ sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' });

const Modal = memo(({ open, onClose, title, children, size = 'md' }) => {
    // Lock body scroll + ESC handler
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose?.();
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]} max-h-[90vh] overflow-hidden`}>
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} aria-label="Close" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">{children}</div>
            </div>
        </div>
    );
});
Modal.displayName = 'Modal';

const Pagination = memo(({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, 5];
        if (currentPage >= totalPages - 2)
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {startItem} to {endItem} of {totalItems}
            </span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((n) => (
                    <Button
                        key={n}
                        variant={currentPage === n ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(n)}
                        className={currentPage === n ? 'bg-indigo-600 text-white' : ''}
                        aria-current={currentPage === n ? 'page' : undefined}
                    >
                        {n}
                    </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});
Pagination.displayName = 'Pagination';

const EmptyState = memo(({ message, icon: Icon, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
            {Icon && <Icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{message}</h3>
        {description && <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">{description}</p>}
        {action}
    </div>
));
EmptyState.displayName = 'EmptyState';

const SkeletonLoader = memo(({ rows = 5 }) => (
    <div className="space-y-4 p-6">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 h-14 rounded-xl" />
        ))}
    </div>
));
SkeletonLoader.displayName = 'SkeletonLoader';

const ErrorState = memo(({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-6">{message}</p>
        <Button onClick={onRetry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
    </div>
));
ErrorState.displayName = 'ErrorState';

/* ========================== Leave-specific rows ========================== */
const LeaveTableRow = memo(({ leave, onReview, onCancel, isManager }) => {
    const StatusIcon = STATUS_ICONS[leave.status] || Info;
    const isPending = leave.status === LEAVE_STATUS.PENDING;

    const handleCancel = useCallback(() => onCancel(leave), [leave, onCancel]);
    const handleReview = useCallback(() => onReview(leave), [leave, onReview]);

    return (
        <TableRow className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
            <TableCell>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{formatShortDate(leave.startDate)}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{formatShortDate(leave.endDate)}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                        {getDayName(leave.startDate)} - {getDayName(leave.endDate)}
                    </span>
                </div>
            </TableCell>
            <TableCell><Badge variant="info">{leave.daysRequested} days</Badge></TableCell>
            <TableCell className="max-w-xs">
                <p className="line-clamp-2" title={leave.reason}>{leave.reason}</p>
            </TableCell>
            <TableCell>
                <Badge variant={STATUS_BADGE_VARIANTS[leave.status]} icon={StatusIcon}>{leave.status}</Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-500">{formatDate(leave.createdAt)}</TableCell>
            <TableCell>
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isPending && (
                        <Button size="sm" variant="outline" onClick={handleCancel} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                            <X className="h-3 w-3 mr-1" /> Cancel
                        </Button>
                    )}
                    {isManager && isPending && (
                        <Button size="sm" onClick={handleReview} className="bg-indigo-600 text-white">
                            <Eye className="h-3 w-3 mr-1" /> Review
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
});
LeaveTableRow.displayName = 'LeaveTableRow';

const LeaveTable = memo(({ leaves, onReview, onCancel, isManager }) => {
    if (!leaves?.length) return null;
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead>Date Range</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leaves.map((l) => (
                    <LeaveTableRow key={l.id} leave={l} onReview={onReview} onCancel={onCancel} isManager={isManager} />
                ))}
            </TableBody>
        </Table>
    );
});
LeaveTable.displayName = 'LeaveTable';

const PendingApprovalRow = memo(({ leave, onReview }) => {
    const emp = leave.Employee || {};
    const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`;

    const reviewDefault = useCallback(() => onReview(leave), [leave, onReview]);
    const approve = useCallback(
        () => onReview({ ...leave, decision: LEAVE_STATUS.APPROVED }),
        [leave, onReview]
    );
    const reject = useCallback(
        () => onReview({ ...leave, decision: LEAVE_STATUS.REJECTED }),
        [leave, onReview]
    );

    return (
        <TableRow className="group hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                        {initials}
                    </div>
                    <div>
                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <span className="font-medium">
                    {formatShortDate(leave.startDate)} - {formatShortDate(leave.endDate)}
                </span>
            </TableCell>
            <TableCell><Badge variant="warning">{leave.daysRequested} days</Badge></TableCell>
            <TableCell className="max-w-xs"><p className="line-clamp-2">{leave.reason}</p></TableCell>
            <TableCell className="text-sm text-gray-500">{formatDate(leave.createdAt)}</TableCell>
            <TableCell>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={approve} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={reject} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                        <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                    <Button size="sm" onClick={reviewDefault} className="bg-indigo-600 text-white">Review</Button>
                </div>
            </TableCell>
        </TableRow>
    );
});
PendingApprovalRow.displayName = 'PendingApprovalRow';

const PendingApprovalsTable = memo(({ pendingLeaves, onReview }) => {
    if (!pendingLeaves?.length) return null;
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                    <TableHead>Employee</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pendingLeaves.map((l) => <PendingApprovalRow key={l.id} leave={l} onReview={onReview} />)}
            </TableBody>
        </Table>
    );
});
PendingApprovalsTable.displayName = 'PendingApprovalsTable';

/* ========================== Apply Leave Form ========================== */
const INITIAL_FORM = Object.freeze({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'CASUAL',
    leaveUnit: 'FULL_DAY',
});

const ApplyLeaveForm = memo(({ balance, onSubmit, onCancel, isSubmitting }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const todayStr = useMemo(getTodayDate, []);

    const updateField = useCallback((field) => (e) => {
        const value = e.target.value;
        setForm((prev) => (prev[field] === value ? prev : { ...prev, [field]: value }));
    }, []);

    const daysRequested = useMemo(
        () => calculateDays(form.startDate, form.endDate),
        [form.startDate, form.endDate]
    );

    const exceedsBalance = useMemo(
        () => !!(balance && form.leaveType !== 'UNPAID' && daysRequested > balance.remaining),
        [balance, form.leaveType, daysRequested]
    );

    const reasonLength = form.reason.trim().length;

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!form.startDate || !form.endDate) {
            return toast.error('Please select both start and end dates');
        }

        const start = new Date(`${form.startDate}T00:00:00`);
        const end = new Date(`${form.endDate}T00:00:00`);
        if (end < start) return toast.error('End date must be after start date');

        if (reasonLength < 10) return toast.error('Reason must be at least 10 characters');

        if (exceedsBalance) {
            return toast.error(`You only have ${balance.remaining} days remaining`);
        }

        onSubmit(form);
    }, [form, exceedsBalance, balance, onSubmit, reasonLength]);

    const isDisabled = isSubmitting || !form.startDate || !form.endDate || exceedsBalance || reasonLength < 10;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Start Date *</Label>
                    <Input type="date" value={form.startDate} onChange={updateField('startDate')} min={todayStr} required />
                </div>
                <div>
                    <Label>End Date *</Label>
                    <Input type="date" value={form.endDate} onChange={updateField('endDate')} min={form.startDate || todayStr} required />
                </div>
            </div>

            <div>
                <Label>Leave Type</Label>
                <select
                    value={form.leaveType}
                    onChange={updateField('leaveType')}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5"
                >
                    {LEAVE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>

            {form.startDate && form.endDate && (
                <div className={`p-4 rounded-xl border-2 ${exceedsBalance ? 'bg-rose-50 border-rose-200' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'}`}>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Duration</span>
                        <span className={`text-2xl font-bold ${exceedsBalance ? 'text-rose-600' : 'text-indigo-600'}`}>
                            {daysRequested} days
                        </span>
                    </div>
                    <ProgressBar
                        value={daysRequested}
                        max={balance?.totalAnnual || 30}
                        color={exceedsBalance ? 'rose' : 'indigo'}
                    />
                    {balance && (
                        <div className="flex justify-between text-sm mt-2">
                            <span>Available: {balance.remaining} days</span>
                            {exceedsBalance ? (
                                <span className="text-rose-600 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" /> Exceeds balance
                                </span>
                            ) : (
                                <span className="text-emerald-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> Within balance
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div>
                <Label>Reason *</Label>
                <textarea
                    value={form.reason}
                    onChange={updateField('reason')}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3"
                    placeholder="Detailed reason..."
                    required
                    minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({reasonLength}/10)
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                <Button
                    type="submit"
                    disabled={isDisabled}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Submit
                </Button>
            </div>
        </form>
    );
});
ApplyLeaveForm.displayName = 'ApplyLeaveForm';

// ✅ Added missing ReviewLeaveForm component
const ReviewLeaveForm = memo(({ leave, onSubmit, onCancel, isSubmitting }) => {
    const [review, setReview] = useState({
        status: leave.decision || '',
        decisionNote: '',
    });
    const emp = leave.Employee || {};

    const handleSubmit = useCallback(() => {
        if (!review.status) return toast.error('Select a decision');
        if (review.status === LEAVE_STATUS.REJECTED && !review.decisionNote.trim()) {
            return toast.error('Provide rejection reason');
        }
        onSubmit(review);
    }, [review, onSubmit]);

    const setStatus = useCallback((status) => {
        setReview((prev) => ({ ...prev, status, decisionNote: status === LEAVE_STATUS.APPROVED ? '' : prev.decisionNote }));
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">{emp.firstName} {emp.lastName}</h3>
                        <p className="text-sm text-gray-500">{emp.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Leave Period</p>
                        <p className="font-medium">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Duration</p>
                        <Badge variant="warning">{leave.daysRequested} days</Badge>
                    </div>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Reason</p>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3">{leave.reason}</div>
                </div>
            </div>

            <div>
                <Label className="text-base font-semibold mb-3 block">Decision *</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setStatus(LEAVE_STATUS.APPROVED)}
                        className={`p-4 rounded-xl border-2 text-left ${review.status === LEAVE_STATUS.APPROVED
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-emerald-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="font-medium">Approve</p>
                                <p className="text-xs text-gray-500">Grant this leave</p>
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus(LEAVE_STATUS.REJECTED)}
                        className={`p-4 rounded-xl border-2 text-left ${review.status === LEAVE_STATUS.REJECTED
                                ? 'border-rose-500 bg-rose-50'
                                : 'border-gray-200 hover:border-rose-300'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <X className="h-5 w-5 text-rose-600" />
                            <div>
                                <p className="font-medium">Reject</p>
                                <p className="text-xs text-gray-500">Decline this leave</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {review.status === LEAVE_STATUS.REJECTED && (
                <div>
                    <Label>Rejection Reason *</Label>
                    <textarea
                        value={review.decisionNote}
                        onChange={(e) => setReview((prev) => ({ ...prev, decisionNote: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3"
                        placeholder="Explain why..."
                        required
                    />
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !review.status}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Review
                </Button>
            </div>
        </div>
    );
});
ReviewLeaveForm.displayName = 'ReviewLeaveForm';

/* ========================== Main Component ========================== */
export const Leave = () => {
    const { user, isLoading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState('my-leaves');
    const [statusFilter] = useState('all'); // reserved for future filter UI
    const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Modal state combined to reduce re-renders
    const [modal, setModal] = useState({ type: null, leave: null });
    const closeModal = useCallback(() => setModal({ type: null, leave: null }), []);

    const isManager = useMemo(
        () => !!(user?.role && MANAGER_ROLES.has(user.role.toLowerCase())),
        [user?.role]
    );

    const {
        data: balance,
        isLoading: balanceLoading,
        refetch: refetchBalance,
    } = useLeaveBalance();

    const {
        data: leavesData,
        isLoading: leavesLoading,
        error: leavesError,
        refetch: refetchLeaves,
    } = useMyLeaves(statusFilter, currentPage, PAGINATION.DEFAULT_LIMIT);

    const {
        data: pendingLeaves = [],
        isLoading: pendingLoading,
        refetch: refetchPending,
    } = usePendingLeaves(isManager && activeTab === 'pending-approvals');

    const applyMutation = useApplyLeave(user);
    const reviewMutation = useReviewLeave();
    const cancelMutation = useCancelLeave();

    const leaves = leavesData?.leaves || [];
    const pagination = leavesData?.pagination || { total: 0, page: 1, totalPages: 0 };

    /* Filtered leaves with debounced lower-cased query */
    const filteredLeaves = useMemo(() => {
        if (!debouncedSearch) return leaves;
        const q = debouncedSearch.toLowerCase();
        return leaves.filter(
            (l) =>
                l.reason?.toLowerCase().includes(q) ||
                l.status?.toLowerCase().includes(q)
        );
    }, [leaves, debouncedSearch]);

    /* Reset page when search changes meaningfully */
    const prevSearchRef = useRef('');
    useEffect(() => {
        if (prevSearchRef.current !== debouncedSearch && currentPage !== 1) {
            setCurrentPage(1);
        }
        prevSearchRef.current = debouncedSearch;
    }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Stable handlers */
    const handleRefresh = useCallback(() => {
        refetchLeaves();
        refetchBalance();
        if (isManager) refetchPending();
        toast.success('Data refreshed');
    }, [refetchLeaves, refetchBalance, refetchPending, isManager]);

    const handleApply = useCallback((formData) => {
        applyMutation.mutate(formData, { onSuccess: closeModal });
    }, [applyMutation, closeModal]);

    const handleReview = useCallback((reviewData) => {
        if (!modal.leave) return;
        reviewMutation.mutate(
            { leaveId: modal.leave.id, reviewData },
            { onSuccess: closeModal }
        );
    }, [modal.leave, reviewMutation, closeModal]);

    const handleCancel = useCallback(() => {
        if (!modal.leave) return;
        cancelMutation.mutate(modal.leave.id, { onSuccess: closeModal });
    }, [modal.leave, cancelMutation, closeModal]);

    const openApply = useCallback(() => setModal({ type: 'apply', leave: null }), []);
    const openReview = useCallback((leave) => setModal({ type: 'review', leave }), []);
    const openCancel = useCallback((leave) => setModal({ type: 'cancel', leave }), []);

    const onSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
    const switchToMyLeaves = useCallback(() => setActiveTab('my-leaves'), []);
    const switchToPending = useCallback(() => setActiveTab('pending-approvals'), []);

    /* Pre-computed % strings */
    const usedPct = balance ? calculatePercentage(balance.used, balance.totalAnnual) : 0;
    const remainPct = balance ? calculatePercentage(balance.remaining, balance.totalAnnual) : 0;

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <CalendarDays className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Leave Management
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-14">
                            Manage your leave requests and balances
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={onSearchChange}
                                className="pl-10 w-64"
                                aria-label="Search leaves"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleRefresh} aria-label="Refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button onClick={openApply} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                            <Plus className="mr-2 h-4 w-4" /> Apply for Leave
                        </Button>
                    </div>
                </div>

                {/* Balance Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {balanceLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="p-6">
                                <div className="animate-pulse h-4 bg-gray-200 rounded w-24 mb-4" />
                                <div className="animate-pulse h-8 bg-gray-200 rounded w-16" />
                            </Card>
                        ))
                    ) : balance ? (
                        <>
                            <StatCard title="Total Annual" value={`${balance.totalAnnual} days`} icon={CalendarDays} color="indigo" subtitle={`Year ${balance.year}`} />
                            <StatCard title="Used" value={`${balance.used} days`} icon={TrendingUp} color="amber" subtitle={`${usedPct}%`} trend={usedPct} />
                            <StatCard title="Remaining" value={`${balance.remaining} days`} icon={Sparkles} color="emerald" subtitle={`${remainPct}%`} trend={remainPct} />
                            <StatCard title="Pending Requests" value={balance.pendingLeaves?.length || 0} icon={Clock} color="purple" subtitle="Awaiting approval" />
                        </>
                    ) : null}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex space-x-8" role="tablist">
                        <button
                            role="tab"
                            aria-selected={activeTab === 'my-leaves'}
                            onClick={switchToMyLeaves}
                            className={`py-3 px-1 font-medium transition-all ${activeTab === 'my-leaves' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <FileText className="inline h-4 w-4 mr-2" /> My Leaves
                        </button>
                        {isManager && (
                            <button
                                role="tab"
                                aria-selected={activeTab === 'pending-approvals'}
                                onClick={switchToPending}
                                className={`py-3 px-1 font-medium transition-all ${activeTab === 'pending-approvals' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Clock className="inline h-4 w-4 mr-2" /> Pending Approvals
                                {pendingLeaves.length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs">
                                        {pendingLeaves.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* My Leaves Tab */}
                {activeTab === 'my-leaves' && (
                    <Card className="overflow-hidden shadow-xl">
                        {leavesLoading ? (
                            <SkeletonLoader />
                        ) : leavesError ? (
                            <ErrorState message={leavesError.message} onRetry={refetchLeaves} />
                        ) : filteredLeaves.length === 0 ? (
                            <EmptyState
                                message="No leave requests"
                                icon={CalendarDays}
                                description={debouncedSearch ? 'No results match your search' : 'Apply for your first leave'}
                                action={!debouncedSearch && (
                                    <Button onClick={openApply}><Plus className="mr-2 h-4 w-4" /> Apply</Button>
                                )}
                            />
                        ) : (
                            <>
                                <LeaveTable
                                    leaves={filteredLeaves}
                                    onReview={openReview}
                                    onCancel={openCancel}
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

                {/* Pending Approvals Tab */}
                {activeTab === 'pending-approvals' && isManager && (
                    <Card className="overflow-hidden shadow-xl">
                        {pendingLoading ? (
                            <SkeletonLoader rows={3} />
                        ) : pendingLeaves.length === 0 ? (
                            <EmptyState message="No pending approvals" icon={CheckCircle} description="All leaves have been reviewed" />
                        ) : (
                            <PendingApprovalsTable pendingLeaves={pendingLeaves} onReview={openReview} />
                        )}
                    </Card>
                )}

                {/* Modals */}
                <Modal open={modal.type === 'apply'} onClose={closeModal} title="Apply for Leave" size="lg">
                    <ApplyLeaveForm
                        balance={balance}
                        onSubmit={handleApply}
                        onCancel={closeModal}
                        isSubmitting={applyMutation.isPending}
                    />
                </Modal>

                <Modal open={modal.type === 'review'} onClose={closeModal} title="Review Leave Request" size="xl">
                    {modal.leave && (
                        <ReviewLeaveForm
                            leave={modal.leave}
                            onSubmit={handleReview}
                            onCancel={closeModal}
                            isSubmitting={reviewMutation.isPending}
                        />
                    )}
                </Modal>

                <Modal open={modal.type === 'cancel'} onClose={closeModal} title="Cancel Leave Request">
                    {modal.leave && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="font-semibold text-amber-800">Are you sure you want to cancel this request?</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            {formatDate(modal.leave.startDate)} - {formatDate(modal.leave.endDate)} ({modal.leave.daysRequested} days)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={closeModal}>Keep Request</Button>
                                <Button
                                    onClick={handleCancel}
                                    disabled={cancelMutation.isPending}
                                    className="bg-gradient-to-r from-rose-600 to-red-600 text-white"
                                >
                                    {cancelMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Cancel Leave
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