import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { leaveApi } from '../api/leaveApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/loadingSpinner';
import {
  StatCard,
  EmptyState,
  getStatusBadgeStyle,
  AlertMessage,
  formatDate,
} from '../components/ui/StatCardSkeleton';

// ─── Constants ────────────────────────────────────────────────────────────────
const MANAGER_ROLES = ['HR', 'Admin', 'Manager'];
const AUTO_DISMISS_MS = 3000;

const INITIAL_STATS = {
  total: 0, approved: 0, pending: 0,
  rejected: 0, cancelled: 0, totalDays: 0,
};
const INITIAL_TEAM_SUMMARY = { total: 0, pending: 0, approved: 0, rejected: 0 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getEmployeeDisplay = (leave) =>
  leave.employee?.firstName || leave.employee?.lastName
    ? `${leave.employee.firstName ?? ''} ${leave.employee.lastName ?? ''}`.trim()
    : `Employee ${leave.employeeId}`;

const filterActive = (arr) => (Array.isArray(arr) ? arr.filter((l) => !l.deletedAt) : []);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single spinner cell used while an action is in-flight */
const SpinnerButton = memo(({ label, colorClass }) => (
  <button disabled className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg opacity-50 cursor-not-allowed ${colorClass}`}>
    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    {label}
  </button>
));

/** Row action buttons */
const RowActions = memo(({ leave, processingId, processingAction, onApprove, onOpenModal }) => {
  const status = leave.status?.toLowerCase();
  const isProcessing = processingId === leave.id;

  if (status === 'pending') {
    if (isProcessing) {
      return processingAction === 'approve'
        ? <SpinnerButton label="Approving…" colorClass="text-green-700 bg-green-50 border border-green-200" />
        : <SpinnerButton label="Rejecting…" colorClass="text-red-700 bg-red-50 border border-red-200" />;
    }
    return (
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onApprove(leave)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition"
        >Approve</button>
        <button
          onClick={() => onOpenModal(leave, 'reject')}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition"
        >Reject</button>
      </div>
    );
  }

  if (status !== 'cancelled') {
    if (isProcessing && processingAction === 'cancel') {
      return <SpinnerButton label="Cancelling…" colorClass="text-gray-700 bg-gray-50 border border-gray-200" />;
    }
    return (
      <button
        onClick={() => onOpenModal(leave, 'cancel')}
        disabled={isProcessing}
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition"
      >Cancel</button>
    );
  }

  return null;
});

/** Grouped status table (Pending / Approved / Rejected) */
const LeaveTable = memo(({ leaves, title, emptyMessage, processingId, processingAction, onApprove, onOpenModal, showActions = true }) => {
  if (!leaves.length) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
          {emptyMessage ?? 'No leave requests found'}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{title}</h3>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Employee', 'Date Range', 'Days', 'Reason', 'Decision Note', ...(showActions ? ['Actions'] : [])].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{getEmployeeDisplay(leave)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{leave.employee?.email ?? `ID: ${leave.employeeId}`}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(leave.startDate)}</div>
                    <div className="text-xs text-gray-500">to {formatDate(leave.endDate)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {leave.daysRequested}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {leave.reason?.replace(/-/g, ' ') ?? '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {leave.decisionNote ?? '—'}
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <RowActions
                        leave={leave}
                        processingId={processingId}
                        processingAction={processingAction}
                        onApprove={onApprove}
                        onOpenModal={onOpenModal}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

/** Confirm-action modal */
const ActionModal = memo(({ leave, action, processingId, decisionNote, error, onDecisionNote, onConfirm, onClose }) => {
  const isReject = action === 'reject';
  const isProcessing = processingId === leave.id;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm" />
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-5">
            <div className="sm:flex sm:items-start">
              {/* Icon */}
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${isReject ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                {isReject ? (
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>

              {/* Body */}
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isReject ? 'Reject Leave Request' : 'Cancel Leave Request'}
                </h3>
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isReject
                      ? `Reject leave request from ${getEmployeeDisplay(leave)}?`
                      : 'Cancel this leave request? This action cannot be undone.'}
                  </p>

                  {/* Leave summary */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl space-y-2">
                    {[
                      { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: getEmployeeDisplay(leave) },
                      { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: `${formatDate(leave.startDate)} – ${formatDate(leave.endDate)}` },
                      { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: `${leave.daysRequested} day${leave.daysRequested !== 1 ? 's' : ''}` },
                    ].map(({ icon, text }) => (
                      <div key={text} className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rejection note */}
                  {isReject && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Decision Note <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        placeholder="Provide a reason for rejection…"
                        value={decisionNote}
                        onChange={(e) => onDecisionNote(e.target.value)}
                      />
                      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-row-reverse gap-2">
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className={`inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 ${isReject
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:ring-red-500'
                  : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 focus:ring-yellow-500'
                }`}
            >
              {isProcessing ? 'Processing…' : isReject ? 'Confirm Rejection' : 'Confirm Cancellation'}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Custom hook – data fetching & actions ─────────────────────────────────────
function useLeaveManagement(isAuthenticated, user, canManageLeaves) {
  const [statsCounts, setStatsCounts] = useState(INITIAL_STATS);
  const [teamSummary, setTeamSummary] = useState(INITIAL_TEAM_SUMMARY);
  const [teamList, setTeamList] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [rejectedLeaves, setRejectedLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const showSuccess = useCallback((msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), AUTO_DISMISS_MS);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user || !canManageLeaves) return;
    setLoading(true);
    setError(null);
    try {
      const [statsRes, teamRes] = await Promise.all([
        leaveApi.getLeaveStats(),
        leaveApi.getTeamLeaves(),
      ]);

      const statsData = statsRes?.data ?? statsRes;
      const teamData = teamRes?.data ?? teamRes;
      const summary = teamData.summary ?? {};
      const list = filterActive(teamData.list);
      const grouped = teamData.grouped ?? {};

      setTeamSummary(summary);
      setTeamList(list);
      setPendingLeaves(filterActive(grouped.pending));
      setApprovedLeaves(filterActive(grouped.approved));
      setRejectedLeaves(filterActive(grouped.rejected));

      const cancelledCount = list.filter((l) => l.status?.toLowerCase() === 'cancelled').length;
      const totalDays = list.reduce((sum, l) => sum + (Number(l.daysRequested) || 0), 0);

      setStatsCounts({
        total: statsData.total ?? 0,
        approved: statsData.approved ?? 0,
        pending: statsData.pending ?? 0,
        rejected: statsData.rejected ?? 0,
        cancelled: cancelledCount,
        totalDays,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load leave data');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, canManageLeaves]);

  useEffect(() => {
    if (isAuthenticated && user && canManageLeaves) fetchData();
  }, [fetchData, isAuthenticated, user, canManageLeaves]);

  const withProcessing = useCallback(async (id, action, fn) => {
    setProcessingId(id);
    setProcessingAction(action);
    setError(null);
    try {
      const res = await fn();
      if (res?.success) {
        showSuccess(`Leave request ${action}d successfully`);
        await fetchData();
      }
    } catch (err) {
      setError(err.message || `Failed to ${action} leave request`);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  }, [fetchData, showSuccess]);

  const approveLeave = useCallback((leaveId, note) =>
    withProcessing(leaveId, 'approve', () =>
      leaveApi.reviewLeave(leaveId, { status: 'Approved', decisionNote: note || 'Approved by manager' })
    ), [withProcessing]);

  const rejectLeave = useCallback((leaveId, note) =>
    withProcessing(leaveId, 'reject', () =>
      leaveApi.reviewLeave(leaveId, { status: 'Rejected', decisionNote: note })
    ), [withProcessing]);

  const cancelLeave = useCallback((leaveId) =>
    withProcessing(leaveId, 'cancel', () => leaveApi.cancelLeave(leaveId)), [withProcessing]);

  return {
    statsCounts, teamSummary, teamList, pendingLeaves, approvedLeaves, rejectedLeaves,
    loading, error, setError, successMessage, setSuccessMessage,
    processingId, processingAction,
    fetchData, approveLeave, rejectLeave, cancelLeave,
  };
}

// ─── Main component ────────────────────────────────────────────────────────────
const ApprovedLeaves = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const canManageLeaves = useMemo(
    () => user && MANAGER_ROLES.includes(user.primaryRole),
    [user]
  );

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/approved-leaves', message: 'Please login to access this page' } });
    } else if (user && !canManageLeaves) {
      navigate('/dashboard', { state: { error: 'You do not have permission to view the leave management page' } });
    }
  }, [isAuthenticated, authLoading, user, navigate, canManageLeaves]);

  const {
    statsCounts, teamSummary, teamList,
    pendingLeaves, approvedLeaves, rejectedLeaves,
    loading, error, setError, successMessage, setSuccessMessage,
    processingId, processingAction,
    fetchData, approveLeave, rejectLeave, cancelLeave,
  } = useLeaveManagement(isAuthenticated, user, canManageLeaves);

  // Modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const [modalError, setModalError] = useState(null);

  const openModal = useCallback((leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setDecisionNote('');
    setModalError(null);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedLeave(null);
    setDecisionNote('');
    setModalError(null);
  }, []);

  const handleApprove = useCallback((leave) => {
    // Open modal so manager can optionally add a note
    openModal(leave, 'approve');
  }, [openModal]);

  const handleModalConfirm = useCallback(async () => {
    if (!selectedLeave) return;
    if (modalAction === 'reject' && !decisionNote.trim()) {
      setModalError('Please provide a reason for rejection');
      return;
    }
    if (modalAction === 'reject') await rejectLeave(selectedLeave.id, decisionNote);
    else if (modalAction === 'approve') await approveLeave(selectedLeave.id, decisionNote);
    else await cancelLeave(selectedLeave.id);
    closeModal();
  }, [selectedLeave, modalAction, decisionNote, rejectLeave, approveLeave, cancelLeave, closeModal]);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeaves = useMemo(() => {
    const statusLower = filterStatus.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return teamList.filter((leave) => {
      const matchesStatus = statusLower === 'all' || leave.status?.toLowerCase() === statusLower;
      const matchesSearch =
        !searchTerm ||
        getEmployeeDisplay(leave).toLowerCase().includes(searchLower) ||
        (leave.employee?.email ?? '').toLowerCase().includes(searchLower) ||
        (leave.reason ?? '').toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [teamList, filterStatus, searchTerm]);

  // Shared table action props
  const tableActionProps = { processingId, processingAction, onApprove: handleApprove, onOpenModal: openModal };

  if (authLoading) return <LoadingSpinner text="Checking authentication…" />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── Header ── */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Manager view – all team leave requests
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{user.role ?? user.primaryRole}</p>
                  </div>
                </div>
              )}
              <button
                onClick={fetchData}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Global alerts ── */}
        {successMessage && (
          <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}
        {error && (
          <AlertMessage type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* ── Stats ── */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <span className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg mr-2">📊</span>
            Leave Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            {[
              { title: 'Total', value: statsCounts.total, icon: '📊', color: 'total' },
              { title: 'Pending', value: statsCounts.pending, icon: '⏳', color: 'pending' },
              { title: 'Approved', value: statsCounts.approved, icon: '✅', color: 'approved' },
              { title: 'Rejected', value: statsCounts.rejected, icon: '❌', color: 'rejected' },
              { title: 'Cancelled', value: statsCounts.cancelled, icon: '🚫', color: 'cancelled' },
              { title: 'Total Days', value: statsCounts.totalDays, icon: '📅', color: 'days' },
            ].map((s) => <StatCard key={s.title} {...s} />)}
          </div>
        </section>

        {/* ── Grouped tables ── */}
        <section className="mb-8">
          <LeaveTable leaves={pendingLeaves} title="⏳ Pending Leaves" emptyMessage="No pending leave requests" showActions {...tableActionProps} />
          <LeaveTable leaves={approvedLeaves} title="✅ Approved Leaves" emptyMessage="No approved leave requests" showActions={false} {...tableActionProps} />
          <LeaveTable leaves={rejectedLeaves} title="❌ Rejected Leaves" emptyMessage="No rejected leave requests" showActions={false} {...tableActionProps} />
        </section>

        {/* ── Team summary ── */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <span className="bg-indigo-100 dark:bg-indigo-900/40 p-1.5 rounded-lg mr-2">👥</span>
            Team Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: 'Team Total', value: teamSummary.total, icon: '👥', color: 'total' },
              { title: 'Team Pending', value: teamSummary.pending, icon: '⏳', color: 'pending' },
              { title: 'Team Approved', value: teamSummary.approved, icon: '✅', color: 'approved' },
              { title: 'Team Rejected', value: teamSummary.rejected, icon: '❌', color: 'rejected' },
            ].map((s) => <StatCard key={s.title} {...s} />)}
          </div>
        </section>

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or reason…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}{s === 'all' ? ' Status' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── All leaves table ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner text="Loading leave requests…" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState hasFilters={!!(searchTerm || filterStatus !== 'all')} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                All Leave Requests
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredLeaves.length})</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700">
                    {['Employee', 'Date Range', 'Days', 'Reason', 'Status', 'Decision Note', 'Actions'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {getEmployeeDisplay(leave).charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{getEmployeeDisplay(leave)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{leave.employee?.email ?? `ID: ${leave.employeeId}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(leave.startDate)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">to {formatDate(leave.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-300 capitalize">
                          {leave.reason?.replace(/-/g, ' ') ?? 'No reason'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeStyle(leave.status)}>{leave.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        {leave.decisionNote ? (
                          <div className="flex items-start space-x-1 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <span className="flex-1">{leave.decisionNote}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                        {leave.updatedAt && leave.status?.toLowerCase() !== 'pending' && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Updated: {formatDate(leave.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <RowActions
                          leave={leave}
                          processingId={processingId}
                          processingAction={processingAction}
                          onApprove={handleApprove}
                          onOpenModal={openModal}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {selectedLeave && (
        <ActionModal
          leave={selectedLeave}
          action={modalAction}
          processingId={processingId}
          decisionNote={decisionNote}
          error={modalError}
          onDecisionNote={setDecisionNote}
          onConfirm={handleModalConfirm}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ApprovedLeaves;