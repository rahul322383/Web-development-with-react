
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Receipt, 
  DollarSign,
  Bell,
  LogOut,
  X,
  Menu,
  Home,
  Info,
  Sparkles,
  CreditCard,
  PlayCircle,
  BookOpen,
  Briefcase,
  Shield,
  Scale,
  Lock,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { toast } from 'sonner';
import PendingLeaves from '../../leave/pending-leave';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Navigation for authenticated users based on role
  const getAuthenticatedNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
      { name: 'Pending Leaves', href: '/pending-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
      { name: 'Users', href: '/users', icon: Users, roles: ['Admin', 'Manager'] },
      { name: 'Leave', href: '/leave', icon: Calendar, roles: ['Admin', 'Manager', 'Employee'] },
      { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee'] },
      { name: 'Payroll', href: '/payroll', icon: DollarSign, roles: ['Admin'] },
      { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Employee'] }
    ];

    // Filter navigation based on user's role
    if (user?.primaryRole) {
      return baseNavigation.filter(item => item.roles.includes(user.primaryRole));
    }
    return baseNavigation.filter(item => item.roles.includes('Employee'));
  };

  // Navigation for non-authenticated users
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Features', href: '/features', icon: Sparkles },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Demo', href: '/demo', icon: PlayCircle },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Careers', href: '/careers', icon: Briefcase }
  ];

  // Footer links for non-authenticated users
  const footerLinks = [
    { name: 'Privacy', href: '/privacy', icon: Shield },
    { name: 'Terms', href: '/terms', icon: Scale },
    { name: 'Security', href: '/security', icon: Lock },
    { name: 'Help', href: '/help', icon: HelpCircle }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
      if (onClose) onClose(); // Close sidebar on mobile after logout
    } catch (error) {
      toast.error('Logout failed, but you have been signed out locally');
      navigate('/', { replace: true });
    }
  };

  const navigation = isAuthenticated ? getAuthenticatedNavigation() : publicNavigation;

  // Get user display name and initials
  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.name) return user.name;
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserRole = () => {
    if (user?.primaryRole) return user.primaryRole;
    if (user?.role) return user.role;
    return 'Employee';
  };

  const getUserEmail = () => {
    if (user?.email) return user.email;
    return '';
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'manager':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
    }
  };

  return (
    <>
      {/* Mobile overlay - only shows when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar - always visible on desktop, controlled on mobile */}
      <aside
        className={`
          fixed left-0 top-0 z-30 h-full w-64 border-r border-slate-200 bg-white
          transition-transform duration-300 ease-in-out shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo and close button */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <span className="font-bold text-slate-800">HR Management</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              data-testid="sidebar-close-button"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) {
                      onClose(); // Close sidebar on mobile after navigation
                    }
                  }}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={`
                    group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500'
                  }`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1 h-6 bg-indigo-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section for authenticated users */}
          {isAuthenticated ? (
            <div className="border-t border-slate-200 p-4 bg-gradient-to-b from-white to-slate-50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate" data-testid="sidebar-user-name">
                    {getUserDisplayName()}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(getUserRole())}`}>
                      {getUserRole()}
                    </span>
                  </div>
                  {getUserEmail() && (
                    <p className="text-xs text-slate-500 truncate mt-1" data-testid="sidebar-user-email">
                      {getUserEmail()}
                    </p>
                  )}
                </div>
              </div>
              
              {/* User stats or additional info */}
              <div className="mb-3 p-2 bg-slate-100 rounded-lg">
                <div className="text-xs text-slate-600">
                  <span className="font-medium">ID:</span> {user?.id || 'N/A'}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                data-testid="sidebar-logout-button"
                className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group border border-red-200"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Footer links for non-authenticated users */
            <div className="border-t border-slate-200 p-4 bg-slate-50">
              {/* Legal & Help Links */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) {
                        onClose();
                      }
                    }}
                    className="flex items-center space-x-1 text-xs text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <link.icon className="h-3 w-3" />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors group"
                >
                  <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
                >
                  <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Sign Up</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};