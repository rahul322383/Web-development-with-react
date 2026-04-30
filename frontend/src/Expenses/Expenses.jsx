
// import React, { useState, useEffect, useCallback } from 'react';
// import { expenseApi, cancelExpenseRequest } from '../api/expenseApi';
// import {
//   Receipt,
//   Upload,
//   CheckCircle,
//   XCircle,
//   Clock,
//   IndianRupee,
//   Filter,
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   Download,
//   AlertCircle,
//   Loader,
//   Plus,
//   X,
//   FileText,
//   Calendar,
//   User,
//   Ban,
//   RefreshCw
// } from 'lucide-react';
// import { toast } from 'sonner';

// // -----------------------------------------------------------------------------
// // Status Badge Component with Dark Mode
// // -----------------------------------------------------------------------------
// const StatusBadge = ({ status, className = '' }) => {
//   const statusConfig = {
//     'Pending': {
//       light: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       dark: 'dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700',
//       icon: Clock
//     },
//     'Approved': {
//       light: 'bg-green-100 text-green-800 border-green-200',
//       dark: 'dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
//       icon: CheckCircle
//     },
//     'Rejected': {
//       light: 'bg-red-100 text-red-800 border-red-200',
//       dark: 'dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
//       icon: XCircle
//     },
//     'Processing': {
//       light: 'bg-blue-100 text-blue-800 border-blue-200',
//       dark: 'dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
//       icon: Loader
//     },
//     'Paid': {
//       light: 'bg-purple-100 text-purple-800 border-purple-200',
//       dark: 'dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
//       icon: IndianRupee
//     },
//     'Unpaid': {
//       light: 'bg-gray-100 text-gray-800 border-gray-200',
//       dark: 'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
//       icon: Ban
//     }
//   };

//   const config = statusConfig[status] || statusConfig['Pending'];
//   const Icon = config.icon;

//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200 ${config.light} ${config.dark} ${className}`}>
//       <Icon className="w-3 h-3 mr-1" />
//       {status}
//     </span>
//   );
// };

// // -----------------------------------------------------------------------------
// // Loading Spinner
// // -----------------------------------------------------------------------------
// const LoadingSpinner = ({ text = 'Loading...' }) => (
//   <div className="flex justify-center items-center py-12">
//     <Loader className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
//     <span className="ml-3 text-gray-600 dark:text-gray-400">{text}</span>
//   </div>
// );

// // -----------------------------------------------------------------------------
// // Empty State
// // -----------------------------------------------------------------------------
// const EmptyState = ({ activeTab, onSubmit }) => (
//   <div className="text-center py-12">
//     <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
//       <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
//     </div>
//     <h3 className="text-lg font-medium text-gray-900 dark:text-white">No expenses found</h3>
//     <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//       {activeTab === 'my-expenses'
//         ? 'Get started by submitting a new expense.'
//         : 'No pending expenses to review.'}
//     </p>
//     {activeTab === 'my-expenses' && onSubmit && (
//       <button
//         onClick={onSubmit}
//         className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
//       >
//         <Plus className="w-4 h-4 mr-2" />
//         Submit Expense
//       </button>
//     )}
//   </div>
// );

// // -----------------------------------------------------------------------------
// // Error Alert
// // -----------------------------------------------------------------------------
// const ErrorAlert = ({ message, onDismiss }) => (
//   <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg animate-fade-in">
//     <div className="flex items-start">
//       <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 flex-shrink-0" />
//       <div className="ml-3 flex-1">
//         <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
//       </div>
//       {onDismiss && (
//         <button
//           onClick={onDismiss}
//           className="ml-auto text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       )}
//     </div>
//   </div>
// );

// // -----------------------------------------------------------------------------
// // Modal Component
// // -----------------------------------------------------------------------------
// const Modal = ({ open, onClose, title, children, size = 'md' }) => {
//   if (!open) return null;

//   const sizes = {
//     md: 'max-w-md',
//     lg: 'max-w-lg',
//     xl: 'max-w-xl',
//     full: 'max-w-4xl'
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
//         onClick={onClose}
//       />
//       <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in duration-200`}>
//         <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 px-6 py-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
//             <button
//               onClick={onClose}
//               className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
//             >
//               <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//             </button>
//           </div>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// // -----------------------------------------------------------------------------
// // Main Expenses Component
// // -----------------------------------------------------------------------------
// const Expenses = () => {
//   const [activeTab, setActiveTab] = useState('my-expenses');
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showSubmitModal, setShowSubmitModal] = useState(false);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);
//   const [expandedExpense, setExpandedExpense] = useState(null);
//   const [filters, setFilters] = useState({
//     status: 'all',
//     category: 'all'
//   });

//   // Receipt preview state
//   const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);

//   // Form state for submitting expense
//   const [formData, setFormData] = useState({
//     category: '',
//     amount: '',
//     currency: 'INR',
//     description: ''
//   });
//   const [receiptFile, setReceiptFile] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [formErrors, setFormErrors] = useState({});

//   // Review state
//   const [reviewData, setReviewData] = useState({
//     status: 'Approved',
//     paymentStatus: 'Processing',
//     comment: ''
//   });

//   // ---------------------------------------------------------------------------
//   // Central status resolver
//   // ---------------------------------------------------------------------------
//   const getExpenseStatus = useCallback((expense, tab) => {
//     switch (tab) {
//       case 'pending-manager':
//         return expense.managerApprovalStatus;
//       case 'pending-finance':
//         return expense.financeApprovalStatus;
//       case 'my-expenses':
//         if (expense.financeApprovalStatus && expense.financeApprovalStatus !== 'Pending') {
//           return expense.financeApprovalStatus;
//         }
//         return expense.managerApprovalStatus;
//       default:
//         return expense.managerApprovalStatus;
//     }
//   }, []);

//   // ---------------------------------------------------------------------------
//   // Get secondary status for my-expenses tab
//   // ---------------------------------------------------------------------------
//   const getSecondaryStatus = useCallback((expense, tab) => {
//     if (tab === 'my-expenses') {
//       if (expense.financeApprovalStatus === 'Approved' && expense.paymentStatus) {
//         return expense.paymentStatus;
//       }
//       if (expense.financeApprovalStatus &&
//         expense.financeApprovalStatus !== expense.managerApprovalStatus) {
//         return expense.financeApprovalStatus;
//       }
//     }
//     return null;
//   }, []);

//   // ---------------------------------------------------------------------------
//   // Load expenses (memoized with useCallback)
//   // ---------------------------------------------------------------------------
//   const loadExpenses = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       let response;
//       switch (activeTab) {
//         case 'my-expenses':
//           response = await expenseApi.getMyExpenses();
//           break;
//         case 'pending-manager':
//           response = await expenseApi.getPendingManagerExpenses();
//           break;
//         case 'pending-finance':
//           response = await expenseApi.getPendingFinanceExpenses();
//           break;
//         default:
//           response = await expenseApi.getMyExpenses();
//       }

//       if (response.success) {
//         setExpenses(response.data || []);
//       } else {
//         setError(response.message || 'Failed to load expenses');
//       }
//     } catch (err) {
//       if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
//         setError(err.response?.data?.message || 'Failed to load expenses');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [activeTab]);

//   useEffect(() => {
//     loadExpenses();

//     return () => {
//       cancelExpenseRequest('getMyExpenses');
//       cancelExpenseRequest('getPendingManagerExpenses');
//       cancelExpenseRequest('getPendingFinanceExpenses');
//     };
//   }, [loadExpenses]);

//   // ---------------------------------------------------------------------------
//   // Submit new expense
//   // ---------------------------------------------------------------------------
//   const handleSubmitExpense = async (e) => {
//     e.preventDefault();

//     const errors = {};
//     if (!formData.category) errors.category = 'Category is required';
//     if (!formData.amount || formData.amount <= 0) errors.amount = 'Valid amount is required';
//     if (!formData.currency) errors.currency = 'Currency is required';

//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     // File size validation (max 10 MB)
//     if (receiptFile && receiptFile.size > 10 * 1024 * 1024) {
//       setFormErrors({ submit: 'File size exceeds 10 MB limit.' });
//       return;
//     }

//     setSubmitting(true);
//     setFormErrors({});

//     try {
//       const submitFormData = new FormData();
//       submitFormData.append('category', formData.category);
//       submitFormData.append('amount', parseFloat(formData.amount));
//       submitFormData.append('currency', formData.currency);
//       submitFormData.append('description', formData.description || '');

//       if (receiptFile) {
//         submitFormData.append('receipt', receiptFile);
//       }

//       const response = await expenseApi.submitExpense(submitFormData);

//       if (response.success) {
//         setShowSubmitModal(false);
//         resetForm();
//         loadExpenses();
//         toast.success('Expense submitted successfully');
//       } else {
//         setFormErrors({ submit: response.message });
//       }
//     } catch (err) {
//       setFormErrors({ submit: err.response?.data?.message || 'Failed to submit expense' });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------------------------------------------------------------------------
//   // Manager review
//   // ---------------------------------------------------------------------------
//   const handleManagerReview = async () => {
//     if (!selectedExpense) return;

//     setSubmitting(true);

//     try {
//       const response = await expenseApi.managerReview(selectedExpense.id, {
//         status: reviewData.status,
//         comment: reviewData.comments   // 🔥 FIX: backend expects 'comment'
//       });

//       if (response.success) {
//         setShowReviewModal(false);
//         setSelectedExpense(null);
//         loadExpenses();
//         toast.success(`Expense ${reviewData.status.toLowerCase()} successfully`);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to submit review');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------------------------------------------------------------------------
//   // Finance review
//   // ---------------------------------------------------------------------------
//   const handleFinanceReview = async () => {
//     if (!selectedExpense) return;

//     setSubmitting(true);

//     try {
//       const response = await expenseApi.financeReview(selectedExpense.id, {
//         status: reviewData.status,
//         paymentStatus: reviewData.paymentStatus,
//         comment: reviewData.comments   // 🔥 FIX: backend expects 'comment'
//       });

//       if (response.success) {
//         setShowReviewModal(false);
//         setSelectedExpense(null);
//         loadExpenses();
//         toast.success(`Expense ${reviewData.status.toLowerCase()} successfully`);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to submit review');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       category: '',
//       amount: '',
//       currency: 'INR',
//       description: ''
//     });
//     setReceiptFile(null);
//     setFormErrors({});
//   };

//   const getCategoryIcon = (category) => {
//     const icons = {
//       'food': '🍔',
//       'travel': '✈️',
//       'accommodation': '🏨',
//       'office': '💼',
//       'other': '📋'
//     };
//     return icons[category?.toLowerCase()] || '📊';
//   };

//   // ---------------------------------------------------------------------------
//   // Filter expenses
//   // ---------------------------------------------------------------------------
//   const filteredExpenses = expenses.filter(expense => {
//     if (filters.status !== 'all') {
//       const currentStatus = getExpenseStatus(expense, activeTab);
//       const secondaryStatus = getSecondaryStatus(expense, activeTab);
//       if (currentStatus !== filters.status && secondaryStatus !== filters.status) {
//         return false;
//       }
//     }
//     if (filters.category !== 'all' && expense.category !== filters.category) {
//       return false;
//     }
//     return true;
//   });

//   const categories = [...new Set(expenses.map(e => e.category))];

//   // Cleanup blob URL on unmount or when preview URL changes
//   useEffect(() => {
//     return () => {
//       if (previewReceiptUrl?.startsWith('blob:')) {
//         URL.revokeObjectURL(previewReceiptUrl);
//       }
//     };
//   }, [previewReceiptUrl]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       {/* Header */}
//       <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
//               <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                 Submit and track your expense reimbursements
//               </p>
//             </div>
//             <div className="flex items-center space-x-3">
//               {activeTab === 'my-expenses' && (
//                 <button
//                   onClick={() => setShowSubmitModal(true)}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Submit Expense
//                 </button>
//               )}
//               <button
//                 onClick={loadExpenses}
//                 className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200"
//                 title="Refresh"
//               >
//                 <RefreshCw className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <div className="border-b border-gray-200 dark:border-gray-700">
//           <nav className="-mb-px flex space-x-8">
//             <button
//               onClick={() => setActiveTab('my-expenses')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'my-expenses'
//                   ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
//                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
//                 }`}
//             >
//               <FileText className="w-4 h-4 inline mr-2" />
//               My Expenses
//             </button>
//             <button
//               onClick={() => setActiveTab('pending-manager')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'pending-manager'
//                   ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
//                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
//                 }`}
//             >
//               <Clock className="w-4 h-4 inline mr-2" />
//               Pending Manager Review
//             </button>
//             <button
//               onClick={() => setActiveTab('pending-finance')}
//               className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'pending-finance'
//                   ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
//                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
//                 }`}
//             >
//               <IndianRupee className="w-4 h-4 inline mr-2" />
//               Pending Finance Review
//             </button>
//           </nav>
//         </div>

//         {/* Filters */}
//         <div className="mt-6 flex flex-wrap items-center gap-4">
//           <div className="flex items-center space-x-2">
//             <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//             <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
//           </div>
//           <select
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//             className="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
//           >
//             <option value="all">All Status</option>
//             <option value="Pending">Pending</option>
//             <option value="Approved">Approved</option>
//             <option value="Rejected">Rejected</option>
//             <option value="Processing">Processing</option>
//             <option value="Paid">Paid</option>
//             <option value="Unpaid">Unpaid</option>
//           </select>
//           <select
//             value={filters.category}
//             onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//             className="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
//           >
//             <option value="all">All Categories</option>
//             {categories.map(category => (
//               <option key={category} value={category}>
//                 {category.charAt(0).toUpperCase() + category.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Error Alert */}
//         {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

//         {/* Expenses List */}
//         <div className="mt-6">
//           {loading ? (
//             <LoadingSpinner text="Loading expenses..." />
//           ) : filteredExpenses.length === 0 ? (
//             <EmptyState
//               activeTab={activeTab}
//               onSubmit={activeTab === 'my-expenses' ? () => setShowSubmitModal(true) : null}
//             />
//           ) : (
//             <div className="space-y-4">
//               {filteredExpenses.map((expense) => {
//                 const primaryStatus = getExpenseStatus(expense, activeTab);
//                 const secondaryStatus = getSecondaryStatus(expense, activeTab);

//                 return (
//                   <div key={expense.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
//                     <div className="p-6">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-4">
//                           <div className="flex-shrink-0">
//                             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
//                               {getCategoryIcon(expense.category)}
//                             </div>
//                           </div>
//                           <div>
//                             <div className="flex items-center space-x-2 flex-wrap gap-2">
//                               <h3 className="text-lg font-medium text-gray-900 dark:text-white">
//                                 {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
//                               </h3>
//                               <StatusBadge status={primaryStatus} />
//                               {secondaryStatus && <StatusBadge status={secondaryStatus} />}
//                               {/* 🔥 Warning: No manager assigned */}
//                               {activeTab === 'my-expenses' && !expense.approvedByManagerId && (
//                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700">
//                                   <AlertCircle className="w-3 h-3 mr-1" />
//                                   No manager assigned
//                                 </span>
//                               )}
//                             </div>
//                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expense.description}</p>
//                             <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
//                               <span className="flex items-center">
//                                 <IndianRupee className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
//                                 <span className="font-medium text-gray-900 dark:text-white">{expense.amount}</span>
//                                 <span className="ml-1">{expense.currency}</span>
//                               </span>
//                               <span className="flex items-center">
//                                 <Calendar className="w-4 h-4 mr-1" />
//                                 {new Date(expense.createdAt).toLocaleDateString()}
//                               </span>
//                               {expense.employeeId && (
//                                 <span className="flex items-center">
//                                   <User className="w-4 h-4 mr-1" />
//                                   Employee #{expense.employeeId}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           {expense.receipt?.cloudinaryUrl && (
//                             <button
//                               onClick={() => setPreviewReceiptUrl(expense.receipt.cloudinaryUrl)}
//                               className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
//                             >
//                               <Eye className="w-3 h-3 mr-1" />
//                               View Receipt
//                             </button>
//                           )}
//                           {(activeTab === 'pending-manager' && expense.managerApprovalStatus === 'Pending') && (
//                             <button
//                               onClick={() => {
//                                 setSelectedExpense(expense);
//                                 setReviewData({ ...reviewData, status: 'Approved' });
//                                 setShowReviewModal(true);
//                               }}
//                               className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
//                             >
//                               Review
//                             </button>
//                           )}
//                           {(activeTab === 'pending-finance' && expense.financeApprovalStatus === 'Pending') && (
//                             <button
//                               onClick={() => {
//                                 setSelectedExpense(expense);
//                                 setReviewData({
//                                   status: 'Approved',
//                                   paymentStatus: expense.paymentStatus || 'Processing',
//                                   comments: ''
//                                 });
//                                 setShowReviewModal(true);
//                               }}
//                               className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
//                             >
//                               Review
//                             </button>
//                           )}
//                           <button
//                             onClick={() => setExpandedExpense(expandedExpense === expense.id ? null : expense.id)}
//                             className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
//                           >
//                             {expandedExpense === expense.id ? (
//                               <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                             ) : (
//                               <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       {/* Expanded Details */}
//                       {expandedExpense === expense.id && (
//                         <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
//                           <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
//                             <div>
//                               <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expense ID</dt>
//                               <dd className="mt-1 text-sm text-gray-900 dark:text-white">#{expense.id}</dd>
//                             </div>
//                             <div>
//                               <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</dt>
//                               <dd className="mt-1 text-sm text-gray-900 dark:text-white">
//                                 {new Date(expense.createdAt).toLocaleString()}
//                               </dd>
//                             </div>
//                             <div>
//                               <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Approval</dt>
//                               <dd className="mt-1">
//                                 <StatusBadge status={expense.managerApprovalStatus || 'Pending'} />
//                               </dd>
//                             </div>
//                             <div>
//                               <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Finance Approval</dt>
//                               <dd className="mt-1">
//                                 <StatusBadge status={expense.financeApprovalStatus || 'Pending'} />
//                               </dd>
//                             </div>
//                             {expense.paymentStatus && (
//                               <div>
//                                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</dt>
//                                 <dd className="mt-1">
//                                   <StatusBadge status={expense.paymentStatus} />
//                                 </dd>
//                               </div>
//                             )}
//                             {expense.paidAt && (
//                               <div>
//                                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Date</dt>
//                                 <dd className="mt-1 text-sm text-gray-900 dark:text-white">
//                                   {new Date(expense.paidAt).toLocaleString()}
//                                 </dd>
//                               </div>
//                             )}
//                             {expense.managerComment && (
//                               <div className="sm:col-span-2">
//                                 <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Comment</dt>
//                                 <dd className="mt-1 text-sm text-gray-900 dark:text-white">{expense.managerComment}</dd>
//                               </div>
//                             )}
//                           </dl>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Submit Expense Modal */}
//       <Modal
//         open={showSubmitModal}
//         onClose={() => {
//           setShowSubmitModal(false);
//           resetForm();
//         }}
//         title="Submit New Expense"
//       >
//         <form onSubmit={handleSubmitExpense} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Category *
//             </label>
//             <select
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.category ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
//                 }`}
//             >
//               <option value="">Select category</option>
//               <option value="food">Food</option>
//               <option value="travel">Travel</option>
//               <option value="accommodation">Accommodation</option>
//               <option value="office">Office Supplies</option>
//               <option value="other">Other</option>
//             </select>
//             {formErrors.category && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.category}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Amount *
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <IndianRupee className="h-4 w-4 text-gray-400 dark:text-gray-500" />
//               </div>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                 className={`w-full pl-9 pr-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.amount ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
//                   }`}
//                 placeholder="0.00"
//               />
//             </div>
//             {formErrors.amount && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.amount}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Currency *
//             </label>
//             <select
//               value={formData.currency}
//               onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
//               className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.currency ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
//                 }`}
//             >
//               <option value="INR">INR (₹)</option>
//               <option value="USD">USD ($)</option>
//               <option value="EUR">EUR (€)</option>
//               <option value="GBP">GBP (£)</option>
//             </select>
//             {formErrors.currency && (
//               <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.currency}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               rows="3"
//               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
//               placeholder="Enter expense details..."
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Receipt (Optional)
//             </label>
//             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
//               <div className="space-y-1 text-center">
//                 <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
//                 <div className="flex text-sm text-gray-600 dark:text-gray-400">
//                   <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-gray-800">
//                     <span>Upload a file</span>
//                     <input
//                       type="file"
//                       accept="image/*,.pdf"
//                       className="sr-only"
//                       onChange={(e) => setReceiptFile(e.target.files[0])}
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
//                 {receiptFile && (
//                   <p className="text-sm text-green-600 dark:text-green-400">✓ {receiptFile.name}</p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {formErrors.submit && (
//             <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-3 rounded-r-lg">
//               <p className="text-sm text-red-700 dark:text-red-300">{formErrors.submit}</p>
//             </div>
//           )}

//           <div className="flex justify-end space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => {
//                 setShowSubmitModal(false);
//                 resetForm();
//               }}
//               className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
//             >
//               {submitting ? (
//                 <>
//                   <Loader className="w-4 h-4 inline animate-spin mr-2" />
//                   Submitting...
//                 </>
//               ) : (
//                 'Submit Expense'
//               )}
//             </button>
//           </div>
//         </form>
//       </Modal>

//       {/* Review Modal */}
//       <Modal
//         open={showReviewModal}
//         onClose={() => {
//           setShowReviewModal(false);
//           setSelectedExpense(null);
//           setError(null);
//         }}
//         title={`Review Expense #${selectedExpense?.id}`}
//       >
//         {selectedExpense && (
//           <div className="space-y-4">
//             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <span className="text-gray-600 dark:text-gray-400">Category:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.category}</span>
//                 <span className="text-gray-600 dark:text-gray-400">Amount:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.amount} {selectedExpense.currency}</span>
//                 <span className="text-gray-600 dark:text-gray-400">Description:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.description || '-'}</span>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Decision *
//               </label>
//               <div className="space-y-2">
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     value="Approved"
//                     checked={reviewData.status === 'Approved'}
//                     onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
//                     className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600"
//                   />
//                   <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Approve</span>
//                 </label>
//                 <label className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     value="Rejected"
//                     checked={reviewData.status === 'Rejected'}
//                     onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
//                     className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600"
//                   />
//                   <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Reject</span>
//                 </label>
//               </div>
//             </div>

//             {activeTab === 'pending-finance' && reviewData.status === 'Approved' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   Payment Status
//                 </label>
//                 <select
//                   value={reviewData.paymentStatus}
//                   onChange={(e) => setReviewData({ ...reviewData, paymentStatus: e.target.value })}
//                   className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
//                 >
//                   <option value="Processing">Processing</option>
//                   <option value="Paid">Paid</option>
//                   <option value="Unpaid">Unpaid</option>
//                 </select>
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Comments (Optional)
//               </label>
//               <textarea
//                 value={reviewData.comments}
//                 onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
//                 rows="3"
//                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
//                 placeholder="Add any comments..."
//               />
//             </div>

//             {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

//             <div className="flex justify-end space-x-3 pt-4">
//               <button
//                 onClick={() => {
//                   setShowReviewModal(false);
//                   setSelectedExpense(null);
//                   setError(null);
//                 }}
//                 className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={activeTab === 'pending-manager' ? handleManagerReview : handleFinanceReview}
//                 disabled={submitting}
//                 className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200 ${reviewData.status === 'Approved'
//                     ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400'
//                     : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400'
//                   }`}
//               >
//                 {submitting ? (
//                   <>
//                     <Loader className="w-4 h-4 inline animate-spin mr-2" />
//                     Processing...
//                   </>
//                 ) : (
//                   `Confirm ${reviewData.status === 'Approved' ? 'Approval' : 'Rejection'}`
//                 )}
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Receipt Preview Modal */}
//       <Modal
//         open={!!previewReceiptUrl}
//         onClose={() => setPreviewReceiptUrl(null)}
//         title="Receipt Preview"
//         size="full"
//       >
//         <div className="flex flex-col items-center">
//           <div className="relative w-full max-h-[70vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
//             <img
//               src={previewReceiptUrl}
//               alt="Receipt"
//               className="w-full h-auto object-contain"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 // Show simple error text instead of SVG
//                 const parent = e.target.parentElement;
//                 if (parent) {
//                   const errorDiv = document.createElement('div');
//                   errorDiv.className = 'p-8 text-center text-gray-500 dark:text-gray-400';
//                   errorDiv.innerHTML = '⚠️ Unable to load image. The file may be inaccessible or corrupted.';
//                   parent.innerHTML = '';
//                   parent.appendChild(errorDiv);
//                 }
//               }}
//             />
//           </div>
//           <div className="mt-4 flex justify-end w-full">
//             <a
//               href={previewReceiptUrl}
//               download
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
//             >
//               <Download className="w-4 h-4 mr-2" />
//               Download
//             </a>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Expenses;

import React, { useState, useEffect, useCallback } from 'react';
import { expenseApi, cancelExpenseRequest } from '../api/expenseApi';
import {
  Receipt,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  AlertCircle,
  Loader,
  Plus,
  X,
  FileText,
  Calendar,
  User,
  Ban,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
// -----------------------------------------------------------------------------
// Status Badge Component with Dark Mode
// -----------------------------------------------------------------------------
const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    'Pending': {
      light: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dark: 'dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700',
      icon: Clock
    },
    'Approved': {
      light: 'bg-green-100 text-green-800 border-green-200',
      dark: 'dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
      icon: CheckCircle
    },
    'Rejected': {
      light: 'bg-red-100 text-red-800 border-red-200',
      dark: 'dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
      icon: XCircle
    },
    'Processing': {
      light: 'bg-blue-100 text-blue-800 border-blue-200',
      dark: 'dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
      icon: Loader
    },
    'Paid': {
      light: 'bg-purple-100 text-purple-800 border-purple-200',
      dark: 'dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
      icon: IndianRupee
    },
    'Unpaid': {
      light: 'bg-gray-100 text-gray-800 border-gray-200',
      dark: 'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
      icon: Ban
    }
  };

  const config = statusConfig[status] || statusConfig['Pending'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200 ${config.light} ${config.dark} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

// -----------------------------------------------------------------------------
// Loading Spinner
// -----------------------------------------------------------------------------
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex justify-center items-center py-12">
    <Loader className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
    <span className="ml-3 text-gray-600 dark:text-gray-400">{text}</span>
  </div>
);

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------
const EmptyState = ({ activeTab, onSubmit }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
      <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No expenses found</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {activeTab === 'my-expenses'
        ? 'Get started by submitting a new expense.'
        : 'No pending expenses to review.'}
    </p>
    {activeTab === 'my-expenses' && onSubmit && (
      <button
        onClick={onSubmit}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Submit Expense
      </button>
    )}
  </div>
);

// -----------------------------------------------------------------------------
// Error Alert
// -----------------------------------------------------------------------------
const ErrorAlert = ({ message, onDismiss }) => (
  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-4 rounded-r-lg animate-fade-in">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 flex-shrink-0" />
      <div className="ml-3 flex-1">
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Modal Component
// -----------------------------------------------------------------------------
const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;

  const sizes = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto transform transition-all animate-in fade-in zoom-in duration-200`}>
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Expenses Component
// -----------------------------------------------------------------------------
const Expenses = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-expenses');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });

  // Receipt preview state
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);

  // Form state for submitting expense
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    currency: 'INR',
    description: ''
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Review state – fixed: now uses `comment` (singular) to match backend
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    paymentStatus: 'Processing',
    comment: ''
  });

  // ---------------------------------------------------------------------------
  // Central status resolver
  // ---------------------------------------------------------------------------
  const getExpenseStatus = useCallback((expense, tab) => {
    switch (tab) {
      case 'pending-manager':
        return expense.managerApprovalStatus;
      case 'pending-finance':
        return expense.financeApprovalStatus;
      case 'my-expenses':
        if (expense.financeApprovalStatus && expense.financeApprovalStatus !== 'Pending') {
          return expense.financeApprovalStatus;
        }
        return expense.managerApprovalStatus;
      default:
        return expense.managerApprovalStatus;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Get secondary status for my-expenses tab
  // ---------------------------------------------------------------------------
  const getSecondaryStatus = useCallback((expense, tab) => {
    if (tab === 'my-expenses') {
      if (expense.financeApprovalStatus === 'Approved' && expense.paymentStatus) {
        return expense.paymentStatus;
      }
      if (expense.financeApprovalStatus &&
        expense.financeApprovalStatus !== expense.managerApprovalStatus) {
        return expense.financeApprovalStatus;
      }
    }
    return null;
  }, []);

  // ---------------------------------------------------------------------------
  // Load expenses (memoized with useCallback)
  // ---------------------------------------------------------------------------
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (activeTab) {
        case 'my-expenses':
          response = await expenseApi.getMyExpenses();
          break;
        case 'pending-manager':
          response = await expenseApi.getPendingManagerExpenses();
          break;
        case 'pending-finance':
          response = await expenseApi.getPendingFinanceExpenses();
          break;
        default:
          response = await expenseApi.getMyExpenses();
      }

      if (response.success) {
        setExpenses(response.data || []);
      } else {
        setError(response.message || 'Failed to load expenses');
      }
    } catch (err) {
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
        setError(err.response?.data?.message || 'Failed to load expenses');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadExpenses();

    return () => {
      cancelExpenseRequest('getMyExpenses');
      cancelExpenseRequest('getPendingManagerExpenses');
      cancelExpenseRequest('getPendingFinanceExpenses');
    };
  }, [loadExpenses]);

  // ---------------------------------------------------------------------------
  // Submit new expense
  // ---------------------------------------------------------------------------
  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Valid amount is required';
    if (!formData.currency) errors.currency = 'Currency is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // File size validation (max 10 MB)
    if (receiptFile && receiptFile.size > 10 * 1024 * 1024) {
      setFormErrors({ submit: 'File size exceeds 10 MB limit.' });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const submitFormData = new FormData();
      submitFormData.append('category', formData.category);
      submitFormData.append('amount', parseFloat(formData.amount));
      submitFormData.append('currency', formData.currency);
      submitFormData.append('description', formData.description || '');

      if (receiptFile) {
        submitFormData.append('receipt', receiptFile);
      }

      const response = await expenseApi.submitExpense(submitFormData);

      if (response.success) {
        setShowSubmitModal(false);
        resetForm();
        loadExpenses();
        toast.success('Expense submitted successfully');
      } else {
        setFormErrors({ submit: response.message });
      }
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.message || 'Failed to submit expense' });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Manager review – FIXED: uses `comment` and uppercases status
  // ---------------------------------------------------------------------------
  const handleManagerReview = async () => {
    if (!selectedExpense) return;

    setSubmitting(true);

    try {
      const response = await expenseApi.managerReview(selectedExpense.id, {
        managerId: user.id,              
        expenseId: selectedExpense.id,
        status: reviewData.status.toUpperCase(),
        comment: reviewData.comment                 
      });

      if (response.success) {
        setShowReviewModal(false);
        setSelectedExpense(null);
        loadExpenses();
        toast.success(`Expense ${reviewData.status.toLowerCase()} successfully`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Finance review – FIXED: uses `comment` and uppercases status
  // ---------------------------------------------------------------------------
  const handleFinanceReview = async () => {
    if (!selectedExpense) return;

    setSubmitting(true);

    try {
      const response = await expenseApi.financeReview(selectedExpense.id, {
        financeUserId:user.id,
        expenseId: selectedExpense.id,
        status: reviewData.status.toUpperCase(),
        paymentStatus: reviewData.paymentStatus,
        comment: reviewData.comment
      });

      if (response.success) {
        setShowReviewModal(false);
        setSelectedExpense(null);
        loadExpenses();
        toast.success(`Expense ${reviewData.status.toLowerCase()} successfully`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      currency: 'INR',
      description: ''
    });
    setReceiptFile(null);
    setFormErrors({});
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'food': '🍔',
      'travel': '✈️',
      'accommodation': '🏨',
      'office': '💼',
      'other': '📋'
    };
    return icons[category?.toLowerCase()] || '📊';
  };

  // ---------------------------------------------------------------------------
  // Filter expenses
  // ---------------------------------------------------------------------------
  const filteredExpenses = expenses.filter(expense => {
    if (filters.status !== 'all') {
      const currentStatus = getExpenseStatus(expense, activeTab);
      const secondaryStatus = getSecondaryStatus(expense, activeTab);
      if (currentStatus !== filters.status && secondaryStatus !== filters.status) {
        return false;
      }
    }
    if (filters.category !== 'all' && expense.category !== filters.category) {
      return false;
    }
    return true;
  });

  const categories = [...new Set(expenses.map(e => e.category))];

  // Cleanup blob URL on unmount or when preview URL changes
  useEffect(() => {
    return () => {
      if (previewReceiptUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewReceiptUrl);
      }
    };
  }, [previewReceiptUrl]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Submit and track your expense reimbursements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {activeTab === 'my-expenses' && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Expense
                </button>
              )}
              <button
                onClick={loadExpenses}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my-expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'my-expenses'
                ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Expenses
            </button>
            <button
              onClick={() => setActiveTab('pending-manager')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'pending-manager'
                ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending Manager Review
            </button>
            <button
              onClick={() => setActiveTab('pending-finance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'pending-finance'
                ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              <IndianRupee className="w-4 h-4 inline mr-2" />
              Pending Finance Review
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Processing">Processing</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="text-sm border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Expenses List */}
        <div className="mt-6">
          {loading ? (
            <LoadingSpinner text="Loading expenses..." />
          ) : filteredExpenses.length === 0 ? (
            <EmptyState
              activeTab={activeTab}
              onSubmit={activeTab === 'my-expenses' ? () => setShowSubmitModal(true) : null}
            />
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const primaryStatus = getExpenseStatus(expense, activeTab);
                const secondaryStatus = getSecondaryStatus(expense, activeTab);

                return (
                  <div key={expense.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
                              {getCategoryIcon(expense.category)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                              </h3>
                              <StatusBadge status={primaryStatus} />
                              {secondaryStatus && <StatusBadge status={secondaryStatus} />}
                              {/* 🔥 Warning: No manager assigned */}
                              {activeTab === 'my-expenses' && !expense.approvedByManagerId && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  No manager assigned
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expense.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                              <span className="flex items-center">
                                <IndianRupee className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">{expense.amount}</span>
                                <span className="ml-1">{expense.currency}</span>
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(expense.createdAt).toLocaleDateString()}
                              </span>
                              {expense.employeeId && (
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  Employee #{expense.employeeId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {expense.receipt?.cloudinaryUrl && (
                            <button
                              onClick={() => setPreviewReceiptUrl(expense.receipt.cloudinaryUrl)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Receipt
                            </button>
                          )}
                          {(activeTab === 'pending-manager' && expense.managerApprovalStatus === 'Pending') && (
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setReviewData({ ...reviewData, status: 'Approved' });
                                setShowReviewModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
                            >
                              Review
                            </button>
                          )}
                          {(activeTab === 'pending-finance' && expense.financeApprovalStatus === 'Pending') && (
                            <button
                              onClick={() => {
                                setSelectedExpense(expense);
                                setReviewData({
                                  status: 'Approved',
                                  paymentStatus: expense.paymentStatus || 'Processing',
                                  comment: ''
                                });
                                setShowReviewModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200"
                            >
                              Review
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedExpense(expandedExpense === expense.id ? null : expense.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {expandedExpense === expense.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedExpense === expense.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expense ID</dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">#{expense.id}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Date</dt>
                              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                {new Date(expense.createdAt).toLocaleString()}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Approval</dt>
                              <dd className="mt-1">
                                <StatusBadge status={expense.managerApprovalStatus || 'Pending'} />
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Finance Approval</dt>
                              <dd className="mt-1">
                                <StatusBadge status={expense.financeApprovalStatus || 'Pending'} />
                              </dd>
                            </div>
                            {expense.paymentStatus && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</dt>
                                <dd className="mt-1">
                                  <StatusBadge status={expense.paymentStatus} />
                                </dd>
                              </div>
                            )}
                            {expense.paidAt && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Date</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {new Date(expense.paidAt).toLocaleString()}
                                </dd>
                              </div>
                            )}
                            {expense.managerComment && (
                              <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manager Comment</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{expense.managerComment}</dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Submit Expense Modal */}
      <Modal
        open={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          resetForm();
        }}
        title="Submit New Expense"
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.category ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <option value="">Select category</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="accommodation">Accommodation</option>
              <option value="office">Office Supplies</option>
              <option value="other">Other</option>
            </select>
            {formErrors.category && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.amount ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="0.00"
              />
            </div>
            {formErrors.amount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${formErrors.currency ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              {/* Only currencies allowed by backend Joi schema */}
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
            {formErrors.currency && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.currency}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              placeholder="Enter expense details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Receipt (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-gray-800">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, PDF up to 10MB</p>
                {receiptFile && (
                  <p className="text-sm text-green-600 dark:text-green-400">✓ {receiptFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {formErrors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 p-3 rounded-r-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{formErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowSubmitModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 inline animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Expense'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        open={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedExpense(null);
          setError(null);
        }}
        title={`Review Expense #${selectedExpense?.id}`}
      >
        {selectedExpense && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.category}</span>
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.amount} {selectedExpense.currency}</span>
                <span className="text-gray-600 dark:text-gray-400">Description:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.description || '-'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Decision *
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="Approved"
                    checked={reviewData.status === 'Approved'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Approve</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="Rejected"
                    checked={reviewData.status === 'Rejected'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="focus:ring-blue-500 dark:focus:ring-blue-400 h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Reject</span>
                </label>
              </div>
            </div>

            {activeTab === 'pending-finance' && reviewData.status === 'Approved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={reviewData.paymentStatus}
                  onChange={(e) => setReviewData({ ...reviewData, paymentStatus: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                >
                  <option value="Processing">Processing</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comments (Optional)
              </label>
              <textarea
                value={reviewData.comment}  // Fixed: now uses `comment` consistently
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                placeholder="Add any comments..."
              />
            </div>

            {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedExpense(null);
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'pending-manager' ? handleManagerReview : handleFinanceReview}
                disabled={submitting}
                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200 ${reviewData.status === 'Approved'
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400'
                  : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400'
                  }`}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 inline animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Confirm ${reviewData.status === 'Approved' ? 'Approval' : 'Rejection'}`
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal
        open={!!previewReceiptUrl}
        onClose={() => setPreviewReceiptUrl(null)}
        title="Receipt Preview"
        size="full"
      >
        <div className="flex flex-col items-center">
          <div className="relative w-full max-h-[70vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <img
              src={previewReceiptUrl}
              alt="Receipt"
              className="w-full h-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                const parent = e.target.parentElement;
                if (parent) {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'p-8 text-center text-gray-500 dark:text-gray-400';
                  errorDiv.innerHTML = '⚠️ Unable to load image. The file may be inaccessible or corrupted.';
                  parent.innerHTML = '';
                  parent.appendChild(errorDiv);
                }
              }}
            />
          </div>
          <div className="mt-4 flex justify-end w-full">
            <a
              href={previewReceiptUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;