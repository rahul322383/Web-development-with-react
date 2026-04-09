import React, { useState, useEffect, useCallback } from 'react';
import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to get status badge styles
const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ApprovedLeaves = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [decisionNote, setDecisionNote] = useState('');

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: '/approved-leaves', message: 'Please login to access this page' } 
      });
      return;
    }

    // Check if user has required role
    if (user && !['HR', 'Admin', 'Manager'].includes(user.role?.toUpperCase())) {
      navigate('/dashboard', { 
        state: { error: 'You do not have permission to view approved leaves' } 
      });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  // Fetch all leaves (approved, rejected, etc.)
  const fetchLeaves = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all leaves using the existing API
      const response = await leaveApi.getMyLeaves();
      
      let leaves = [];
      if (response?.success && Array.isArray(response.data)) {
        leaves = response.data;
      } else if (Array.isArray(response)) {
        leaves = response;
      }
      
      // Filter for non-pending leaves (approved, rejected, cancelled)
      const processedLeaves = leaves.filter(
        leave => leave.status?.toLowerCase() !== 'pending'
      );
      
      setApprovedLeaves(processedLeaves);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load leave requests.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLeaves();
    }

    return () => {
      cancelLeaveRequest('getMyLeaves');
    };
  }, [fetchLeaves, isAuthenticated, user]);

  // Handle reject action
  const handleReject = async (leaveId) => {
    setProcessingId(leaveId);
    setError(null);
    
    try {
      const response = await leaveApi.reviewLeave(leaveId, {
        status: 'Rejected',
        decisionNote: decisionNote || 'Rejected by manager'
      });
      
      if (response?.success) {
        setSuccessMessage('Leave request rejected successfully');
        
        // Update the leave in the list
        setApprovedLeaves(prev => 
          prev.map(leave => 
            leave.id === leaveId 
              ? { ...leave, status: 'Rejected', decisionNote: decisionNote }
              : leave
          )
        );
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setError(err.message || 'Failed to reject leave request');
    } finally {
      setProcessingId(null);
      setShowModal(false);
      setSelectedLeave(null);
      setDecisionNote('');
    }
  };

  // Handle delete/cancel action
  const handleDelete = async (leaveId) => {
    setProcessingId(leaveId);
    setError(null);
    
    try {
      const response = await leaveApi.cancelLeave(leaveId);
      
      if (response?.success) {
        setSuccessMessage('Leave request cancelled successfully');
        
        // Remove from list or mark as cancelled
        setApprovedLeaves(prev => 
          prev.map(leave => 
            leave.id === leaveId 
              ? { ...leave, status: 'Cancelled' }
              : leave
          ).filter(leave => leave.status !== 'Cancelled') // Optionally remove completely
        );
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error cancelling leave:', err);
      setError(err.message || 'Failed to cancel leave request');
    } finally {
      setProcessingId(null);
      setShowModal(false);
      setSelectedLeave(null);
    }
  };

  // Open modal for action confirmation
  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setShowModal(true);
    setDecisionNote('');
  };

  // Filter and search leaves
  const filteredLeaves = approvedLeaves.filter(leave => {
    const matchesStatus = filterStatus === 'all' || 
                         leave.status?.toLowerCase() === filterStatus.toLowerCase();
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      leave.employee?.firstName?.toLowerCase().includes(searchLower) ||
      leave.employee?.lastName?.toLowerCase().includes(searchLower) ||
      leave.employee?.email?.toLowerCase().includes(searchLower) ||
      leave.reason?.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: approvedLeaves.length,
    approved: approvedLeaves.filter(l => l.status?.toLowerCase() === 'approved').length,
    rejected: approvedLeaves.filter(l => l.status?.toLowerCase() === 'rejected').length,
    cancelled: approvedLeaves.filter(l => l.status?.toLowerCase() === 'cancelled').length,
    totalDays: approvedLeaves.reduce((sum, l) => sum + (l.daysRequested || 0), 0)
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Leave Management
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                View and manage processed leave requests
              </p>
            </div>
            
            {/* User info and refresh */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600">{user.role}</span>
                </div>
              )}
              <button
                onClick={fetchLeaves}
                className="p-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <p className="text-sm text-green-700">Approved</p>
            <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <p className="text-sm text-red-700">Rejected</p>
            <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          </div>
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-700">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <p className="text-sm text-blue-700">Total Days</p>
            <p className="text-2xl font-bold text-blue-900">{stats.totalDays}</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">{successMessage}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700">{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading leave requests...</p>
            </div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No leave requests found</h3>
              <p className="mt-2 text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'All leave requests are pending review'}
              </p>
            </div>
          </div>
        ) : (
          /* Leave Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Decision Note
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave.employee?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 capitalize">
                          {leave.reason}
                        </div>
                        {leave.leaveType && (
                          <div className="text-xs text-gray-500">
                            {leave.leaveType}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {leave.decisionNote || '—'}
                        </div>
                        {leave.reviewedBy && (
                          <div className="text-xs text-gray-400">
                            Reviewed: {formatDate(leave.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {leave.status?.toLowerCase() === 'approved' && (
                            <>
                              <button
                                onClick={() => openActionModal(leave, 'reject')}
                                disabled={processingId === leave.id}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => openActionModal(leave, 'delete')}
                                disabled={processingId === leave.id}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {leave.status?.toLowerCase() === 'rejected' && (
                            <button
                              onClick={() => openActionModal(leave, 'delete')}
                              disabled={processingId === leave.id}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                          {processingId === leave.id && (
                            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    modalAction === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {modalAction === 'reject' ? (
                      <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {modalAction === 'reject' ? 'Reject Leave Request' : 'Cancel Leave Request'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {modalAction === 'reject' 
                          ? `Are you sure you want to reject the leave request from ${selectedLeave.employee?.firstName} ${selectedLeave.employee?.lastName}?`
                          : `Are you sure you want to cancel this leave request? This action cannot be undone.`
                        }
                      </p>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">Employee:</span> {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Dates:</span> {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Days:</span> {selectedLeave.daysRequested} day(s)
                        </div>
                      </div>

                      {modalAction === 'reject' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decision Note <span className="text-gray-400">(Optional)</span>
                          </label>
                          <textarea
                            rows="3"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                            placeholder="Provide a reason for rejection..."
                            value={decisionNote}
                            onChange={(e) => setDecisionNote(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    if (modalAction === 'reject') {
                      handleReject(selectedLeave.id);
                    } else {
                      handleDelete(selectedLeave.id);
                    }
                  }}
                  disabled={processingId === selectedLeave.id}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${
                    modalAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {processingId === selectedLeave.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    modalAction === 'reject' ? 'Reject Leave' : 'Cancel Leave'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLeave(null);
                    setDecisionNote('');
                  }}
                  disabled={processingId === selectedLeave.id}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedLeaves;