// components/notifications/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  Clock,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Inbox,
  Wifi,
  WifiOff,
  Calendar,
  DollarSign,
  CreditCard,
  UserPlus,
  FileText,
  Briefcase,
  MessageSquare,
  Hash,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import notificationApi from '../api/notificationApi';
import { formatDistanceToNow, format, parse } from 'date-fns';

// ========================
// METADATA HELPER
// ========================
const extractMetadata = (notification) => {
  const { metadata, type } = notification;
  if (!metadata) return null;

  // Payroll notifications
  if (type === 'PAYROLL') {
    const { month, year, netSalary } = metadata;
    const monthName = month ? format(parse(month.toString(), 'M', new Date()), 'MMMM') : null;
    return {
      icon: CreditCard,
      label: 'Payroll',
      fields: [
        netSalary !== null && netSalary !== undefined
          ? { key: 'Net Salary', value: `₹${parseFloat(netSalary).toLocaleString()}` }
          : null,
        month && year
          ? { key: 'Period', value: `${monthName} ${year}` }
          : month
            ? { key: 'Month', value: monthName }
            : year
              ? { key: 'Year', value: year.toString() }
              : null,
      ].filter(Boolean),
    };
  }

  // Expense submission (system notification)
  if (
    type === 'SYSTEM' &&
    metadata.type === 'EXPENSE_SUBMISSION'
  ) {
    // Extract amount from the message if present
    const amountMatch = notification.message?.match(/INR\s*(\d+)/i);
    const amount = amountMatch ? `₹${amountMatch[1]}` : 'N/A';
    return {
      icon: DollarSign,
      label: 'Expense',
      fields: [
        { key: 'Expense ID', value: metadata.expenseId ? `#${metadata.expenseId}` : 'N/A' },
        { key: 'Amount', value: amount },
      ],
    };
  }

  // Generic fallback: show raw metadata keys
  const keys = Object.keys(metadata);
  if (keys.length > 0) {
    return {
      icon: Info,
      label: 'Details',
      fields: keys.map((key) => ({
        key: key.charAt(0).toUpperCase() + key.slice(1),
        value: metadata[key]?.toString() || 'N/A',
      })),
    };
  }

  return null;
};

// ========================
// NOTIFICATION CARD COMPONENT
// ========================
const NotificationCard = ({ notification, onMarkRead, onDelete, isNew }) => {
  const getTypeStyles = (type) => {
    const styles = {
      leave: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Calendar,
        iconColor: 'text-blue-600 dark:text-blue-400',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      },
      leave_approved: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      },
      leave_rejected: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      },
      expense: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: DollarSign,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        hover: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
      },
      expense_approved: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      },
      expense_rejected: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      },
      payroll: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: CreditCard,
        iconColor: 'text-purple-600 dark:text-purple-400',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      },
      system: {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        icon: Info,
        iconColor: 'text-gray-600 dark:text-gray-400',
        hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30',
      },
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      },
      warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 dark:text-amber-400',
        hover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
      },
      user_joined: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        border: 'border-cyan-200 dark:border-cyan-800',
        icon: UserPlus,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/30',
      },
      message: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: MessageSquare,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
      },
    };
    return styles[type] || styles.system;
  };

  const styles = getTypeStyles(notification.type);
  const IconComponent = styles.icon;
  const metadataInfo = extractMetadata(notification);

  const formattedTime = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'Just now';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${notification.isRead || notification.read ? 'opacity-75' : 'shadow-md'}
        ${isNew ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2' : ''}
        ${styles.bg} ${styles.border} ${styles.hover}
      `}
      onClick={() => !notification.isRead && !notification.read && onMarkRead(notification.id)}
    >
      {isNew && (
        <div className="absolute -top-2 -right-2 z-10">
          <span className="flex items-center px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full shadow-lg">
            NEW
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {notification.title || 'Notification'}
            </h4>
            {!notification.isRead && !notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>

          {/* Metadata details */}
          {metadataInfo && metadataInfo.fields.length > 0 && (
            <div className="mb-2 p-2 bg-white/50 dark:bg-black/10 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                <metadataInfo.icon className="w-3.5 h-3.5" />
                {metadataInfo.label}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {metadataInfo.fields.map((field, idx) => (
                  <div key={idx} className="flex gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {field.key}:
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
              aria-label="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================
// FILTER TABS COMPONENT
// ========================
const FilterTabs = ({ activeFilter, onFilterChange, counts }) => {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'unread', label: 'Unread', count: counts.unread },
    { id: 'read', label: 'Read', count: counts.read },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`
            flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${activeFilter === tab.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          {tab.label}
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

// ========================
// EMPTY STATE COMPONENT
// ========================
const EmptyState = ({ filter }) => {
  const messages = {
    all: {
      title: 'No notifications yet',
      description: 'When you receive notifications, they will appear here',
      icon: Inbox,
    },
    unread: {
      title: 'No unread notifications',
      description: "You're all caught up!",
      icon: CheckCheck,
    },
    read: {
      title: 'No read notifications',
      description: 'Notifications you mark as read will appear here',
      icon: CheckCircle,
    },
  };

  const { title, description, icon: Icon } = messages[filter] || messages.all;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
    </motion.div>
  );
};

// ========================
// LOADING SKELETON
// ========================
const NotificationSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse"
      >
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ========================
// MAIN NOTIFICATIONS COMPONENT
// ========================
export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const [newNotificationIds, setNewNotificationIds] = useState(new Set());
  const [isConnected, setIsConnected] = useState(true);

  // Update browser tab title with unread count
  useEffect(() => {
    document.title = unreadCount > 0
      ? `(${unreadCount}) Notifications - HR Portal`
      : 'Notifications - HR Portal';
  }, [unreadCount]);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);

      const [notificationsData, unreadData] = await Promise.all([
        notificationApi.getNotifications(50, 0),
        notificationApi.getUnreadCount(),
      ]);

      const notificationList = Array.isArray(notificationsData)
        ? notificationsData
        : notificationsData?.notifications || notificationsData?.data || [];

      setNotifications(notificationList);
      setUnreadCount(unreadData?.count || unreadData?.unread || 0);
    } catch (err) {
      
      setError(err.message || 'Failed to fetch notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (err) {
    
      toast.error('Failed to mark as read');
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
     
    }
  };

  // Delete single notification
  const handleDelete = async (id) => {
    try {
      const notification = notifications.find((n) => n.id === id);
      await notificationApi.deleteNotification(id);

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.isRead && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (err) {
     
      toast.error('Failed to delete notification');
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    if (notifications.length === 0) return;

    
    try {
      await notificationApi.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
     
      toast.error('Failed to clear notifications');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const isRead = n.isRead || n.read;
    if (activeFilter === 'unread') return !isRead;
    if (activeFilter === 'read') return isRead;
    return true;
  });

  const filterCounts = {
    all: notifications.length,
    unread: notifications.filter((n) => !n.isRead && !n.read).length,
    read: notifications.filter((n) => n.isRead || n.read).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <NotificationSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  Notifications
                  {/* <span className="ml-2 px-2.5 py-1 text-sm font-semibold bg-blue-600 text-white rounded-full">
                    {unreadCount} unread
                  </span> */}
                </h1>

                {/* Connection Status */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isConnected
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                >
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated with your leave requests, expenses, and more
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''
                    }`}
                />
              </button>

              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCheck className="w-4 h-4 inline mr-1" />
                    Mark all read
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bell icon with unread count */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {unreadCount >= 0 && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] text-center leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={filterCounts} />
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {filteredNotifications.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isNew={newNotificationIds.has(notification.id)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {/* {filteredNotifications.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Notifications;