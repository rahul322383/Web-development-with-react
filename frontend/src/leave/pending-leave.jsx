
// import React, { useState, useEffect, useCallback } from 'react';
// import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import {LoadingSpinner,
    
//     formatDate,
//     getStatusIcon,
//   StatCard, 
//   StatCardSkeleton, 
//   TableSkeleton, 
//   EmptyState, 
//   getStatusBadgeStyle, 
//   AlertMessage } from '../components/ui/StatCardSkeleton';


// const PendingLeaves = () => {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const navigate = useNavigate();
  
//   const [leaveRequests, setLeaveRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [processingId, setProcessingId] = useState(null);
//   const [reviewNote, setReviewNote] = useState({});
//   const [successMessage, setSuccessMessage] = useState('');

//   // Check authentication and authorization using useAuth
//   useEffect(() => {
//     if (!authLoading && !isAuthenticated) {
//       navigate('/login', { 
//         state: { from: '/pending-leave', message: 'Please login to access this page' } 
//       });
//       return;
//     }

//     // Check if user has required role using user from useAuth
//     if (user && !['HR', 'Admin', 'Manager'].includes(user.primaryRole)) {
//       navigate('/dashboard', { 
//         state: { error: 'You do not have permission to view pending leaves' } 
//       });
//     }
//   }, [isAuthenticated, authLoading, user, navigate]);

//   // Fetch leaves (both pending and approved)
//   const fetchLeaves = useCallback(async () => {
//     if (!isAuthenticated || !user) return;
    
//     setLoading(true);
//     setError(null);

//     try {
//       // Fetch all leave requests that need review (pending ones)
//       const response = await leaveApi.getPendingLeaves();
          
//       let leaves = [];
//       if (response?.success) {
//         if (Array.isArray(response.data)) {
//           leaves = response.data;
//         } else if (response.data?.rows && Array.isArray(response.data.rows)) {
//           leaves = response.data.rows;
//         } else if (response.data?.data && Array.isArray(response.data.data)) {
//           leaves = response.data.data;
//         }
//       } else if (Array.isArray(response)) {
//         leaves = response;
//       } else if (response?.data && Array.isArray(response.data)) {
//         leaves = response.data;
//       }
      
//       setLeaveRequests(leaves);
//     } catch (err) {
//       console.error("ERROR:", err);
      
//       const msg = err?.response?.data?.message || 
//                   err?.message || 
//                   "Failed to load leave requests.";
      
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, user]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchLeaves();
//     }

//     return () => {
//       cancelLeaveRequest('getPendingLeaves');
//     };
//   }, [fetchLeaves, isAuthenticated, user]);

//   // Handle leave approval/rejection
//   const handleReview = async (leaveId, action, decisionNote = '') => {
//     setProcessingId(leaveId);
//     setError(null);
    
//     try {
//       const response = await leaveApi.reviewLeave(leaveId, {
//         status: action,
//         decisionNote: decisionNote || `${action} by manager`,
//       });
      
//       if (response?.success) {
//         // Update the leave status in the list instead of removing it
//         setLeaveRequests((prev) => 
//           prev.map((leave) => 
//             leave.id === leaveId 
//               ? { ...leave, status: action, decisionNote: decisionNote || `${action} by manager` }
//               : leave
//           )
//         );
//         setSuccessMessage(`Leave request ${action.toLowerCase()} successfully`);
        
//         // Clear success message after 3 seconds
//         setTimeout(() => setSuccessMessage(''), 3000);
//       } else {
//         throw new Error(response?.message || `Failed to ${action.toLowerCase()} leave`);
//       }
      
//     } catch (err) {
//       console.error(`Error ${action} leave:`, err);
//       if (err.name !== 'AbortError') {
//         const msg = err?.response?.data?.message || 
//                     err?.message || 
//                     `Failed to ${action.toLowerCase()} leave request. Please try again.`;
//         setError(msg);
//       }
//     } finally {
//       setProcessingId(null);
//       setReviewNote((prev) => ({ ...prev, [leaveId]: '' }));
//     }
//   };

//   // Handle note change
//   const handleNoteChange = (leaveId, note) => {
//     setReviewNote((prev) => ({ ...prev, [leaveId]: note }));
//   };

//   // Render reviewed card (Approved/Rejected)
//   const renderReviewedCard = (leave) => {
//     const isApproved = leave.status?.toLowerCase() === 'approved';
//     const gradientClass = isApproved
//       ? 'from-green-50 to-white dark:from-green-900/10 dark:to-gray-800'
//       : 'from-red-50 to-white dark:from-red-900/10 dark:to-gray-800';
//     const borderClass = isApproved
//       ? 'border-green-200 dark:border-green-800'
//       : 'border-red-200 dark:border-red-800';
//     const iconColor = isApproved
//       ? 'text-green-500 dark:text-green-400'
//       : 'text-red-500 dark:text-red-400';
    
//     return (
//       <div className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-sm border ${borderClass} overflow-hidden hover:shadow-lg transition-all duration-200 dark:shadow-gray-900/50`}>
//         {/* Card Header */}
//         <div className={`px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b ${isApproved ? 'border-green-100 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/5' : 'border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/5'}`}>
//           <div className="flex justify-between items-start">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center space-x-2">
//                 {getStatusIcon(leave.status)}
//                 <h3 className="font-semibold text-gray-900 dark:text-white truncate">
//                   {leave.employee
//                     ? `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim() || 'Unknown Employee'
//                     : 'Unknown Employee'}
//                 </h3>
//               </div>
//               <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{leave.employee?.email || 'No email'}</p>
//               {leave.employee?.department && (
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{leave.employee.department}</p>
//               )}
//             </div>
//             <span className={getStatusBadgeStyle(leave.status)}>
//               {leave.status}
//             </span>
//           </div>
//         </div>

//         {/* Card Body */}
//         <div className="px-4 sm:px-5 py-4 space-y-3">
//           {/* Date Range */}
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm text-gray-900 dark:text-white font-medium">
//                 {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                 Duration: {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
//               </p>
//             </div>
//           </div>

//           {/* Leave Type & Reason */}
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
//                 {leave.reason?.replace(/-/g, ' ') || 'No reason provided'}
//               </p>
//             </div>
//           </div>

//           {/* Submitted Date */}
//           {leave.createdAt && (
//             <div className="flex items-start space-x-3">
//               <div className="flex-shrink-0">
//                 <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   Submitted: {formatDate(leave.createdAt)}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Decision Note */}
//           {leave.decisionNote && (
//             <div className={`mt-3 p-3 rounded-lg border ${isApproved ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'}`}>
//               <div className="flex items-start space-x-2">
//                 <svg className={`w-4 h-4 ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-0.5 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//                 </svg>
//                 <div className="flex-1">
//                   <p className={`text-xs font-medium ${isApproved ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
//                     Manager's Note:
//                   </p>
//                   <p className={`text-sm ${isApproved ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
//                     {leave.decisionNote}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Reviewed Date */}
//           {leave.updatedAt && leave.status !== 'pending' && (
//             <div className="flex items-start space-x-3">
//               <div className="flex-shrink-0">
//                 <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className={`text-xs ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                   Reviewed: {formatDate(leave.updatedAt)}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Render pending card (with action buttons)
//   const renderPendingCard = (leave) => (
//     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-700 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 dark:shadow-gray-900/50">
//       {/* Card Header */}
//       <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-yellow-100 dark:border-yellow-900/50">
//         <div className="flex justify-between items-start">
//           <div className="flex-1 min-w-0">
//             <h3 className="font-semibold text-gray-900 dark:text-white truncate">
//               {leave.employee
//                 ? `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim() || 'Unknown Employee'
//                 : 'Unknown Employee'}
//             </h3>
//             <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{leave.employee?.email || 'No email'}</p>
//             {leave.employee?.department && (
//               <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{leave.employee.department}</p>
//             )}
//           </div>
//           <span className={getStatusBadgeStyle(leave.status)}>
//             {leave.status}
//           </span>
//         </div>
//       </div>

//       {/* Card Body */}
//       <div className="px-4 sm:px-5 py-4 space-y-3">
//         {/* Date Range */}
//         <div className="flex items-start space-x-3">
//           <div className="flex-shrink-0">
//             <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm text-gray-900 dark:text-white font-medium">
//               {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//               Duration: {leave.daysRequested} day{leave.daysRequested !== 1 ? 's' : ''}
//             </p>
//           </div>
//         </div>

//         {/* Leave Type & Reason */}
//         <div className="flex items-start space-x-3">
//           <div className="flex-shrink-0">
//             <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
//             </svg>
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
//               {leave.reason?.replace(/-/g, ' ') || 'No reason provided'}
//             </p>
//           </div>
//         </div>

//         {/* Submitted Date */}
//         {leave.createdAt && (
//           <div className="flex items-start space-x-3">
//             <div className="flex-shrink-0">
//               <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-xs text-gray-500 dark:text-gray-400">
//                 Submitted: {formatDate(leave.createdAt)}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Decision Note Input */}
//         <div className="pt-2">
//           <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
//             Decision Note <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
//           </label>
//           <textarea
//             rows="2"
//             className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
//               bg-white dark:bg-gray-700 
//               text-gray-900 dark:text-white
//               placeholder-gray-400 dark:placeholder-gray-500
//               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
//               focus:border-blue-500 dark:focus:border-blue-400 
//               transition-all duration-200 resize-none"
//             placeholder="Add a note for the employee..."
//             value={reviewNote[leave.id] || ''}
//             onChange={(e) => handleNoteChange(leave.id, e.target.value)}
//             disabled={processingId === leave.id}
//           />
//         </div>
//       </div>

//       {/* Card Footer - Action Buttons */}
//       <div className="px-4 sm:px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//           <button
//             onClick={() => handleReview(leave.id, 'Approved', reviewNote[leave.id])}
//             disabled={processingId === leave.id}
//             className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg 
//               text-white 
//               bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
//               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
//               dark:focus:ring-offset-gray-800 dark:focus:ring-green-400
//               transition-all duration-200 
//               ${processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
//           >
//             {processingId === leave.id ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//                 Approve
//               </>
//             )}
//           </button>
//           <button
//             onClick={() => handleReview(leave.id, 'Rejected', reviewNote[leave.id])}
//             disabled={processingId === leave.id}
//             className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg 
//               text-red-700 dark:text-red-400
//               bg-white dark:bg-gray-800 
//               border border-gray-300 dark:border-gray-600
//               hover:bg-red-50 dark:hover:bg-red-900/20 
//               hover:border-red-300 dark:hover:border-red-700
//               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
//               dark:focus:ring-offset-gray-800 dark:focus:ring-red-400
//               transition-all duration-200 
//               ${processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
//           >
//             {processingId === leave.id ? (
//               <>
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Processing...
//               </>
//             ) : (
//               <>
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//                 Reject
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Show loading state while checking authentication
//   if (authLoading) {
//     return <LoadingSpinner text="Checking authentication..." />;
//   }

//   // Don't render if not authenticated
//   if (!isAuthenticated) {
//     return null;
//   }

//   if (loading) {
//     return <LoadingSpinner text="Loading leave requests..." />;
//   }

//   // Separate pending and approved/rejected leaves
//   const pendingLeaves = leaveRequests.filter(leave => leave.status?.toLowerCase() === 'pending');
//   const reviewedLeaves = leaveRequests.filter(leave => 
//     leave.status?.toLowerCase() === 'approved' || leave.status?.toLowerCase() === 'rejected'
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
//         {/* Header Section */}
//         <div className="mb-6 lg:mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
//                 Leave Request Management
//               </h1>
//               <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
//                 Review pending requests and view reviewed leaves
//               </p>
//             </div>
            
//             {/* User info and refresh button */}
//             <div className="mt-4 sm:mt-0 flex items-center space-x-3">
//               {user && (
//                 <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
//                   <span className="font-medium">{user.firstName} {user.lastName}</span>
//                   <span className="mx-2">•</span>
//                   <span className="text-blue-600 dark:text-blue-400">{user.role || user.primaryRole}</span>
//                 </div>
//               )}
//               <button
//                 onClick={fetchLeaves}
//                 className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
//                   bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all duration-200 
//                   border border-gray-200 dark:border-gray-700"
//                 title="Refresh"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Success Message */}
//         {successMessage && (
//           <AlertMessage 
//             type="success" 
//             message={successMessage} 
//             onClose={() => setSuccessMessage('')} 
//           />
//         )}

//         {/* Error Message */}
//         {error && (
//           <AlertMessage 
//             type="error" 
//             message={error} 
//             onClose={() => setError(null)} 
//             onRetry={fetchLeaves}
//           />
//         )}

//         {/* Pending Leaves Section */}
//         {pendingLeaves.length > 0 && (
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
//                 <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 border border-yellow-200 dark:border-yellow-700">
//                   {pendingLeaves.length}
//                 </span>
//                 Pending Requests
//               </h2>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
//               {pendingLeaves.map((leave) => renderPendingCard(leave))}
//             </div>
//           </div>
//         )}

//         {/* Reviewed Leaves Section (Approved/Rejected) */}
//         {reviewedLeaves.length > 0 && (
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
//                 <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 border border-gray-200 dark:border-gray-700">
//                   {reviewedLeaves.length}
//                 </span>
//                 Reviewed Requests
//               </h2>
//             </div>
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
//               {reviewedLeaves.map((leave) => renderReviewedCard(leave))}
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {leaveRequests.length === 0 && !loading && (
//           <EmptyState onRefresh={fetchLeaves} />
//         )}

//         {/* Summary Footer */}
//         {leaveRequests.length > 0 && (
//           <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
//             <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
//               <div>
//                 <span className="font-medium text-gray-900 dark:text-white">{pendingLeaves.length}</span> pending,{' '}
//                 <span className="font-medium text-gray-900 dark:text-white">{reviewedLeaves.length}</span> reviewed
//               </div>
//               <div>
//                 Total: <span className="font-medium text-gray-900 dark:text-white">{leaveRequests.length}</span> requests
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PendingLeaves;

// components/leaves/PendingLeaves.jsx - Fixed version
import React, { useState, useEffect, useCallback } from 'react';
import { leaveApi, cancelLeaveRequest } from '../api/leaveApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LoadingSpinner,
  formatDate,
  getStatusIcon,
  StatCard,
  StatCardSkeleton,
  TableSkeleton,
  EmptyState,
  getStatusBadgeStyle,
  AlertMessage
} from '../components/ui/StatCardSkeleton';

const PendingLeaves = () => {
  const { user, meta, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [reviewNote, setReviewNote] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check authentication and authorization
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: '/pending-leave', message: 'Please login to access this page' } 
      });
      return;
    }

    // Check if user has required role
    // User data structure from your API:
    // user.primaryRole or meta.role
    const userRole = user?.primaryRole || meta?.role;
    
    if (user && !['HR', 'Admin', 'Manager'].includes(userRole)) {
      navigate('/dashboard', { 
        state: { error: 'You do not have permission to view pending leaves' } 
      });
    }
  }, [isAuthenticated, authLoading, user, meta, navigate]);

  // Fetch leaves (both pending and reviewed)
  const fetchLeaves = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await leaveApi.getPendingLeaves();
          
      let leaves = [];
      if (response?.success) {
        if (Array.isArray(response.data)) {
          leaves = response.data;
        } else if (response.data?.rows && Array.isArray(response.data.rows)) {
          leaves = response.data.rows;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          leaves = response.data.data;
        }
      } else if (Array.isArray(response)) {
        leaves = response;
      } else if (response?.data && Array.isArray(response.data)) {
        leaves = response.data;
      }
      
      setLeaveRequests(leaves);
    } catch (err) {
      console.error("ERROR:", err);
      
      const msg = err?.response?.data?.message || 
                  err?.message || 
                  "Failed to load leave requests.";
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLeaves();
    }

    return () => {
      cancelLeaveRequest('getPendingLeaves');
    };
  }, [fetchLeaves, isAuthenticated, user]);

  // Handle leave approval/rejection
  const handleReview = async (leaveId, action, decisionNote = '') => {
    setProcessingId(leaveId);
    setError(null);
    
    try {
      const response = await leaveApi.reviewLeave(leaveId, {
        status: action,
        decisionNote: decisionNote || `${action} by ${user?.primaryRole || meta?.role || 'manager'}`,
      });
      
      if (response?.success) {
        setLeaveRequests((prev) => 
          prev.map((leave) => 
            leave.id === leaveId 
              ? { ...leave, status: action, decisionNote: decisionNote || `${action} by manager` }
              : leave
          )
        );
        setSuccessMessage(`Leave request ${action.toLowerCase()} successfully`);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(response?.message || `Failed to ${action.toLowerCase()} leave`);
      }
      
    } catch (err) {
      console.error(`Error ${action} leave:`, err);
      if (err.name !== 'AbortError') {
        const msg = err?.response?.data?.message || 
                    err?.message || 
                    `Failed to ${action.toLowerCase()} leave request. Please try again.`;
        setError(msg);
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

  // Get user display name from the API response structure
  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Get user role from the API response structure
  const getUserRole = () => {
    return user?.primaryRole || meta?.role || 'Employee';
  };

  // Render reviewed card (Approved/Rejected)
  const renderReviewedCard = (leave) => {
    const isApproved = leave.status?.toLowerCase() === 'approved';
    const gradientClass = isApproved
      ? 'from-green-50 to-white dark:from-green-900/10 dark:to-gray-800'
      : 'from-red-50 to-white dark:from-red-900/10 dark:to-gray-800';
    const borderClass = isApproved
      ? 'border-green-200 dark:border-green-800'
      : 'border-red-200 dark:border-red-800';
    const iconColor = isApproved
      ? 'text-green-500 dark:text-green-400'
      : 'text-red-500 dark:text-red-400';
    
    // Get employee name safely
    const employeeName = leave.employee
      ? leave.employee.fullName || `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim() || 'Unknown Employee'
      : leave.user?.fullName || leave.user?.name || 'Unknown Employee';
    
    const employeeEmail = leave.employee?.email || leave.user?.email || 'No email';
    const employeeDepartment = leave.employee?.department || leave.user?.department || meta?.department || '';

    return (
      <div className={`bg-gradient-to-br ${gradientClass} rounded-xl shadow-sm border ${borderClass} overflow-hidden hover:shadow-lg transition-all duration-200 dark:shadow-gray-900/50`}>
        {/* Card Header */}
        <div className={`px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b ${isApproved ? 'border-green-100 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/5' : 'border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/5'}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getStatusIcon(leave.status)}
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {employeeName}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{employeeEmail}</p>
              {employeeDepartment && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{employeeDepartment}</p>
              )}
            </div>
            <span className={getStatusBadgeStyle(leave.status)}>
              {leave.status}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-4 sm:px-5 py-4 space-y-3">
          {/* Date Range */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Duration: {leave.daysRequested || leave.days || 1} day{leave.daysRequested !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Leave Type & Reason */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {leave.leaveType || leave.reason?.replace(/-/g, ' ') || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Submitted Date */}
          {leave.createdAt && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {formatDate(leave.createdAt)}
                </p>
              </div>
            </div>
          )}

          {/* Decision Note */}
          {leave.decisionNote && (
            <div className={`mt-3 p-3 rounded-lg border ${isApproved ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'}`}>
              <div className="flex items-start space-x-2">
                <svg className={`w-4 h-4 ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-0.5 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isApproved ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                    Manager's Note:
                  </p>
                  <p className={`text-sm ${isApproved ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                    {leave.decisionNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reviewed Date */}
          {leave.updatedAt && leave.status !== 'pending' && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isApproved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Reviewed: {formatDate(leave.updatedAt)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render pending card (with action buttons)
  const renderPendingCard = (leave) => {
    // Get employee name safely
    const employeeName = leave.employee
      ? leave.employee.fullName || `${leave.employee.firstName || ''} ${leave.employee.lastName || ''}`.trim() || 'Unknown Employee'
      : leave.user?.fullName || leave.user?.name || 'Unknown Employee';
    
    const employeeEmail = leave.employee?.email || leave.user?.email || 'No email';
    const employeeDepartment = leave.employee?.department || leave.user?.department || '';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-700 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 dark:shadow-gray-900/50">
        {/* Card Header */}
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-yellow-100 dark:border-yellow-900/50">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {employeeName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{employeeEmail}</p>
              {employeeDepartment && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{employeeDepartment}</p>
              )}
            </div>
            <span className={getStatusBadgeStyle(leave.status)}>
              {leave.status}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-4 sm:px-5 py-4 space-y-3">
          {/* Date Range */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Duration: {leave.daysRequested || leave.days || 1} day{leave.daysRequested !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Leave Type & Reason */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {leave.leaveType || leave.reason?.replace(/-/g, ' ') || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Submitted Date */}
          {leave.createdAt && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {formatDate(leave.createdAt)}
                </p>
              </div>
            </div>
          )}

          {/* Decision Note Input */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Decision Note <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
            </label>
            <textarea
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                focus:border-blue-500 dark:focus:border-blue-400 
                transition-all duration-200 resize-none"
              placeholder="Add a note for the employee..."
              value={reviewNote[leave.id] || ''}
              onChange={(e) => handleNoteChange(leave.id, e.target.value)}
              disabled={processingId === leave.id}
            />
          </div>
        </div>

        {/* Card Footer - Action Buttons */}
        <div className="px-4 sm:px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => handleReview(leave.id, 'Approved', reviewNote[leave.id])}
              disabled={processingId === leave.id}
              className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg 
                text-white 
                bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                dark:focus:ring-offset-gray-800 dark:focus:ring-green-400
                transition-all duration-200 
                ${processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
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
              className={`flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium rounded-lg 
                text-red-700 dark:text-red-400
                bg-white dark:bg-gray-800 
                border border-gray-300 dark:border-gray-600
                hover:bg-red-50 dark:hover:bg-red-900/20 
                hover:border-red-300 dark:hover:border-red-700
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                dark:focus:ring-offset-gray-800 dark:focus:ring-red-400
                transition-all duration-200 
                ${processingId === leave.id ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
              {processingId === leave.id ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    );
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <LoadingSpinner text="Loading leave requests..." />;
  }

  // Separate pending and approved/rejected leaves
  const pendingLeaves = leaveRequests.filter(leave => leave.status?.toLowerCase() === 'pending');
  const reviewedLeaves = leaveRequests.filter(leave => 
    leave.status?.toLowerCase() === 'approved' || leave.status?.toLowerCase() === 'rejected'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Leave Request Management
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Review pending requests and view reviewed leaves
              </p>
            </div>
            
            {/* User info and refresh button */}
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                  <span className="font-medium">{getUserDisplayName()}</span>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600 dark:text-blue-400">{getUserRole()}</span>
                </div>
              )}
              <button
                onClick={fetchLeaves}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                  bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-all duration-200 
                  border border-gray-200 dark:border-gray-700"
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
          <AlertMessage 
            type="success" 
            message={successMessage} 
            onClose={() => setSuccessMessage('')} 
          />
        )}

        {/* Error Message */}
        {error && (
          <AlertMessage 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
            onRetry={fetchLeaves}
          />
        )}

        {/* Pending Leaves Section */}
        {pendingLeaves.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 border border-yellow-200 dark:border-yellow-700">
                  {pendingLeaves.length}
                </span>
                Pending Requests
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {pendingLeaves.map((leave) => (
                <div key={leave.id}>
                  {renderPendingCard(leave)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Leaves Section (Approved/Rejected) */}
        {reviewedLeaves.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 border border-gray-200 dark:border-gray-700">
                  {reviewedLeaves.length}
                </span>
                Reviewed Requests
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {reviewedLeaves.map((leave) => (
                <div key={leave.id}>
                  {renderReviewedCard(leave)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {leaveRequests.length === 0 && !loading && (
          <EmptyState onRefresh={fetchLeaves} />
        )}

        {/* Summary Footer */}
        {leaveRequests.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{pendingLeaves.length}</span> pending,{' '}
                <span className="font-medium text-gray-900 dark:text-white">{reviewedLeaves.length}</span> reviewed
              </div>
              <div>
                Total: <span className="font-medium text-gray-900 dark:text-white">{leaveRequests.length}</span> requests
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingLeaves;