import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuClick, theme, onThemeToggle }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Real notifications data (can be replaced with actual data from API)
  const notifications = [
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Pending',
      message: 'John Doe requested 3 days leave',
      time: '5 min ago',
      read: false,
      icon: Clock,
      color: 'text-amber-500'
    },
    {
      id: 2,
      type: 'expense',
      title: 'Expense Report Approved',
      message: 'Your Q2 travel expenses were approved',
      time: '1 hour ago',
      read: false,
      icon: CheckCircle,
      color: 'text-emerald-500'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Payroll Processing',
      message: 'Monthly payroll will be processed tomorrow',
      time: '3 hours ago',
      read: true,
      icon: AlertCircle,
      color: 'text-blue-500'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const markAllAsRead = () => {
   
  };

  const handleNotificationClick = (notification) => {
    // Navigate based on notification type
    switch(notification.type) {
      case 'leave':
        navigate('/leave');
        break;
      case 'expense':
        navigate('/expenses');
        break;
      case 'alert':
        navigate('/notifications');
        break;
      default:
        navigate('/notifications');
    }
  };

  return (
    <header 
      className="fixed top-0 right-0 left-0 lg:left-64 z-20 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all"
      data-testid="navbar"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
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
          
          {/* Desktop Search */}
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

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
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

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
                data-testid="navbar-notifications-button"
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
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className={`mt-1 ${notification.color}`}>
                        <notification.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2" />
                      )}
                    </DropdownMenuItem>
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

          {/* User Profile */}
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => navigate('/profile')}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
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

      {/* Mobile Search Bar */}
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