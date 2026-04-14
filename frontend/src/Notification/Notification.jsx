// // components/notifications/Notifications.jsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Bell,
//   CheckCheck,
//   Trash2,
//   RefreshCw,
//   AlertCircle,
//   Clock,
//   Info,
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   Inbox,
//   Wifi,
//   WifiOff,
//   Calendar,
//   DollarSign,
//   CreditCard,
//   UserPlus,
//   FileText,
//   Briefcase,
//   MessageSquare
// } from 'lucide-react';
// import { toast } from 'sonner';
// import notificationApi from '../api/notificationApi';
// import { formatDistanceToNow } from 'date-fns';

// // ========================
// // NOTIFICATION CARD COMPONENT
// // ========================
// const NotificationCard = ({ notification, onMarkRead, onDelete, isNew }) => {
//   const getTypeStyles = (type) => {
//     const styles = {
//       leave: {
//         bg: 'bg-blue-50 dark:bg-blue-900/20',
//         border: 'border-blue-200 dark:border-blue-800',
//         icon: Calendar,
//         iconColor: 'text-blue-600 dark:text-blue-400',
//         hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
//       },
//       leave_approved: {
//         bg: 'bg-green-50 dark:bg-green-900/20',
//         border: 'border-green-200 dark:border-green-800',
//         icon: CheckCircle,
//         iconColor: 'text-green-600 dark:text-green-400',
//         hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
//       },
//       leave_rejected: {
//         bg: 'bg-red-50 dark:bg-red-900/20',
//         border: 'border-red-200 dark:border-red-800',
//         icon: XCircle,
//         iconColor: 'text-red-600 dark:text-red-400',
//         hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
//       },
//       expense: {
//         bg: 'bg-emerald-50 dark:bg-emerald-900/20',
//         border: 'border-emerald-200 dark:border-emerald-800',
//         icon: DollarSign,
//         iconColor: 'text-emerald-600 dark:text-emerald-400',
//         hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
//       },
//       expense_approved: {
//         bg: 'bg-green-50 dark:bg-green-900/20',
//         border: 'border-green-200 dark:border-green-800',
//         icon: CheckCircle,
//         iconColor: 'text-green-600 dark:text-green-400',
//         hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
//       },
//       expense_rejected: {
//         bg: 'bg-red-50 dark:bg-red-900/20',
//         border: 'border-red-200 dark:border-red-800',
//         icon: XCircle,
//         iconColor: 'text-red-600 dark:text-red-400',
//         hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
//       },
//       payroll: {
//         bg: 'bg-purple-50 dark:bg-purple-900/20',
//         border: 'border-purple-200 dark:border-purple-800',
//         icon: CreditCard,
//         iconColor: 'text-purple-600 dark:text-purple-400',
//         hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
//       },
//       system: {
//         bg: 'bg-gray-50 dark:bg-gray-900/20',
//         border: 'border-gray-200 dark:border-gray-800',
//         icon: Info,
//         iconColor: 'text-gray-600 dark:text-gray-400',
//         hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30'
//       },
//       success: {
//         bg: 'bg-green-50 dark:bg-green-900/20',
//         border: 'border-green-200 dark:border-green-800',
//         icon: CheckCircle,
//         iconColor: 'text-green-600 dark:text-green-400',
//         hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
//       },
//       warning: {
//         bg: 'bg-amber-50 dark:bg-amber-900/20',
//         border: 'border-amber-200 dark:border-amber-800',
//         icon: AlertTriangle,
//         iconColor: 'text-amber-600 dark:text-amber-400',
//         hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30'
//       },
//       error: {
//         bg: 'bg-red-50 dark:bg-red-900/20',
//         border: 'border-red-200 dark:border-red-800',
//         icon: XCircle,
//         iconColor: 'text-red-600 dark:text-red-400',
//         hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
//       },
//       user_joined: {
//         bg: 'bg-cyan-50 dark:bg-cyan-900/20',
//         border: 'border-cyan-200 dark:border-cyan-800',
//         icon: UserPlus,
//         iconColor: 'text-cyan-600 dark:text-cyan-400',
//         hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
//       },
//       message: {
//         bg: 'bg-indigo-50 dark:bg-indigo-900/20',
//         border: 'border-indigo-200 dark:border-indigo-800',
//         icon: MessageSquare,
//         iconColor: 'text-indigo-600 dark:text-indigo-400',
//         hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
//       }
//     };
//     return styles[type] || styles.system;
//   };

//   const styles = getTypeStyles(notification.type);
//   const IconComponent = styles.icon;
  
//   const formattedTime = notification.createdAt 
//     ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
//     : 'Just now';

//   return (
//     <motion.div
//       initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : { opacity: 0, x: -20 }}
//       animate={{ opacity: 1, x: 0, scale: 1 }}
//       exit={{ opacity: 0, x: 20 }}
//       className={`
//         relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
//         ${notification.isRead || notification.read ? 'opacity-75' : 'shadow-md'}
//         ${isNew ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2' : ''}
//         ${styles.bg} ${styles.border} ${styles.hover}
//       `}
//       onClick={() => !notification.isRead && !notification.read && onMarkRead(notification.id)}
//     >
//       {isNew && (
//         <div className="absolute -top-2 -right-2 z-10">
//           <span className="flex items-center px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full shadow-lg">
//             NEW
//           </span>
//         </div>
//       )}
      
//       <div className="flex items-start gap-3">
//         <div className={`flex-shrink-0 ${styles.iconColor}`}>
//           <IconComponent className="w-5 h-5" />
//         </div>
        
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2 mb-1">
//             <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
//               {notification.title || 'Notification'}
//             </h4>
//             {!notification.isRead && !notification.read && (
//               <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
//             )}
//           </div>
          
//           <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
//             {notification.message}
//           </p>
          
//           <div className="flex items-center justify-between">
//             <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
//               <Clock className="w-3 h-3" />
//               {formattedTime}
//             </span>
            
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDelete(notification.id);
//               }}
//               className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
//               aria-label="Delete notification"
//             >
//               <Trash2 className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // ========================
// // FILTER TABS COMPONENT
// // ========================
// const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
//   const tabs = [
//     { id: 'all', label: 'All', count: counts.all },
//     { id: 'unread', label: 'Unread', count: counts.unread },
//     { id: 'read', label: 'Read', count: counts.read }
//   ];

//   return (
//     <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
//       {tabs.map((tab) => (
//         <button
//           key={tab.id}
//           onClick={() => onFilterChange(tab.id)}
//           className={`
//             flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
//             ${activeFilter === tab.id
//               ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
//               : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
//             }
//           `}
//         >
//           {tab.label}
//           {tab.count > 0 && (
//             <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
//               {tab.count}
//             </span>
//           )}
//         </button>
//       ))}
//     </div>
//   );
// };

// // ========================
// // EMPTY STATE COMPONENT
// // ========================
// const EmptyState = ({ filter }) => {
//   const messages = {
//     all: {
//       title: 'No notifications yet',
//       description: 'When you receive notifications, they will appear here',
//       icon: Inbox
//     },
//     unread: {
//       title: 'No unread notifications',
//       description: "You're all caught up!",
//       icon: CheckCheck
//     },
//     read: {
//       title: 'No read notifications',
//       description: 'Notifications you mark as read will appear here',
//       icon: CheckCircle
//     }
//   };

//   const { title, description, icon: Icon } = messages[filter] || messages.all;

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="flex flex-col items-center justify-center py-16 px-4 text-center"
//     >
//       <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
//         <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
//       </div>
//       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//         {title}
//       </h3>
//       <p className="text-gray-500 dark:text-gray-400 max-w-sm">
//         {description}
//       </p>
//     </motion.div>
//   );
// };

// // ========================
// // LOADING SKELETON
// // ========================
// const NotificationSkeleton = () => (
//   <div className="space-y-3">
//     {[...Array(5)].map((_, i) => (
//       <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
//         <div className="flex items-start gap-3">
//           <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
//           <div className="flex-1">
//             <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
//             <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
//             <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
//             <div className="flex justify-between">
//               <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
//               <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
//             </div>
//           </div>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // ========================
// // MAIN NOTIFICATIONS COMPONENT
// // ========================
// export const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeFilter, setActiveFilter] = useState('all');
//   const [error, setError] = useState(null);
//   const [newNotificationIds, setNewNotificationIds] = useState(new Set());
//   const [isConnected, setIsConnected] = useState(true);

//   // Fetch all notifications
//   const fetchNotifications = useCallback(async () => {
//     try {
//       setError(null);
      
//       const [notificationsData, unreadData] = await Promise.all([
//         notificationApi.getNotifications(50, 0),
//         notificationApi.getUnreadCount()
//       ]);

//       // Handle different response structures
//       const notificationList = Array.isArray(notificationsData) 
//         ? notificationsData 
//         : notificationsData?.notifications || notificationsData?.data || [];
      
//       setNotifications(notificationList);
//       setUnreadCount(unreadData?.count || unreadData?.unread || 0);
      
//     } catch (err) {
//       console.error('Failed to fetch notifications:', err);
//       setError(err.message || 'Failed to fetch notifications');
//       toast.error('Failed to load notifications');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   // Initial fetch
//   useEffect(() => {
//     fetchNotifications();
//   }, [fetchNotifications]);

//   // Poll for new notifications every 30 seconds
//   // useEffect(() => {
//   //   const interval = setInterval(async () => {
//   //     try {
//   //       const unreadData = await notificationApi.getUnreadCount();
//   //       const newCount = unreadData?.count || unreadData?.unread || 0;
        
//   //       if (newCount > unreadCount) {
//   //         // New notifications available, refresh the list
//   //         fetchNotifications();
//   //       } else {
//   //         setUnreadCount(newCount);
//   //       }
//   //     } catch (err) {
//   //       console.error('Failed to poll notifications:', err);
//   //     }
//   //   }, 30000);

//   //   return () => clearInterval(interval);
//   // }, [unreadCount, fetchNotifications]);

//   // Mark single notification as read
//   const handleMarkAsRead = async (id) => {
//     try {
//       await notificationApi.markAsRead(id);
      
//       setNotifications(prev =>
//         prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n)
//       );
//       setUnreadCount(prev => Math.max(0, prev - 1));
      
//       toast.success('Notification marked as read');
//     } catch (err) {
//       console.error('Failed to mark as read:', err);
//       toast.error('Failed to mark as read');
//     }
//   };

//   // Mark all as read
//   const handleMarkAllRead = async () => {
//     try {
//       await notificationApi.markAllAsRead();
      
//       setNotifications(prev =>
//         prev.map(n => ({ ...n, isRead: true, read: true }))
//       );
//       setUnreadCount(0);
      
//       toast.success('All notifications marked as read');
//     } catch (err) {
//       console.error('Failed to mark all as read:', err);
//       toast.error('Failed to mark all as read');
//     }
//   };

//   // Delete single notification
//   const handleDelete = async (id) => {
//     try {
//       const notification = notifications.find(n => n.id === id);
//       await notificationApi.deleteNotification(id);
      
//       setNotifications(prev => prev.filter(n => n.id !== id));
//       if (notification && !notification.isRead && !notification.read) {
//         setUnreadCount(prev => Math.max(0, prev - 1));
//       }
      
//       toast.success('Notification deleted');
//     } catch (err) {
//       console.error('Failed to delete notification:', err);
//       toast.error('Failed to delete notification');
//     }
//   };

//   // Clear all notifications
//   const handleClearAll = async () => {
//     if (notifications.length === 0) return;
    
//     const confirmed = window.confirm('Are you sure you want to delete all notifications?');
//     if (!confirmed) return;

//     try {
//       await notificationApi.clearAllNotifications();
      
//       setNotifications([]);
//       setUnreadCount(0);
      
//       toast.success('All notifications cleared');
//     } catch (err) {
//       console.error('Failed to clear notifications:', err);
//       toast.error('Failed to clear notifications');
//     }
//   };

//   // Handle refresh
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchNotifications();
//   };

//   // Filter notifications
//   const filteredNotifications = notifications.filter(n => {
//     const isRead = n.isRead || n.read;
//     if (activeFilter === 'unread') return !isRead;
//     if (activeFilter === 'read') return isRead;
//     return true;
//   });

//   const filterCounts = {
//     all: notifications.length,
//     unread: notifications.filter(n => !n.isRead && !n.read).length,
//     read: notifications.filter(n => n.isRead || n.read).length
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <div className="max-w-4xl mx-auto px-4 py-8">
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//             <NotificationSkeleton />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//             Failed to load notifications
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
//           <button
//             onClick={handleRefresh}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                   <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//                   Notifications
//                   {unreadCount > 0 && (
//                     <span className="ml-2 px-2.5 py-1 text-sm font-semibold bg-blue-600 text-white rounded-full">
//                       {unreadCount} new
//                     </span>
//                   )}
//                 </h1>
                
//                 {/* Connection Status */}
//                 <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
//                   isConnected 
//                     ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
//                     : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
//                 }`}>
//                   {isConnected ? (
//                     <>
//                       <Wifi className="w-3 h-3" />
//                       <span>Live</span>
//                     </>
//                   ) : (
//                     <>
//                       <WifiOff className="w-3 h-3" />
//                       <span>Offline</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <p className="text-gray-600 dark:text-gray-400">
//                 Stay updated with your leave requests, expenses, and more
//               </p>
//             </div>

//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
//                 title="Refresh"
//               >
//                 <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
//               </button>

//               {notifications.length > 0 && (
//                 <>
//                   <button
//                     onClick={handleMarkAllRead}
//                     disabled={unreadCount === 0}
//                     className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     <CheckCheck className="w-4 h-4 inline mr-1" />
//                     Mark all read
//                   </button>

//                   <button
//                     onClick={handleClearAll}
//                     className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4 inline mr-1" />
//                     Clear all
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Filter Tabs */}
//         <div className="mb-6">
//           <FilterTabs
//             activeFilter={activeFilter}
//             onFilterChange={setActiveFilter}
//             counts={filterCounts}
//           />
//         </div>

//         {/* Notifications List */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//           {filteredNotifications.length === 0 ? (
//             <EmptyState filter={activeFilter} />
//           ) : (
//             <AnimatePresence mode="popLayout">
//               <div className="space-y-3">
//                 {filteredNotifications.map((notification) => (
//                   <NotificationCard
//                     key={notification.id}
//                     notification={notification}
//                     onMarkRead={handleMarkAsRead}
//                     onDelete={handleDelete}
//                     isNew={newNotificationIds.has(notification.id)}
//                   />
//                 ))}
//               </div>
//             </AnimatePresence>
//           )}
//         </div>

//         {/* Footer */}
//         {filteredNotifications.length > 0 && (
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Showing {filteredNotifications.length} of {notifications.length} notifications
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notifications;



// Expenses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { expenseApi, cancelExpenseRequest } from '../api/expenseApi';
import { 
  Receipt, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
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
  CreditCard,
  Building,
  Ban,
  RefreshCw,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

// Status Badge Component with Dark Mode
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
      icon: DollarSign 
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

// Loading Spinner Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex justify-center items-center py-12">
    <Loader className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
    <span className="ml-3 text-gray-600 dark:text-gray-400">{text}</span>
  </div>
);

// Empty State Component
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

// Error Alert Component
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

// Modal Component with Dark Mode
const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  
  const sizes = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
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

const Expenses = () => {
  const [activeTab, setActiveTab] = useState('my-expenses');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expandedExpense, setExpandedExpense] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
  });

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

  // Review state
  const [reviewData, setReviewData] = useState({
    status: 'Approved',
    paymentStatus: 'Processing',
    comments: ''
  });

  // Get current user from localStorage
  useEffect(() => {
    const getUserFromStorage = () => {
      try {
        const userStr = localStorage.getItem('user') || localStorage.getItem('auth');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user;
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
      // Return a default user structure if none exists (for development)
      return {
        id: null,
        role: 'employee',
        firstName: 'User',
        lastName: '',
        email: ''
      };
    };
    
    setCurrentUser(getUserFromStorage());
  }, []);

  // Security check: Prevent self-approval
  const canReviewExpense = (expense) => {
    if (!currentUser || !currentUser.id) return false;
    
    // Employee cannot review their own expenses
    if (currentUser.id === expense.employeeId) {
      return false;
    }
    
    // Additional role-based checks
    if (activeTab === 'pending-manager') {
      return currentUser.role === 'manager' || currentUser.role === 'admin';
    }
    
    if (activeTab === 'pending-finance') {
      return currentUser.role === 'finance' || currentUser.role === 'admin';
    }
    
    return false;
  };

  // Check if user has permission to view a tab
  const hasTabPermission = (tab) => {
    if (!currentUser) return false;
    
    switch (tab) {
      case 'my-expenses':
        return true; // Everyone can view their own expenses
      case 'pending-manager':
        return currentUser.role === 'manager' || currentUser.role === 'admin';
      case 'pending-finance':
        return currentUser.role === 'finance' || currentUser.role === 'admin';
      default:
        return false;
    }
  };

  // Load expenses based on active tab
  useEffect(() => {
    if (currentUser && hasTabPermission(activeTab)) {
      loadExpenses();
    }
    
    return () => {
      cancelExpenseRequest('getMyExpenses');
      cancelExpenseRequest('getPendingManagerExpenses');
      cancelExpenseRequest('getPendingFinanceExpenses');
    };
  }, [activeTab, currentUser]);

  const loadExpenses = async () => {
    if (!hasTabPermission(activeTab)) {
      setError('You do not have permission to view this content');
      return;
    }
    
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
        // Filter out self-owned expenses from review tabs for extra security
        let filteredData = response.data || [];
        
        if (activeTab !== 'my-expenses' && currentUser && currentUser.id) {
          filteredData = filteredData.filter(expense => 
            expense.employeeId !== currentUser.id
          );
        }
        
        setExpenses(filteredData);
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
  };

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
        
        // Add the new expense to the list if we're on my-expenses tab
        if (activeTab === 'my-expenses' && response.data) {
          // Format the new expense to match the expected structure
          const newExpense = {
            ...response.data,
            receipt: response.data.receipt || null,
            employee: currentUser ? {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              email: currentUser.email
            } : null
          };
          setExpenses(prev => [newExpense, ...prev]);
        } else {
          loadExpenses(); // Reload all expenses
        }
        
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

  const handleManagerReview = async () => {
    if (!selectedExpense) return;
    
    // Security check
    if (!canReviewExpense(selectedExpense)) {
      toast.error('You cannot review your own expenses');
      setShowReviewModal(false);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await expenseApi.managerReview(selectedExpense.id, {
        status: reviewData.status,
        comments: reviewData.comments
      });
      
      if (response.success) {
        setShowReviewModal(false);
        setSelectedExpense(null);
        
        // Update the expense in the list instead of reloading all
        setExpenses(prev => prev.filter(exp => exp.id !== selectedExpense.id));
        
        toast.success(`Expense ${reviewData.status.toLowerCase()} successfully`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinanceReview = async () => {
    if (!selectedExpense) return;
    
    // Security check
    if (!canReviewExpense(selectedExpense)) {
      toast.error('You cannot review your own expenses');
      setShowReviewModal(false);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await expenseApi.financeReview(selectedExpense.id, {
        status: reviewData.status,
        paymentStatus: reviewData.paymentStatus,
        comments: reviewData.comments
      });
      
      if (response.success) {
        setShowReviewModal(false);
        setSelectedExpense(null);
        
        // Update the expense in the list instead of reloading all
        setExpenses(prev => prev.filter(exp => exp.id !== selectedExpense.id));
        
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

  const filteredExpenses = expenses.filter(expense => {
    if (filters.status !== 'all') {
      if (activeTab === 'my-expenses') {
        return expense.managerApprovalStatus === filters.status;
      } else if (activeTab === 'pending-manager') {
        return expense.managerApprovalStatus === filters.status;
      } else if (activeTab === 'pending-finance') {
        return expense.financeApprovalStatus === filters.status;
      }
    }
    if (filters.category !== 'all' && expense.category !== filters.category) {
      return false;
    }
    return true;
  });

  const categories = [...new Set(expenses.map(e => e.category))];

  // Permission denied view
  if (currentUser && !hasTabPermission(activeTab)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-red-400 dark:text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to view this content.
          </p>
          <button
            onClick={() => setActiveTab('my-expenses')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to My Expenses
          </button>
        </div>
      </div>
    );
  }

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
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'my-expenses'
                  ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Expenses
            </button>
            {hasTabPermission('pending-manager') && (
              <button
                onClick={() => setActiveTab('pending-manager')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'pending-manager'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Pending Manager Review
              </button>
            )}
            {hasTabPermission('pending-finance') && (
              <button
                onClick={() => setActiveTab('pending-finance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === 'pending-finance'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Pending Finance Review
              </button>
            )}
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
            {activeTab === 'pending-finance' && (
              <>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </>
            )}
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
        {error && (
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        )}

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
                const isOwnExpense = currentUser?.id === expense.employeeId;
                
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
                              <StatusBadge
                                status={
                                  activeTab === 'pending-finance' 
                                    ? expense.financeApprovalStatus 
                                    : expense.managerApprovalStatus
                                }
                              />
                              {expense.paymentStatus && (
                                <StatusBadge status={expense.paymentStatus} />
                              )}
                              {isOwnExpense && activeTab !== 'my-expenses' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  Your Expense
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expense.description || 'No description'}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {parseFloat(expense.amount).toFixed(2)}
                                </span>
                                <span className="ml-1">{expense.currency}</span>
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(expense.createdAt).toLocaleDateString()}
                              </span>
                              {expense.employee && (
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {expense.employee.firstName} {expense.employee.lastName}
                                </span>
                              )}
                              {!expense.employee && expense.employeeId && (
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  Employee #{expense.employeeId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {expense.receipt && expense.receipt.cloudinaryUrl && (
                            <a
                              href={expense.receipt.cloudinaryUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Receipt
                            </a>
                          )}
                          {(activeTab === 'pending-manager' && expense.managerApprovalStatus === 'Pending') && (
                            <button
                              onClick={() => {
                                if (!canReviewExpense(expense)) {
                                  toast.error('You cannot review your own expenses');
                                  return;
                                }
                                setSelectedExpense(expense);
                                setReviewData({ ...reviewData, status: 'Approved' });
                                setShowReviewModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isOwnExpense}
                            >
                              Review
                            </button>
                          )}
                          {(activeTab === 'pending-finance' && expense.financeApprovalStatus === 'Pending') && (
                            <button
                              onClick={() => {
                                if (!canReviewExpense(expense)) {
                                  toast.error('You cannot review your own expenses');
                                  return;
                                }
                                setSelectedExpense(expense);
                                setReviewData({ 
                                  status: 'Approved', 
                                  paymentStatus: expense.paymentStatus || 'Processing',
                                  comments: '' 
                                });
                                setShowReviewModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isOwnExpense}
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
                                <StatusBadge status={expense.managerApprovalStatus} />
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Finance Approval</dt>
                              <dd className="mt-1">
                                <StatusBadge status={expense.financeApprovalStatus} />
                              </dd>
                            </div>
                            {expense.paidAt && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid Date</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {new Date(expense.paidAt).toLocaleString()}
                                </dd>
                              </div>
                            )}
                            {expense.updatedAt && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {new Date(expense.updatedAt).toLocaleString()}
                                </dd>
                              </div>
                            )}
                            {expense.employee && (
                              <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee Details</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                  {expense.employee.firstName} {expense.employee.lastName} ({expense.employee.email})
                                </dd>
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
              className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${
                formErrors.category ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
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
                <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${
                  formErrors.amount ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
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
              className={`w-full border rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 ${
                formErrors.currency ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
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
            {/* Security warning if reviewing own expense */}
            {currentUser?.id === selectedExpense.employeeId && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-500 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Warning: You are about to review your own expense. This action is not allowed.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.category}</span>
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {parseFloat(selectedExpense.amount).toFixed(2)} {selectedExpense.currency}
                </span>
                <span className="text-gray-600 dark:text-gray-400">Description:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedExpense.description || '-'}</span>
                {selectedExpense.employee && (
                  <>
                    <span className="text-gray-600 dark:text-gray-400">Employee:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedExpense.employee.firstName} {selectedExpense.employee.lastName}
                    </span>
                  </>
                )}
                <span className="text-gray-600 dark:text-gray-400">Submitted:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedExpense.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {selectedExpense.receipt && selectedExpense.receipt.cloudinaryUrl && (
              <div>
                <a
                  href={selectedExpense.receipt.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Receipt
                </a>
              </div>
            )}

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
                value={reviewData.comments}
                onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                placeholder="Add any comments..."
              />
            </div>

            {error && (
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            )}

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
                disabled={submitting || currentUser?.id === selectedExpense.employeeId}
                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${
                  reviewData.status === 'Approved'
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
    </div>
  );
};

export default Expenses;