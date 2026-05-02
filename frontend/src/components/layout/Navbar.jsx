
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Search, Bell, Sun, Moon, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../api/notificationApi';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ROUTES = {
  leave: '/leave',
  leave_approved: '/leave',
  leave_rejected: '/leave',
  expense: '/expenses',
  expense_approved: '/expenses',
  expense_rejected: '/expenses',
  payroll: '/payroll',
  system: '/notifications',
  success: '/notifications',
  warning: '/notifications',
  error: '/notifications',
  user_joined: '/users',
  message: '/notifications',
};

const NOTIFICATION_STYLES = {
  leave: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400' },
  leave_approved: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400' },
  leave_rejected: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
  expense: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400' },
  expense_approved: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400' },
  expense_rejected: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
  payroll: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400' },
  system: { bg: 'bg-gray-50 dark:bg-gray-900/20', icon: 'text-gray-600 dark:text-gray-400' },
  success: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400' },
  error: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
  user_joined: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'text-cyan-600 dark:text-cyan-400' },
  message: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400' },
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
};

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const navigate = useNavigate();
  const isUnread = !(notification.isRead || notification.read);
  const styles = NOTIFICATION_STYLES[notification.type] || NOTIFICATION_STYLES.system;
  const formattedTime = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'Just now';

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id);
    navigate(NOTIFICATION_ROUTES[notification.type] || '/notifications');
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isUnread ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
        }`}
    >
      <div className={`mt-1 ${styles.icon}`}>
        {React.createElement(notification.icon || Bell, { className: 'h-4 w-4' })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400 dark:text-slate-500">{formattedTime}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      {isUnread && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />}
    </DropdownMenuItem>
  );
};

export const Navbar = ({ onMenuClick, theme, onThemeToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const [notifData, unreadData] = await Promise.all([
        notificationApi.getNotifications(10, 0),
        notificationApi.getUnreadCount(),
      ]);
      const list = Array.isArray(notifData)
        ? notifData
        : notifData?.notifications || notifData?.data || [];
      setNotifications(list);
      setUnreadCount(unreadData?.count || unreadData?.unread || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (dropdownOpen && notifications.length === 0 && !loadingNotifications) {
      fetchNotifications();
    }
  }, [dropdownOpen, fetchNotifications, notifications.length, loadingNotifications]);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notif && !(notif.isRead || notif.read)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all"
      data-testid="navbar"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            data-testid="navbar-menu-button"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </Button>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search employees, leave, expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                data-testid="navbar-search-input"
              />
            </form>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
            data-testid="navbar-theme-toggle"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            ) : (
              <Sun className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            )}
          </Button>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
                data-testid="navbar-notifications-button"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-slate-950">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 sm:w-96 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No notifications</p>
                  </div>
                )}
              </div>

              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />

              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  onClick={() => navigate('/notifications')}
                >
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => navigate('/profile')}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials(user?.name)}
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role || 'Employee'}
              </p>
            </div>
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                autoFocus
              />
            </form>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};