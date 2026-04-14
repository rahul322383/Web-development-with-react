
// import React, { useState, useEffect, useCallback } from 'react';
// import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import LoadingSpinner from '../components/ui/loadingSpinner';

// import {StatCard, StatCardSkeleton, TableSkeleton, EmptyState, getStatusBadgeStyle, AlertMessage} from "../components/ui/StatCardSkeleton";



// // Helper function to format date
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   });
// };

// const ApprovedLeaves = () => {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
  
//   const [leaves, setLeaves] = useState([]);
//   const [stats, setStats] = useState({
//     total: 0,
//     approved: 0,
//     pending: 0,
//     rejected: 0,
//     cancelled: 0,
//     totalDays: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingId, setProcessingId] = useState(null);
//   const [processingAction, setProcessingAction] = useState(null);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLeave, setSelectedLeave] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [modalAction, setModalAction] = useState('');
//   const [decisionNote, setDecisionNote] = useState('');

//   // Check if user can manage leaves (approve/reject)
//   const canManageLeaves = user && ['HR', 'Admin', 'Manager'].includes(user.primaryRole);

//   // Check authentication
//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       navigate('/login', { 
//         state: { from: '/approved-leaves', message: 'Please login to access this page' } 
//       });
//       return;
//     }

//     if (user && !canManageLeaves) {
//       navigate('/dashboard', { 
//         state: { error: 'You do not have permission to view the leave management page' } 
//       });
//     }
//   }, [isAuthenticated, authLoading, user, navigate, canManageLeaves]);

//   // Fetch team leaves and stats
//   const fetchLeaves = useCallback(async () => {
//     if (!isAuthenticated || !user || !canManageLeaves) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const [teamLeavesResponse, statsResponse] = await Promise.all([
//         leaveApi.getTeamLeaves(),
//         leaveApi.getLeaveStats()
//       ]);
      
//       let leavesData = [];
      
//       // Handle different response structures from the API
//       if (teamLeavesResponse?.success) {
//         // Check for nested data structure (from your JSON example)
//         if (teamLeavesResponse.data?.data?.data) {
//           leavesData = teamLeavesResponse.data.data.data;
//         } else if (teamLeavesResponse.data?.data) {
//           leavesData = teamLeavesResponse.data.data;
//         } else if (teamLeavesResponse.data?.rows) {
//           leavesData = teamLeavesResponse.data.rows;
//         } else if (Array.isArray(teamLeavesResponse.data)) {
//           leavesData = teamLeavesResponse.data;
//         }
//       } else if (teamLeavesResponse?.data?.data?.data) {
//         leavesData = teamLeavesResponse.data.data.data;
//       } else if (teamLeavesResponse?.data?.data) {
//         leavesData = teamLeavesResponse.data.data;
//       }
      
//       // Filter out soft-deleted records
//       const activeLeaves = leavesData.filter(leave => !leave.deletedAt);
      
//       setLeaves(activeLeaves);
      
//       // Calculate statistics
//       const calculatedStats = {
//         total: activeLeaves.length,
//         approved: activeLeaves.filter(l => l.status?.toLowerCase() === 'approved').length,
//         pending: activeLeaves.filter(l => l.status?.toLowerCase() === 'pending').length,
//         rejected: activeLeaves.filter(l => l.status?.toLowerCase() === 'rejected').length,
//         cancelled: activeLeaves.filter(l => l.status?.toLowerCase() === 'cancelled').length,
//         totalDays: activeLeaves.reduce((sum, leave) => sum + (leave.daysRequested || 0), 0)
//       };
      
//       // Try to use stats from API if available
//       if (statsResponse?.success && statsResponse.data) {
//         const statsData = statsResponse.data.data || statsResponse.data;
//         setStats({
//           total: statsData.total || calculatedStats.total,
//           approved: statsData.approved || calculatedStats.approved,
//           pending: statsData.pending || calculatedStats.pending,
//           rejected: statsData.rejected || calculatedStats.rejected,
//           cancelled: statsData.cancelled || calculatedStats.cancelled,
//           totalDays: calculatedStats.totalDays
//         });
//       } else {
//         setStats(calculatedStats);
//       }
      
//     } catch (err) {
//       console.error('Error fetching leaves:', err);
//       if (err.name !== 'AbortError') {
//         setError(err.message || 'Failed to load leave requests.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, user, canManageLeaves]);

//   useEffect(() => {
//     if (isAuthenticated && user && canManageLeaves) {
//       fetchLeaves();
//     }

//     return () => {
//       cancelLeaveRequest('getTeamLeaves');
//       cancelLeaveRequest('getLeaveStats');
//     };
//   }, [fetchLeaves, isAuthenticated, user, canManageLeaves]);

//   const handleApprove = async (leaveId) => {
//     setProcessingId(leaveId);
//     setProcessingAction('approve');
//     setError(null);
    
//     try {
//       const response = await leaveApi.reviewLeave(leaveId, {
//         status: 'Approved',
//         decisionNote: decisionNote || 'Approved by manager'
//       });
      
//       if (response?.success) {
//         setSuccessMessage('Leave request approved successfully');
//         await fetchLeaves();
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       console.error('Error approving leave:', err);
//       setError(err.message || 'Failed to approve leave request');
//     } finally {
//       setProcessingId(null);
//       setProcessingAction(null);
//       setShowModal(false);
//       setSelectedLeave(null);
//       setDecisionNote('');
//     }
//   };

//   const handleReject = async (leaveId) => {
//     if (!decisionNote.trim()) {
//       setError('Please provide a reason for rejection');
//       return;
//     }
    
//     setProcessingId(leaveId);
//     setProcessingAction('reject');
//     setError(null);
    
//     try {
//       const response = await leaveApi.reviewLeave(leaveId, {
//         status: 'Rejected',
//         decisionNote: decisionNote
//       });
      
//       if (response?.success) {
//         setSuccessMessage('Leave request rejected successfully');
//         await fetchLeaves();
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       console.error('Error rejecting leave:', err);
//       setError(err.message || 'Failed to reject leave request');
//     } finally {
//       setProcessingId(null);
//       setProcessingAction(null);
//       setShowModal(false);
//       setSelectedLeave(null);
//       setDecisionNote('');
//     }
//   };

//   const handleCancel = async (leaveId) => {
//     setProcessingId(leaveId);
//     setProcessingAction('cancel');
//     setError(null);
    
//     try {
//       const response = await leaveApi.cancelLeave(leaveId);
      
//       if (response?.success) {
//         setSuccessMessage('Leave request cancelled successfully');
//         await fetchLeaves();
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       console.error('Error cancelling leave:', err);
//       setError(err.message || 'Failed to cancel leave request');
//     } finally {
//       setProcessingId(null);
//       setProcessingAction(null);
//       setShowModal(false);
//       setSelectedLeave(null);
//     }
//   };

//   const openActionModal = (leave, action) => {
//     setSelectedLeave(leave);
//     setModalAction(action);
//     setShowModal(true);
//     setDecisionNote('');
//     setError(null);
//   };

//   const filteredLeaves = leaves.filter(leave => {
//     const matchesStatus = filterStatus === 'all' || 
//                          leave.status?.toLowerCase() === filterStatus.toLowerCase();
    
//     const searchLower = searchTerm.toLowerCase();
//     const matchesSearch = !searchTerm || 
//       leave.employee?.firstName?.toLowerCase().includes(searchLower) ||
//       leave.employee?.lastName?.toLowerCase().includes(searchLower) ||
//       leave.employee?.email?.toLowerCase().includes(searchLower) ||
//       leave.reason?.toLowerCase().includes(searchLower);
    
//     return matchesStatus && matchesSearch;
//   });

//   if (authLoading) {
//     return <LoadingSpinner text="Checking authentication..." />;
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
//         {/* Header Section */}
//         <div className="mb-6 lg:mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
//                 Leave Management
//               </h1>
//               <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
//                 View and manage all leave requests
//               </p>
//             </div>
            
//             {/* User info and refresh */}
//             <div className="mt-4 sm:mt-0 flex items-center space-x-3">
//               {user && (
//                 <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
//                     {user.firstName?.[0]}{user.lastName?.[0]}
//                   </div>
//                   <div className="text-sm">
//                     <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">{user.role || user.primaryRole}</p>
//                   </div>
//                 </div>
//               )}
//               <button
//                 onClick={fetchLeaves}
//                 className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105"
//                 title="Refresh"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
//           <StatCard title="Total" value={stats.total} icon="📊" color="total" />
//           <StatCard title="Pending" value={stats.pending} icon="⏳" color="pending" />
//           <StatCard title="Approved" value={stats.approved} icon="✅" color="approved" />
//           <StatCard title="Rejected" value={stats.rejected} icon="❌" color="rejected" />
//           <StatCard title="Cancelled" value={stats.cancelled} icon="🚫" color="cancelled" />
//           <StatCard title="Total Days" value={stats.totalDays} icon="📅" color="days" />
//         </div>

//         {/* Success Message */}
//         {successMessage && (
//           <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
//         )}

//         {/* Error Message */}
//         {error && (
//           <AlertMessage type="error" message={error} onClose={() => setError(null)} />
//         )}

//         {/* Filters */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 transition-colors duration-200">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
//               <div className="relative">
//                 <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//                 <input
//                   type="text"
//                   placeholder="Search by name, email or reason..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
//                     bg-white dark:bg-gray-700 
//                     text-gray-900 dark:text-white
//                     placeholder-gray-400 dark:placeholder-gray-500
//                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
//                     focus:border-blue-500 dark:focus:border-blue-400 
//                     transition-all duration-200"
//                 />
//               </div>
//             </div>
//             <div className="sm:w-48">
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
//                   bg-white dark:bg-gray-700 
//                   text-gray-900 dark:text-white
//                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
//                   focus:border-blue-500 dark:focus:border-blue-400 
//                   transition-all duration-200"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex justify-center items-center py-16">
//             <LoadingSpinner text="Loading leave requests..." />
//           </div>
//         ) : filteredLeaves.length === 0 ? (
//           <EmptyState hasFilters={!!(searchTerm || filterStatus !== 'all')} />
//         ) : (
//           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700">
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Employee
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Date Range
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Days
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Reason
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Decision Note
//                     </th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                   {filteredLeaves.map((leave) => (
//                     <tr key={leave.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="flex-shrink-0 h-10 w-10">
//                             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
//                               {leave.employee?.firstName?.[0] || '?'}{leave.employee?.lastName?.[0] || '?'}
//                             </div>
//                           </div>
//                           <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900 dark:text-white">
//                               {leave.employee?.firstName || 'Unknown'} {leave.employee?.lastName || 'Employee'}
//                             </div>
//                             <div className="text-xs text-gray-500 dark:text-gray-400">
//                               {leave.employee?.email || 'No email'}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900 dark:text-white font-medium">
//                           {formatDate(leave.startDate)}
//                         </div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           to {formatDate(leave.endDate)}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
//                           {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-900 dark:text-gray-300 capitalize">
//                           {leave.reason?.replace(/-/g, ' ') || 'No reason'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={getStatusBadgeStyle(leave.status)}>
//                           {leave.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
//                           {leave.decisionNote ? (
//                             <div className="flex items-start space-x-1">
//                               <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//                               </svg>
//                               <span className="flex-1">{leave.decisionNote}</span>
//                             </div>
//                           ) : (
//                             <span className="text-gray-400 dark:text-gray-500">—</span>
//                           )}
//                         </div>
//                         {leave.updatedAt && leave.status?.toLowerCase() !== 'pending' && (
//                           <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                             Updated: {formatDate(leave.updatedAt)}
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-right">
//                         <div className="flex items-center justify-end space-x-2">
//                           {/* Show Approve/Reject for Pending leaves */}
//                           {leave.status?.toLowerCase() === 'pending' && (
//                             <>
//                               {processingId === leave.id ? (
//                                 <>
//                                   {processingAction === 'approve' && (
//                                     <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 opacity-50 cursor-not-allowed">
//                                       <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-700 dark:text-green-300" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                                       </svg>
//                                       Approving...
//                                     </button>
//                                   )}
//                                   {processingAction === 'reject' && (
//                                     <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 opacity-50 cursor-not-allowed">
//                                       <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                                       </svg>
//                                       Rejecting...
//                                     </button>
//                                   )}
//                                 </>
//                               ) : (
//                                 <>
//                                   <button
//                                     onClick={() => handleApprove(leave.id)}
//                                     disabled={processingId === leave.id}
//                                     className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     Approve
//                                   </button>
//                                   <button
//                                     onClick={() => openActionModal(leave, 'reject')}
//                                     disabled={processingId === leave.id}
//                                     className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     Reject
//                                   </button>
//                                 </>
//                               )}
//                             </>
//                           )}
                          
//                           {/* Show Cancel for non-pending leaves */}
//                           {leave.status?.toLowerCase() !== 'pending' && leave.status?.toLowerCase() !== 'cancelled' && (
//                             <>
//                               {processingId === leave.id && processingAction === 'cancel' ? (
//                                 <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
//                                   <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
//                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                                   </svg>
//                                   Cancelling...
//                                 </button>
//                               ) : (
//                                 <button
//                                   onClick={() => openActionModal(leave, 'cancel')}
//                                   disabled={processingId === leave.id}
//                                   className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                                 >
//                                   Cancel
//                                 </button>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Action Modal */}
//       {showModal && selectedLeave && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" onClick={() => setShowModal(false)}>
//               <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm"></div>
//             </div>

//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

//             <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-5">
//                 <div className="sm:flex sm:items-start">
//                   <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
//                     modalAction === 'reject' 
//                       ? 'bg-red-100 dark:bg-red-900/30' 
//                       : 'bg-yellow-100 dark:bg-yellow-900/30'
//                   }`}>
//                     {modalAction === 'reject' ? (
//                       <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     ) : (
//                       <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                       </svg>
//                     )}
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
//                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                       {modalAction === 'reject' ? 'Reject Leave Request' : 'Cancel Leave Request'}
//                     </h3>
//                     <div className="mt-3">
//                       <p className="text-sm text-gray-600 dark:text-gray-400">
//                         {modalAction === 'reject' 
//                           ? `Are you sure you want to reject the leave request from ${selectedLeave.employee?.firstName} ${selectedLeave.employee?.lastName}?`
//                           : `Are you sure you want to cancel this leave request? This action cannot be undone.`
//                         }
//                       </p>
                      
//                       <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
//                         <div className="flex items-center space-x-2 mb-2">
//                           <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                             {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2 mb-2">
//                           <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                           <span className="text-sm text-gray-600 dark:text-gray-400">
//                             {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           <span className="text-sm text-gray-600 dark:text-gray-400">
//                             {selectedLeave.daysRequested} day{selectedLeave.daysRequested !== 1 ? 's' : ''}
//                           </span>
//                         </div>
//                       </div>

//                       {modalAction === 'reject' && (
//                         <div className="mt-4">
//                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                             Decision Note <span className="text-red-500 dark:text-red-400">*</span>
//                           </label>
//                           <textarea
//                             rows="3"
//                             className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl 
//                               bg-white dark:bg-gray-700 
//                               text-gray-900 dark:text-white
//                               placeholder-gray-400 dark:placeholder-gray-500
//                               focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 
//                               focus:border-red-500 dark:focus:border-red-400 
//                               resize-none transition-all duration-200"
//                             placeholder="Provide a reason for rejection..."
//                             value={decisionNote}
//                             onChange={(e) => setDecisionNote(e.target.value)}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     if (modalAction === 'reject') {
//                       handleReject(selectedLeave.id);
//                     } else {
//                       handleCancel(selectedLeave.id);
//                     }
//                   }}
//                   disabled={processingId === selectedLeave.id}
//                   className={`inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
//                     modalAction === 'reject'
//                       ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-500 dark:to-rose-500 dark:hover:from-red-600 dark:hover:to-rose-600 focus:ring-red-500 dark:focus:ring-red-400'
//                       : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 dark:from-yellow-500 dark:to-amber-500 dark:hover:from-yellow-600 dark:hover:to-amber-600 focus:ring-yellow-500 dark:focus:ring-yellow-400'
//                   }`}
//                 >
//                   {processingId === selectedLeave.id ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                       </svg>
//                       Processing...
//                     </>
//                   ) : (
//                     modalAction === 'reject' ? 'Confirm Rejection' : 'Confirm Cancellation'
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setSelectedLeave(null);
//                     setDecisionNote('');
//                     setError(null);
//                   }}
//                   disabled={processingId === selectedLeave.id}
//                   className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApprovedLeaves;

import React, { useState, useEffect, useCallback } from 'react';
import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/ui/loadingSpinner';
import { 
  StatCard, 
  StatCardSkeleton, 
  TableSkeleton, 
  EmptyState, 
  getStatusBadgeStyle, 
  AlertMessage ,
  formatDate
} from "../components/ui/StatCardSkeleton";


const ApprovedLeaves = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    totalDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [decisionNote, setDecisionNote] = useState('');

  // Check if user can manage leaves (approve/reject)
  const canManageLeaves = user && ['HR', 'Admin', 'Manager'].includes(user.primaryRole);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: '/approved-leaves', message: 'Please login to access this page' } 
      });
      return;
    }

    if (user && !canManageLeaves) {
      navigate('/dashboard', { 
        state: { error: 'You do not have permission to view the leave management page' } 
      });
    }
  }, [isAuthenticated, authLoading, user, navigate, canManageLeaves]);

  // Fetch team leaves and stats
  const fetchLeaves = useCallback(async () => {
    if (!isAuthenticated || !user || !canManageLeaves) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [teamLeavesResponse, statsResponse] = await Promise.all([
        leaveApi.getTeamLeaves(),
        leaveApi.getLeaveStats()
      ]);
      
      let leavesData = [];
      
      // Handle different response structures from the API
      if (teamLeavesResponse?.success) {
        // Check for nested data structure (from your JSON example)
        if (teamLeavesResponse.data?.data?.data) {
          leavesData = teamLeavesResponse.data.data.data;
        } else if (teamLeavesResponse.data?.data) {
          leavesData = teamLeavesResponse.data.data;
        } else if (teamLeavesResponse.data?.rows) {
          leavesData = teamLeavesResponse.data.rows;
        } else if (Array.isArray(teamLeavesResponse.data)) {
          leavesData = teamLeavesResponse.data;
        }
      } else if (teamLeavesResponse?.data?.data?.data) {
        leavesData = teamLeavesResponse.data.data.data;
      } else if (teamLeavesResponse?.data?.data) {
        leavesData = teamLeavesResponse.data.data;
      }
      
      // Filter out soft-deleted records
      const activeLeaves = leavesData.filter(leave => !leave.deletedAt);
      
      setLeaves(activeLeaves);
      
      // Calculate statistics
      const calculatedStats = {
        total: activeLeaves.length,
        approved: activeLeaves.filter(l => l.status?.toLowerCase() === 'approved').length,
        pending: activeLeaves.filter(l => l.status?.toLowerCase() === 'pending').length,
        rejected: activeLeaves.filter(l => l.status?.toLowerCase() === 'rejected').length,
        cancelled: activeLeaves.filter(l => l.status?.toLowerCase() === 'cancelled').length,
        totalDays: activeLeaves.reduce((sum, leave) => sum + (leave.daysRequested || 0), 0)
      };
      
      // Try to use stats from API if available
      if (statsResponse?.success && statsResponse.data) {
        const statsData = statsResponse.data.data || statsResponse.data;
        setStats({
          total: statsData.total || calculatedStats.total,
          approved: statsData.approved || calculatedStats.approved,
          pending: statsData.pending || calculatedStats.pending,
          rejected: statsData.rejected || calculatedStats.rejected,
          cancelled: statsData.cancelled || calculatedStats.cancelled,
          totalDays: calculatedStats.totalDays
        });
      } else {
        setStats(calculatedStats);
      }
      
    } catch (err) {
      console.error('Error fetching leaves:', err);
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to load leave requests.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, canManageLeaves]);

  useEffect(() => {
    if (isAuthenticated && user && canManageLeaves) {
      fetchLeaves();
    }

    return () => {
      cancelLeaveRequest('getTeamLeaves');
      cancelLeaveRequest('getLeaveStats');
    };
  }, [fetchLeaves, isAuthenticated, user, canManageLeaves]);

  const handleApprove = async (leaveId) => {
    setProcessingId(leaveId);
    setProcessingAction('approve');
    setError(null);
    
    try {
      const response = await leaveApi.reviewLeave(leaveId, {
        status: 'Approved',
        decisionNote: decisionNote || 'Approved by manager'
      });
      
      if (response?.success) {
        setSuccessMessage('Leave request approved successfully');
        await fetchLeaves();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error approving leave:', err);
      setError(err.message || 'Failed to approve leave request');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setShowModal(false);
      setSelectedLeave(null);
      setDecisionNote('');
    }
  };

  const handleReject = async (leaveId) => {
    if (!decisionNote.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(leaveId);
    setProcessingAction('reject');
    setError(null);
    
    try {
      const response = await leaveApi.reviewLeave(leaveId, {
        status: 'Rejected',
        decisionNote: decisionNote
      });
      
      if (response?.success) {
        setSuccessMessage('Leave request rejected successfully');
        await fetchLeaves();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setError(err.message || 'Failed to reject leave request');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setShowModal(false);
      setSelectedLeave(null);
      setDecisionNote('');
    }
  };

  const handleCancel = async (leaveId) => {
    setProcessingId(leaveId);
    setProcessingAction('cancel');
    setError(null);
    
    try {
      const response = await leaveApi.cancelLeave(leaveId);
      
      if (response?.success) {
        setSuccessMessage('Leave request cancelled successfully');
        await fetchLeaves();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error cancelling leave:', err);
      setError(err.message || 'Failed to cancel leave request');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
      setShowModal(false);
      setSelectedLeave(null);
    }
  };

  const openActionModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setShowModal(true);
    setDecisionNote('');
    setError(null);
  };

  const filteredLeaves = leaves.filter(leave => {
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

  if (authLoading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Leave Management
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                View and manage all leave requests
              </p>
            </div>
            
            {/* User info and refresh */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{user.role || user.primaryRole}</p>
                  </div>
                </div>
              )}
              <button
                onClick={fetchLeaves}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Using string emojis as icons */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
          <StatCard title="Total" value={stats.total} icon="📊" color="total" />
          <StatCard title="Pending" value={stats.pending} icon="⏳" color="pending" />
          <StatCard title="Approved" value={stats.approved} icon="✅" color="approved" />
          <StatCard title="Rejected" value={stats.rejected} icon="❌" color="rejected" />
          <StatCard title="Cancelled" value={stats.cancelled} icon="🚫" color="cancelled" />
          <StatCard title="Total Days" value={stats.totalDays} icon="📅" color="days" />
        </div>

        {/* Success Message */}
        {successMessage && (
          <AlertMessage type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        )}

        {/* Error Message */}
        {error && (
          <AlertMessage type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                    bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-white
                    placeholder-gray-400 dark:placeholder-gray-500
                    focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-blue-500 dark:focus:border-blue-400 
                    transition-all duration-200"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                  focus:border-blue-500 dark:focus:border-blue-400 
                  transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner text="Loading leave requests..." />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState hasFilters={!!(searchTerm || filterStatus !== 'all')} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Decision Note
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center text-white font-semibold">
                              {leave.employee?.firstName?.[0] || '?'}{leave.employee?.lastName?.[0] || '?'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {leave.employee?.firstName || 'Unknown'} {leave.employee?.lastName || 'Employee'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {leave.employee?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {formatDate(leave.startDate)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          to {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-300 capitalize">
                          {leave.reason?.replace(/-/g, ' ') || 'No reason'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeStyle(leave.status)}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                          {leave.decisionNote ? (
                            <div className="flex items-start space-x-1">
                              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              <span className="flex-1">{leave.decisionNote}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                        {leave.updatedAt && leave.status?.toLowerCase() !== 'pending' && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Updated: {formatDate(leave.updatedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Show Approve/Reject for Pending leaves */}
                          {leave.status?.toLowerCase() === 'pending' && (
                            <>
                              {processingId === leave.id ? (
                                <>
                                  {processingAction === 'approve' && (
                                    <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 opacity-50 cursor-not-allowed">
                                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-700 dark:text-green-300" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                      </svg>
                                      Approving...
                                    </button>
                                  )}
                                  {processingAction === 'reject' && (
                                    <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 opacity-50 cursor-not-allowed">
                                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-700 dark:text-red-300" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                      </svg>
                                      Rejecting...
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprove(leave.id)}
                                    disabled={processingId === leave.id}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openActionModal(leave, 'reject')}
                                    disabled={processingId === leave.id}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* Show Cancel for non-pending leaves */}
                          {leave.status?.toLowerCase() !== 'pending' && leave.status?.toLowerCase() !== 'cancelled' && (
                            <>
                              {processingId === leave.id && processingAction === 'cancel' ? (
                                <button disabled className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
                                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                  Cancelling...
                                </button>
                              ) : (
                                <button
                                  onClick={() => openActionModal(leave, 'cancel')}
                                  disabled={processingId === leave.id}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              )}
                            </>
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
              <div className="absolute inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-5">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    modalAction === 'reject' 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    {modalAction === 'reject' ? (
                      <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {modalAction === 'reject' ? 'Reject Leave Request' : 'Cancel Leave Request'}
                    </h3>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {modalAction === 'reject' 
                          ? `Are you sure you want to reject the leave request from ${selectedLeave.employee?.firstName} ${selectedLeave.employee?.lastName}?`
                          : `Are you sure you want to cancel this leave request? This action cannot be undone.`
                        }
                      </p>
                      
                      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {selectedLeave.employee?.firstName} {selectedLeave.employee?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedLeave.startDate)} - {formatDate(selectedLeave.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedLeave.daysRequested} day{selectedLeave.daysRequested !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {modalAction === 'reject' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Decision Note <span className="text-red-500 dark:text-red-400">*</span>
                          </label>
                          <textarea
                            rows="3"
                            className="w-full px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl 
                              bg-white dark:bg-gray-700 
                              text-gray-900 dark:text-white
                              placeholder-gray-400 dark:placeholder-gray-500
                              focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 
                              focus:border-red-500 dark:focus:border-red-400 
                              resize-none transition-all duration-200"
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
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-row-reverse space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    if (modalAction === 'reject') {
                      handleReject(selectedLeave.id);
                    } else {
                      handleCancel(selectedLeave.id);
                    }
                  }}
                  disabled={processingId === selectedLeave.id}
                  className={`inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    modalAction === 'reject'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 dark:from-red-500 dark:to-rose-500 dark:hover:from-red-600 dark:hover:to-rose-600 focus:ring-red-500 dark:focus:ring-red-400'
                      : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 dark:from-yellow-500 dark:to-amber-500 dark:hover:from-yellow-600 dark:hover:to-amber-600 focus:ring-yellow-500 dark:focus:ring-yellow-400'
                  }`}
                >
                  {processingId === selectedLeave.id ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    modalAction === 'reject' ? 'Confirm Rejection' : 'Confirm Cancellation'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLeave(null);
                    setDecisionNote('');
                    setError(null);
                  }}
                  disabled={processingId === selectedLeave.id}
                  className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-6 py-2.5 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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