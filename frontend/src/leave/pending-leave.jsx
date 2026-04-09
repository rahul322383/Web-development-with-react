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
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const PendingLeaves = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [reviewNote, setReviewNote] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check authentication and authorization using useAuth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: '/pending-leave', message: 'Please login to access this page' } 
      });
      return;
    }

    // Check if user has required role using user from useAuth
    if (user && !['HR', 'Admin', 'Manager'].includes(user.role?.toUpperCase())) {
      navigate('/dashboard', { 
        state: { error: 'You do not have permission to view pending leaves' } 
      });
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  // Fetch pending leaves - auth is handled by API interceptor using useAuth context
const fetchPendingLeaves = useCallback(async () => {
  if (!isAuthenticated || !user) return;
  
  setLoading(true);
  setError(null);

  try {
    const response = await leaveApi.getPendingLeaves();

    console.log("API RESPONSE:", response);

    setPendingLeaves(response?.data || []);
  } catch (err) {
    console.error("ERROR:", err);

    const msg =
      err?.message ||
      "Failed to load pending leave requests.";

    setError(msg);
  } finally {
    setLoading(false);
  }
}, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPendingLeaves();
    }

    return () => {
      cancelLeaveRequest('getPendingLeaves');
    };
  }, [fetchPendingLeaves, isAuthenticated, user]);

  // Handle leave approval/rejection
  const handleReview = async (leaveId, action, decisionNote = '') => {
    setProcessingId(leaveId);
    setError(null);
    
    try {
      await leaveApi.reviewLeave(leaveId, {
        status: action,
        decisionNote: decisionNote || null,
        reviewedBy: user?.id,
      });
      
      setPendingLeaves((prev) => prev.filter((leave) => leave.id !== leaveId));
      setSuccessMessage(`Leave request ${action.toLowerCase()} successfully`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error(`Error ${action} leave:`, err);
      if (err.name !== 'AbortError') {
        setError(`Failed to ${action.toLowerCase()} leave request. Please try again.`);
      }
    } finally {
      setProcessingId(null);
      setReviewNote((prev) => ({ ...prev, [leaveId]: '' }));
    }
  };

  // Handle note change
  const handleNoteChange = (leaveId, note) => {
    setReviewNote((prev) => ({ ...prev, [leaveId]: note }));
  };

  // Show loading state while checking authentication via useAuth
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

  // Don't render if not authenticated (useAuth handles this)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Pending Leave Requests
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Review and manage employee leave requests
              </p>
            </div>
            
            {/* User info from useAuth and refresh button */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600">{user.role}</span>
                </div>
              )}
              <button
                onClick={fetchPendingLeaves}
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
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <button
                onClick={fetchPendingLeaves}
                className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingLeaves.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No pending requests</h3>
              <p className="mt-2 text-gray-600">All leave requests have been reviewed.</p>
              <button
                onClick={fetchPendingLeaves}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        ) : (
          /* Leave Cards Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                       {leave.employee
  ? `${leave.employee.firstName} ${leave.employee.lastName}`
  : "Unknown Employee"} {leave.employee?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{leave.employee?.email}</p>
                      {leave.employee?.department && (
                        <p className="text-xs text-gray-400 mt-1">{leave.employee.department}</p>
                      )}
                    </div>
                    <span
                      className={`ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyle(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-4 sm:px-5 py-4 space-y-3">
                  {/* Date Range */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Duration: {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Leave Type & Reason */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 capitalize">{leave.reason}</p>
                      {leave.leaveType && (
                        <p className="text-xs text-gray-500 mt-0.5">{leave.leaveType}</p>
                      )}
                    </div>
                  </div>

                  {/* Submitted Date */}
                  {leave.createdAt && (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          Submitted: {formatDate(leave.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Decision Note Input */}
                  <div className="pt-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Decision Note <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Add a note for the employee..."
                      value={reviewNote[leave.id] || ''}
                      onChange={(e) => handleNoteChange(leave.id, e.target.value)}
                      disabled={processingId === leave.id}
                    />
                  </div>
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="px-4 sm:px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleReview(leave.id, 'Approved', reviewNote[leave.id])}
                      disabled={processingId === leave.id}
                      className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                        processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                    >
                      {processingId === leave.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReview(leave.id, 'Rejected', reviewNote[leave.id])}
                      disabled={processingId === leave.id}
                      className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg text-red-700 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ${
                        processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                    >
                      {processingId === leave.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        {pendingLeaves.length > 0 && (
          <div className="mt-6 text-center sm:text-right">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{pendingLeaves.length}</span> pending request{pendingLeaves.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingLeaves;