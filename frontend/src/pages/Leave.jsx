import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table.jsx';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Check,
  Trash2,
  Info
} from 'lucide-react';

// ==================== Utility Functions ====================
const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  try {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T00:00:00Z');
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch {
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

const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const getStatusBadgeVariant = (status) => {
  const variants = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'danger',
    Cancelled: 'default'
  };
  return variants[status] || 'default';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending':
      return Clock;
    case 'Approved':
      return CheckCircle;
    case 'Rejected':
      return X;
    default:
      return Info;
  }
};

// ==================== Reusable Components ====================
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto transform transition-all`}>
        <div className="sticky top-0 bg-white border-b z-10 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message, icon: Icon, action, description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      {Icon && <Icon className="h-6 w-6 text-slate-400" />}
    </div>
    <p className="text-slate-600 font-medium mb-2">{message}</p>
    {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
    {action}
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <p className="text-slate-600 mt-4">Loading...</p>
  </div>
);

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="bg-slate-200 h-12 rounded"></div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
    <p className="text-slate-600 mb-4">{message}</p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

// ==================== Main Component ====================
export const Leave = () => {
  const navigate = useNavigate();
  
  // State Management
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Form States
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [reviewData, setReviewData] = useState({
    status: '',
    decisionNote: ''
  });

  // Get user from localStorage
  const user = useMemo(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  }, []);
  
  const isManager = useMemo(() => {
    const role = user?.role?.toLowerCase();
    return role === 'manager' || role === 'admin' || role === 'hr';
  }, [user]);

  // Fetch Data with proper request cancellation
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use requestId pattern from your API
      const [myLeavesRes, balanceRes] = await Promise.all([
        leaveApi.getMyLeaves({ requestId: 'myLeaves' }),
        leaveApi.getLeaveBalance({ requestId: 'leaveBalance' })
      ]);

      // Handle API response structure - clean and consistent
      const myLeaves = myLeavesRes?.data || myLeavesRes || [];
      setLeaves(Array.isArray(myLeaves) ? myLeaves : []);
      setBalance(balanceRes?.data || balanceRes || null);
      
      // Fetch pending leaves if manager
      if (isManager) {
        const pendingRes = await leaveApi.getPendingLeaves({ requestId: 'pendingLeaves' });
        const pending = pendingRes?.data || pendingRes || [];
        setPendingLeaves(Array.isArray(pending) ? pending : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Don't show error for cancelled requests
      if (err?.name !== 'AbortError' && err?.code !== 'ERR_CANCELED') {
        // Check for 401 - global interceptor will handle this
        if (err?.status === 401 || err?.response?.status === 401) {
          // Let global interceptor handle redirect
          console.log('Unauthorized access detected');
        } else {
          setError(err?.message || 'Failed to load leave data');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  // Cleanup function for request cancellation
  useEffect(() => {
    fetchData();

    // Cleanup: cancel any ongoing requests when component unmounts
    return () => {
      cancelLeaveRequest('myLeaves');
      cancelLeaveRequest('leaveBalance');
      cancelLeaveRequest('pendingLeaves');
    };
  }, [fetchData]);

  // Global unauthorized listener
  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [navigate]);

  // Filtered Leaves with useMemo optimization
  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'all') return leaves;
    return leaves.filter(leave => leave.status === statusFilter);
  }, [leaves, statusFilter]);

  // Paginated Leaves
  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeaves.slice(start, start + itemsPerPage);
  }, [filteredLeaves, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredLeaves.length / itemsPerPage),
    [filteredLeaves.length, itemsPerPage]
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Form Validation
  const validateForm = useCallback(() => {
    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      toast.error('End date is required');
      return false;
    }
    
    const startDateObj = new Date(formData.startDate);
    const endDateObj = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDateObj < today) {
      toast.error('Start date cannot be in the past');
      return false;
    }
    
    if (startDateObj > endDateObj) {
      toast.error('End date must be after start date');
      return false;
    }
    
    if (!formData.reason?.trim()) {
      toast.error('Reason is required');
      return false;
    }
    
    if (formData.reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (at least 10 characters)');
      return false;
    }
    
    const days = calculateDays(formData.startDate, formData.endDate);
    if (balance && days > balance.remaining) {
      toast.error(`Only ${balance.remaining} days remaining. You requested ${days} days.`);
      return false;
    }
    
    return true;
  }, [formData, balance]);

  // Handle Apply Leave - FIXED date handling
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempLeave = {
      id: tempId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: sanitizeInput(formData.reason),
      status: 'Pending',
      daysRequested: calculateDays(formData.startDate, formData.endDate),
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };
    
    setLeaves(prev => [tempLeave, ...prev]);
    setIsApplyModalOpen(false);
    setSubmitting(true);

    try {
      // FIX: Send dates in correct format - backend gets employee from token
      const response = await leaveApi.applyLeave({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: sanitizeInput(formData.reason),
      });
      
      if (response?.success !== false) {
        // Replace optimistic entry with real data
        const realLeave = response?.data || response;
        setLeaves(prev => prev.map(l => 
          l.id === tempId ? { ...realLeave, isOptimistic: false } : l
        ));
        toast.success(response?.message || 'Leave applied successfully');
        
        // Smooth scroll to top to show new leave
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Refresh balance only (not full data)
        try {
          const balanceRes = await leaveApi.getLeaveBalance({ requestId: 'refreshBalance' });
          setBalance(balanceRes?.data || balanceRes || null);
        } catch (err) {
          console.error('Failed to refresh balance:', err);
        }
      } else {
        throw new Error(response?.message || 'Failed to apply leave');
      }
    } catch (error) {
      // Remove optimistic entry on error
      setLeaves(prev => prev.filter(l => l.id !== tempId));
      toast.error(error.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
      resetForm();
    }
  };

  // Handle Review Leave
  const handleReviewLeave = async () => {
    if (!reviewData.status) {
      toast.error('Please select a decision');
      return;
    }

    if (reviewData.status === 'Rejected' && !reviewData.decisionNote?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      await leaveApi.reviewLeave(selectedLeave.id, {
        status: reviewData.status,
        decisionNote: sanitizeInput(reviewData.decisionNote)
      });
      
      toast.success(`Leave request ${reviewData.status.toLowerCase()}`);
      setIsReviewModalOpen(false);
      setSelectedLeave(null);
      setReviewData({ status: '', decisionNote: '' });
      
      // Refresh data
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Leave
  const handleCancelLeave = async () => {
    setSubmitting(true);
    try {
      await leaveApi.cancelLeave(selectedLeave.id);
      toast.success('Leave request cancelled successfully');
      setIsCancelModalOpen(false);
      setSelectedLeave(null);
      await fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel leave');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'reason' ? sanitizeInput(value) : value 
    }));
  };

  // Get today's date for min date (FIXED for proper date selection)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate days for preview
  const calculatedDays = useMemo(() => 
    calculateDays(formData.startDate, formData.endDate),
    [formData.startDate, formData.endDate]
  );

  // Status options constant
  const STATUS_OPTIONS = ['all', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  // Check if filtered results are empty
  const noFilterResults = filteredLeaves.length === 0 && leaves.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Leave Management</h1>
            <p className="text-slate-600">Manage leave requests and track your balance</p>
          </div>
          <Button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        {/* Leave Balance Cards with loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : balance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-500">Total Annual</h3>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{balance.totalAnnual || 0} days</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-500">Used</h3>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{balance.used || 0} days</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-500">Remaining</h3>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{balance.remaining || 0} days</p>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-slate-500">Year</h3>
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{balance.year || new Date().getFullYear()}</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex space-x-6">
            <button
              onClick={() => { setActiveTab('my-leaves'); setCurrentPage(1); }}
              className={`py-2 px-1 border-b-2 font-medium transition-all ${
                activeTab === 'my-leaves'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              My Leaves
            </button>
            {isManager && (
              <button
                onClick={() => { setActiveTab('pending-approvals'); setCurrentPage(1); }}
                className={`py-2 px-1 border-b-2 font-medium transition-all relative ${
                  activeTab === 'pending-approvals'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Pending Approvals
                {pendingLeaves.length > 0 && (
                  <span className="absolute -top-1 -right-4 h-5 w-5 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    {pendingLeaves.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'my-leaves' && leaves.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {STATUS_OPTIONS.map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All' : status}
              </Button>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchData} 
              disabled={loading} 
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && !loading && <ErrorState message={error} onRetry={fetchData} />}

        {/* My Leaves Section */}
        {activeTab === 'my-leaves' && (
          <Card className="overflow-hidden">
            {loading ? (
              <SkeletonLoader />
            ) : leaves.length === 0 ? (
              <EmptyState 
                message="No leave requests found"
                description="Your leave requests will appear here"
                icon={Calendar}
                action={
                  <Button onClick={() => setIsApplyModalOpen(true)} className="bg-indigo-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Apply for Leave
                  </Button>
                }
              />
            ) : noFilterResults ? (
              <EmptyState 
                message="No results for selected filter"
                description={`No ${statusFilter !== 'all' ? statusFilter : ''} leave requests found`}
                icon={AlertCircle}
                action={
                  <Button variant="outline" onClick={() => setStatusFilter('all')}>
                    Clear Filter
                  </Button>
                }
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied On</TableHead>
                        {isManager && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeaves.map(leave => {
                        const StatusIcon = getStatusIcon(leave.status);
                        return (
                          <TableRow key={leave.id} className={leave.isOptimistic ? 'opacity-70' : ''}>
                            <TableCell className="whitespace-nowrap">
                              {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                            </TableCell>
                            <TableCell>{leave.daysRequested} days</TableCell>
                            <TableCell className="max-w-xs">
                              <p className="line-clamp-2" title={leave.reason}>
                                {leave.reason}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(leave.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {leave.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatDateTime(leave.createdAt)}
                            </TableCell>
                            {isManager && leave.status === 'Pending' && (
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setIsReviewModalOpen(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-700"
                                >
                                  Review
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </>
            )}
          </Card>
        )}

        {/* Pending Approvals Section */}
        {activeTab === 'pending-approvals' && isManager && (
          <Card className="overflow-hidden">
            {loading ? (
              <SkeletonLoader />
            ) : pendingLeaves.length === 0 ? (
              <EmptyState 
                message="No pending approvals" 
                description="All leave requests have been reviewed"
                icon={CheckCircle} 
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLeaves.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">
                                {leave.Employee?.firstName} {leave.Employee?.lastName || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-500">{leave.Employee?.email || 'No email'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell>{leave.daysRequested} days</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2" title={leave.reason}>
                              {leave.reason}
                            </p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDateTime(leave.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setIsReviewModalOpen(true);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Review Request
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Apply Leave Modal - FIXED date selection */}
        <Modal 
          open={isApplyModalOpen} 
          onClose={() => { setIsApplyModalOpen(false); resetForm(); }} 
          title="Apply for Leave"
        >
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                min={getTodayDate()}
                required
                disabled={submitting}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || getTodayDate()}
                required
                disabled={submitting}
                className="mt-1"
              />
            </div>
            {formData.startDate && formData.endDate && (
              <div className={`p-3 rounded-lg border ${calculatedDays > (balance?.remaining || 0) ? 'bg-rose-50 border-rose-200' : 'bg-indigo-50 border-indigo-100'}`}>
                <span className="text-sm font-medium">Total days: </span>
                <span className={`text-lg font-bold ml-1 ${calculatedDays > (balance?.remaining || 0) ? 'text-rose-600' : 'text-indigo-600'}`}>
                  {calculatedDays}
                </span>
                {balance && calculatedDays > balance.remaining && (
                  <p className="text-xs text-rose-600 mt-1">
                    ⚠️ This exceeds your remaining balance of {balance.remaining} days
                  </p>
                )}
                {balance && calculatedDays <= balance.remaining && (
                  <p className="text-xs text-emerald-600 mt-1">
                    ✓ You have {balance.remaining} days remaining
                  </p>
                )}
              </div>
            )}
            <div>
              <Label htmlFor="reason">Reason for Leave *</Label>
              <textarea
                id="reason"
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a detailed reason for your leave request..."
                required
                disabled={submitting}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Minimum 10 characters
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsApplyModalOpen(false); resetForm(); }} 
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Review Leave Modal */}
        <Modal 
          open={isReviewModalOpen} 
          onClose={() => { setIsReviewModalOpen(false); setSelectedLeave(null); setReviewData({ status: '', decisionNote: '' }); }} 
          title="Review Leave Request"
          size="lg"
        >
          {selectedLeave && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Employee</p>
                    <p className="text-slate-900 font-medium mt-1">
                      {selectedLeave.Employee?.firstName} {selectedLeave.Employee?.lastName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Employee ID</p>
                    <p className="text-slate-900 mt-1">{selectedLeave.Employee?.id || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Leave Period</p>
                  <p className="text-slate-900 mt-1">
                    {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Duration</p>
                  <p className="text-slate-900 mt-1 font-medium">{selectedLeave.daysRequested} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Reason</p>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{selectedLeave.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Applied On</p>
                  <p className="text-slate-900 mt-1">{formatDateTime(selectedLeave.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-base font-semibold">Decision *</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={reviewData.status === 'Approved' ? 'default' : 'outline'}
                    onClick={() => setReviewData(prev => ({ ...prev, status: 'Approved', decisionNote: '' }))}
                    className={`flex-1 ${reviewData.status === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant={reviewData.status === 'Rejected' ? 'default' : 'outline'}
                    onClick={() => setReviewData(prev => ({ ...prev, status: 'Rejected' }))}
                    className={`flex-1 ${reviewData.status === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
              
              {reviewData.status === 'Rejected' && (
                <div>
                  <Label htmlFor="decisionNote">Rejection Reason *</Label>
                  <textarea
                    id="decisionNote"
                    name="decisionNote"
                    rows={3}
                    value={reviewData.decisionNote}
                    onChange={(e) => setReviewData(prev => ({ ...prev, decisionNote: sanitizeInput(e.target.value) }))}
                    placeholder="Please provide reason for rejection"
                    disabled={submitting}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-1"
                    required
                  />
                  <p className="text-xs text-rose-600 mt-1">
                    A rejection reason is required and will be shared with the employee
                  </p>
                </div>
              )}
              
              {reviewData.status === 'Approved' && (
                <div>
                  <Label htmlFor="decisionNote">Comments (Optional)</Label>
                  <textarea
                    id="decisionNote"
                    name="decisionNote"
                    rows={2}
                    value={reviewData.decisionNote}
                    onChange={(e) => setReviewData(prev => ({ ...prev, decisionNote: sanitizeInput(e.target.value) }))}
                    placeholder="Add any comments about this approval"
                    disabled={submitting}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-1"
                  />
                </div>
              )}
              
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsReviewModalOpen(false); setSelectedLeave(null); setReviewData({ status: '', decisionNote: '' }); }} 
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewLeave} 
                  disabled={submitting || !reviewData.status} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Cancel Leave Confirmation Modal */}
        <Modal 
          open={isCancelModalOpen} 
          onClose={() => { setIsCancelModalOpen(false); setSelectedLeave(null); }} 
          title="Cancel Leave Request"
        >
          {selectedLeave && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 font-medium mb-2">
                  Are you sure you want to cancel this leave request?
                </p>
                <div className="text-sm text-amber-700 space-y-1">
                  <p><strong>Dates:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
                  <p><strong>Days:</strong> {selectedLeave.daysRequested} days</p>
                  {selectedLeave.status === 'Pending' && (
                    <p className="text-amber-600 mt-2 text-xs">
                      Note: This request is pending approval. Cancelling will remove it from the manager's queue.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => { setIsCancelModalOpen(false); setSelectedLeave(null); }} 
                  disabled={submitting}
                >
                  Keep Request
                </Button>
                <Button 
                  onClick={handleCancelLeave} 
                  disabled={submitting} 
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Yes, Cancel Request
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