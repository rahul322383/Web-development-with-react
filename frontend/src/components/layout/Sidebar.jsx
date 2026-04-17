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
  UserPlus,
  Settings,
  User,
  ClipboardList,
  BarChart,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

import { toast } from 'sonner';
export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Update user data when auth context changes
  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  // Enhanced navigation based on role with metadata support
  const getAuthenticatedNavigation = () => {
    const role = user?.primaryRole || meta?.role || 'Employee';
    const department = meta?.department;
    
    const baseNavigation = [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: LayoutDashboard, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
        showForAll: true 
      },
      {
        name: 'Department Dashboard',
        href: '/department-dashboard',
        icon: BuildingOfficeIcon,
        roles: ['Admin', 'HR', 'Manager', 'Finance']   
      },
      { 
        name: 'Profile', 
        href: '/profile', 
        icon: User, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
        showForAll: true 
      },
      { 
        name: 'Leave Management', 
        href: '/leave', 
        icon: Calendar, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] 
      },
      { 
        name: 'Pending Approvals', 
        href: '/pending-leave', 
        icon: ClipboardList, 
        roles: ['Admin', 'Manager', 'HR', 'Finance'],
        badge: true
      },
      { 
        name: 'Expenses', 
        href: '/expenses', 
        icon: Receipt, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] 
      },
      {
        name: "Audit Logs",
        href: "/audit-logs",
        icon: BarChart,
        roles: ["Admin", "HR", "Manager", "Finance"]
      },

      { 
        name: 'Users Management', 
        href: '/users', 
        icon: Users, 
        roles: ['Admin', 'Manager', 'HR', 'Finance'] 
      },
      { 
        name: 'Payroll', 
        href: '/payroll', 
        icon: DollarSign, 
        roles: ['Admin' ,'Manager', 'HR', 'Finance'] 
      },
      { 
        name: 'Reports & Analytics', 
        href: '/reports', 
        icon: BarChart, 
        roles: ['Admin', 'Manager', 'HR', 'Finance'] 
      },
      { 
        name: 'Notifications', 
        href: '/notifications', 
        icon: Bell, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] 
      },
      { 
        name: 'Settings', 
        href: '/settings', 
        icon: Settings, 
        roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] 
      }
    ];

    // Department-specific navigation
    if (department === 'Marketing') {
      baseNavigation.push({
        name: 'Marketing Tools',
        href: '/marketing',
        icon: Briefcase,
        roles: ['Manager', 'Employee']
      });
    }

    if (department === 'HR') {
      baseNavigation.push({
        name: 'Recruitment',
        href: '/recruitment',
        icon: Briefcase,
        roles: ['Admin', 'Manager', 'HR']
      });
    }

    // Filter navigation based on user's role
    return baseNavigation.filter(item => 
      item.showForAll || item.roles.includes(role)
    );
  };

  // Enhanced public navigation
  const publicNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Features', href: '/features', icon: Sparkles },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Demo', href: '/demo', icon: PlayCircle },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Careers', href: '/careers', icon: Briefcase },
    { name: 'Contact', href: '/contact', icon: MessageSquare },
  ];

  // Footer links with better organization
  const footerLinks = [
    { 
      section: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy', icon: Shield },
        { name: 'Terms', href: '/terms', icon: Scale },
        { name: 'Security', href: '/security', icon: Lock },
      ]
    },
    {
      section: 'Support',
      links: [
        { name: 'Help Center', href: '/help', icon: HelpCircle },
        { name: 'Documentation', href: '/docs', icon: BookOpen },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
      if (onClose) onClose();
    } catch (error) {
      toast.error('Logout failed, but you have been signed out locally');
      navigate('/', { replace: true });
    }
  };

  const navigation = isAuthenticated ? getAuthenticatedNavigation() : publicNavigation;

  // Get user display information with metadata
  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.name) return user.name;
    if (meta?.name) return meta.name;
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'User') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserRole = () => {
    return user?.primaryRole || meta?.role || 'Employee';
  };

  const getUserEmail = () => {
    return user?.email || meta?.email || '';
  };

  const getDepartment = () => {
    return meta?.department || user?.department || '';
  };

  // Enhanced role badge colors
  const getRoleBadgeColor = (role) => {
    const roleColors = {
      'Admin': 'from-red-500 to-pink-500',
      'Manager': 'from-blue-500 to-cyan-500',
      'HR': 'from-purple-500 to-indigo-500',
      'Employee': 'from-green-500 to-emerald-500'
    };
    return roleColors[role] || 'from-gray-500 to-slate-500';
  };

  // Theme-aware class names
  const getThemeClasses = () => {
    const isDark = theme === 'dark';
    return {
      sidebar: isDark 
        ? 'bg-gray-900 border-gray-800 text-white' 
        : 'bg-white border-slate-200 text-slate-800',
      navItem: (isActive) => isDark
        ? `${isActive ? 'bg-gray-800 text-indigo-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
        : `${isActive ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`,
      userSection: isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-gradient-to-b from-white to-slate-50 border-slate-200',
      footer: isDark
        ? 'bg-gray-900 border-gray-800'
        : 'bg-slate-50 border-slate-200'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar - Fixed positioning to start below header */}
      <aside
        className={`
          fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r
          transition-all duration-300 ease-in-out shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${themeClasses.sidebar}
        `}
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-20 z-40 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all ${
              theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) {
                        onClose();
                      }
                    }}
                    data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`
                      group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
                      transition-all duration-200 relative
                      ${isCollapsed ? 'justify-center space-x-0' : 'space-x-3'}
                      ${themeClasses.navItem(isActive)}
                    `}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive && theme === 'dark' ? 'text-indigo-400' : ''
                    }`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                            3
                          </span>
                        )}
                        {isActive && (
                          <div className={`absolute right-0 w-1 h-6 rounded-full ${
                            theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
                          }`}></div>
                        )}
                      </>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* User section or Footer */}
          {isAuthenticated ? (
            <div className={`border-t p-4 ${themeClasses.userSection}`}>
              {/* User Profile */}
              <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500 ring-offset-transparent">
                    <span className="text-white font-semibold text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  {meta?.isActive && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} 
                       data-testid="sidebar-user-name">
                      {getUserDisplayName()}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleBadgeColor(getUserRole())}`}>
                        {getUserRole()}
                      </span>
                      {getDepartment() && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          theme === 'dark' 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {getDepartment()}
                        </span>
                      )}
                    </div>
                    {getUserEmail() && (
                      <p className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
                         data-testid="sidebar-user-email">
                        {getUserEmail()}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* User metadata - Only show when not collapsed */}
              {!isCollapsed && (user?.id || meta) && (
                <div className={`mb-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'}`}>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>ID</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                        {user?.id || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>Status</span>
                      <span className={`${meta?.isActive ? 'text-green-500' : 'text-red-500'}`}>
                        {meta?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                data-testid="sidebar-logout-button"
                className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                  isCollapsed ? 'px-2' : ''
                } ${
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-red-900/20 border border-red-900/30 hover:border-red-500/30'
                    : 'text-red-600 hover:bg-red-50 border border-red-200'
                }`}
                title={isCollapsed ? 'Logout' : ''}
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          ) : (
            /* Public footer with better organization */
            <div className={`border-t p-4 ${themeClasses.footer}`}>
              {!isCollapsed ? (
                <>
                  {/* Legal & Help Links */}
                  <div className="space-y-4 mb-4">
                    {footerLinks.map((section) => (
                      <div key={section.section}>
                        <h4 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
                        }`}>
                          {section.section}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {section.links.map((link) => (
                            <Link
                              key={link.name}
                              to={link.href}
                              onClick={() => {
                                if (window.innerWidth < 1024 && onClose) {
                                  onClose();
                                }
                              }}
                              className={`flex items-center space-x-1.5 text-xs transition-colors ${
                                theme === 'dark'
                                  ? 'text-gray-400 hover:text-white'
                                  : 'text-slate-600 hover:text-indigo-600'
                              }`}
                            >
                              <link.icon className="h-3 w-3" />
                              <span>{link.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
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
                      className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${
                        theme === 'dark'
                          ? 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
                          : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                      }`}
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
                      className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
                    >
                      <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </>
              ) : (
                /* Collapsed footer - just icons */
                <div className="flex flex-col items-center space-y-3">
                  <Link
                    to="/login"
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) {
                        onClose();
                      }
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      theme === 'dark'
                        ? 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
                        : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title="Login"
                  >
                    <LogIn className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) {
                        onClose();
                      }
                    }}
                    className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all"
                    title="Sign Up"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};