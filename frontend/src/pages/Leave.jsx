import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { leaveApi } from '../api/leaveApi';
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
  Check
} from 'lucide-react';

// ==================== Helper Functions ====================
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

const sanitizeInput = (input) => {
  if (!input) return '';
  return input.replace(/[<>]/g, '');
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

// ==================== Reusable Components ====================
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message, icon: Icon, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      {Icon && <Icon className="h-6 w-6 text-slate-400" />}
    </div>
    <p className="text-slate-600 mb-4">{message}</p>
    {action}
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <p className="text-slate-600 mt-4">Loading...</p>
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
  const [leaves, setLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    ipAddress: '192.168.1.1'
  });
  
  const [reviewData, setReviewData] = useState({
    status: '',
    decisionNote: ''
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const employeeId = user?.id || 2;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [myLeavesRes, balanceRes, pendingRes] = await Promise.all([
        leaveApi.getMyLeaves(),
        leaveApi.getLeaveBalance(),
        isManager ? leaveApi.getPendingLeaves() : Promise.resolve({ data: [] })
      ]);

      setLeaves(Array.isArray(myLeavesRes?.data) ? myLeavesRes.data : []);
      setBalance(balanceRes?.data || null);
      
      if (isManager) {
        setPendingLeaves(Array.isArray(pendingRes?.data) ? pendingRes.data : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err?.response?.status === 401) {
        setAuthError(true);
      } else {
        setError('Failed to load leave data');
      }
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLeaves = useMemo(() => {
    if (statusFilter === 'all') return leaves;
    return leaves.filter(leave => leave.status === statusFilter);
  }, [leaves, statusFilter]);

  const paginatedLeaves = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeaves.slice(start, start + itemsPerPage);
  }, [filteredLeaves, currentPage]);

  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const validateForm = () => {
    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      toast.error('End date is required');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return false;
    }
    if (!formData.reason?.trim()) {
      toast.error('Reason is required');
      return false;
    }
    
    const days = calculateDays(formData.startDate, formData.endDate);
    if (balance && days > balance.remaining) {
      toast.error(`Only ${balance.remaining} days remaining`);
      return false;
    }
    
    return true;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tempLeave = {
      id: `temp-${Date.now()}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: sanitizeInput(formData.reason),
      status: 'Pending',
      daysRequested: calculateDays(formData.startDate, formData.endDate),
      createdAt: new Date().toISOString()
    };
    
    setLeaves(prev => [tempLeave, ...prev]);
    setIsApplyModalOpen(false);
    setSubmitting(true);

    try {
      const response = await leaveApi.applyLeave({
        employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: sanitizeInput(formData.reason),
        ipAddress: formData.ipAddress
      });
      
      if (response?.data) {
        setLeaves(prev => prev.map(l => l.id === tempLeave.id ? response.data : l));
        toast.success(response.message || 'Leave applied successfully');
        fetchData();
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setLeaves(prev => prev.filter(l => l.id !== tempLeave.id));
      toast.error(error.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
      setFormData({ startDate: '', endDate: '', reason: '', ipAddress: '192.168.1.1' });
    }
  };

  const handleReviewLeave = async () => {
    if (!reviewData.status) {
      toast.error('Please select a decision');
      return;
    }

    if (reviewData.status === 'Rejected' && !reviewData.decisionNote) {
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
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      startDate: '',
      endDate: '',
      reason: '',
      ipAddress: '192.168.1.1'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'reason' ? sanitizeInput(value) : value 
    }));
  };

  const handleLogin = () => navigate('/login');
  const today = new Date().toISOString().split('T')[0];

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState 
          message="Please log in to view leave requests"
          icon={LogIn}
          action={
            <Button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Leave Management</h1>
            <p className="text-slate-600">Manage leave requests and track your balance</p>
          </div>
          <Button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        {/* Leave Balance Cards */}
        {balance && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-slate-500">Total Annual</h3>
                <Calendar className="h-4 w-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold">{balance.totalAnnual || 0} days</p>
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-slate-500">Used</h3>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">{balance.used || 0} days</p>
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-slate-500">Remaining</h3>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold">{balance.remaining || 0} days</p>
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm text-slate-500">Year</h3>
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{balance.year || new Date().getFullYear()}</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex space-x-6">
            <button
              onClick={() => { setActiveTab('my-leaves'); setCurrentPage(1); }}
              className={`py-2 px-1 border-b-2 font-medium transition-all ${
                activeTab === 'my-leaves'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
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
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Pending Approvals
                {pendingLeaves.length > 0 && (
                  <span className="absolute -top-1 -right-4 h-5 w-5 bg-rose-500 rounded-full text-xs text-white flex items-center justify-center">
                    {pendingLeaves.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {activeTab === 'my-leaves' && (
          <div className="flex gap-2 mb-4">
            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading} className="ml-auto">
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
              <LoadingState />
            ) : leaves.length === 0 ? (
              <EmptyState 
                message="No leave requests found"
                icon={Calendar}
                action={
                  <Button onClick={() => setIsApplyModalOpen(true)} className="bg-indigo-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Apply for Leave
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLeaves.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell>{leave.daysRequested} days</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2">{leave.reason}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(leave.status)}>
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(leave.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            )}
          </Card>
        )}

        {/* Pending Approvals Section */}
        {activeTab === 'pending-approvals' && isManager && (
          <Card className="overflow-hidden">
            {loading ? (
              <LoadingState />
            ) : pendingLeaves.length === 0 ? (
              <EmptyState message="No pending approvals" icon={CheckCircle} />
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLeaves.map(leave => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {leave.Employee?.firstName} {leave.Employee?.lastName}
                              </p>
                              <p className="text-xs text-slate-500">{leave.Employee?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell>{leave.daysRequested} days</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2">{leave.reason}</p>
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
                              Review
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

        {/* Apply Leave Modal */}
        <Modal open={isApplyModalOpen} onClose={() => { setIsApplyModalOpen(false); resetForm(); }} title="Apply for Leave">
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                required
                disabled={submitting}
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
                min={formData.startDate || today}
                required
                disabled={submitting}
              />
            </div>
            {formData.startDate && formData.endDate && (
              <div className="bg-slate-50 p-3 rounded">
                <span className="font-medium">Total days: </span>
                <span className="text-lg font-bold text-indigo-600">
                  {calculateDays(formData.startDate, formData.endDate)}
                </span>
              </div>
            )}
            <div>
              <Label htmlFor="reason">Reason *</Label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide reason for leave"
                required
                disabled={submitting}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsApplyModalOpen(false); resetForm(); }} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 text-white">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Review Leave Modal */}
        <Modal open={isReviewModalOpen} onClose={() => { setIsReviewModalOpen(false); setSelectedLeave(null); }} title="Review Leave Request">
          {selectedLeave && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded space-y-2">
                <p><strong>Employee:</strong> {selectedLeave.Employee?.firstName} {selectedLeave.Employee?.lastName}</p>
                <p><strong>Dates:</strong> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}</p>
                <p><strong>Days:</strong> {selectedLeave.daysRequested} days</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>
              
              <div>
                <Label>Decision *</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={reviewData.status === 'Approved' ? 'default' : 'outline'}
                    onClick={() => setReviewData(prev => ({ ...prev, status: 'Approved' }))}
                    className={reviewData.status === 'Approved' ? 'bg-emerald-600' : ''}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant={reviewData.status === 'Rejected' ? 'default' : 'outline'}
                    onClick={() => setReviewData(prev => ({ ...prev, status: 'Rejected' }))}
                    className={reviewData.status === 'Rejected' ? 'bg-rose-600' : ''}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="decisionNote">Comments</Label>
                <textarea
                  id="decisionNote"
                  name="decisionNote"
                  rows={2}
                  value={reviewData.decisionNote}
                  onChange={(e) => setReviewData(prev => ({ ...prev, decisionNote: sanitizeInput(e.target.value) }))}
                  placeholder={reviewData.status === 'Rejected' ? 'Reason for rejection' : 'Optional comments'}
                  disabled={submitting}
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => { setIsReviewModalOpen(false); setSelectedLeave(null); }} disabled={submitting}>
                  Cancel
                </Button>
                <Button onClick={handleReviewLeave} disabled={submitting || !reviewData.status} className="bg-indigo-600 text-white">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};