import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Receipt, Bell, LogOut, Home,
  Info, Sparkles, CreditCard, PlayCircle, BookOpen, Briefcase,
  Shield, Scale, Lock, HelpCircle, LogIn, UserPlus, Settings,
  User, ClipboardList, BarChart, MessageSquare, ChevronLeft,
  ChevronRight, Clock, Building2, FileText, X, IndianRupee, BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';

// ========================
// Constants
// ========================
const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  HR: 'HR',
  EMPLOYEE: 'Employee',
  FINANCE: 'Finance',
};

const BASE_NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE], showForAll: true },
  { name: 'Department Dashboard', href: '/department-dashboard', icon: Building2, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE] },
  { name: 'Profile', href: '/profile', icon: User, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE], showForAll: true },
  { name: 'Leave Management', href: '/leave', icon: Calendar, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE] },
  { name: 'Attendance', href: '/attendance', icon: Calendar, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE] },
  { name: 'Shift Management', href: '/shift-management', icon: Clock, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE, ROLES.EMPLOYEE] },
  { name: 'Pending Approvals', href: '/pending-leave', icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE], badge: { type: 'pendingLeaves' } },
  { name: 'Approved Leaves', href: '/approved-leave', icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE], badge: { type: 'count', key: 'approvedLeaves' } },
  { name: 'Year End', href: '/year-end', icon: BarChart3, roles: [ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.MANAGER] },
  { name: 'Analytics', href: '/analytics', icon: Receipt, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE] },
  { name: 'Company', href: '/company', icon: Building2, roles: [ROLES.ADMIN, ROLES.HR] },
  { name: 'Expenses', href: '/expenses', icon: Receipt, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE] },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText, roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE] },
  { name: 'Users Management', href: '/users', icon: Users, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE] },
  { name: 'Payroll', href: '/payroll', icon: IndianRupee, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE] },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE, ROLES.HR, ROLES.FINANCE] },
];

const PUBLIC_NAVIGATION = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Features', href: '/features', icon: Sparkles },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
  { name: 'Demo', href: '/demo', icon: PlayCircle },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: MessageSquare },
];

const FOOTER_LINKS = [
  {
    section: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy', icon: Shield },
      { name: 'Terms', href: '/terms', icon: Scale },
      { name: 'Security', href: '/security', icon: Lock },
    ],
  },
  {
    section: 'Support',
    links: [
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'Documentation', href: '/docs', icon: BookOpen },
    ],
  },
];

const ROLE_BADGE_COLORS = {
  [ROLES.ADMIN]: 'from-red-500 to-pink-500',
  [ROLES.MANAGER]: 'from-blue-500 to-cyan-500',
  [ROLES.HR]: 'from-purple-500 to-indigo-500',
  [ROLES.EMPLOYEE]: 'from-green-500 to-emerald-500',
  [ROLES.FINANCE]: 'from-amber-500 to-orange-500',
};

// Ordered by priority — first match wins for display
const ROLE_PRIORITY = [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE, ROLES.EMPLOYEE];

const DEPARTMENT_EXTRA_NAV = {
  Marketing: [{ name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: [ROLES.MANAGER, ROLES.EMPLOYEE] }],
  HR: [{ name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR] }],
};

const SIDEBAR_WIDTH = {
  collapsed: 'w-20',
  expanded: 'w-72',
  mobile: 'w-[85%] max-w-xs',
};

const SIDEBAR_THEME = {
  dark: 'bg-gray-900/80 backdrop-blur-2xl border-gray-800/80 shadow-2xl',
  light: 'bg-white/70 backdrop-blur-2xl border-slate-200/60 shadow-2xl',
};

// ========================
// Helpers
// ========================
function buildAuthNavigation(userRoles, department) {
  const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
  return [...BASE_NAVIGATION, ...extras].filter(
    item => item.showForAll || item.roles?.some(r => userRoles.includes(r))
  );
}

function getBadgeCount(item, pendingCount, meta) {
  if (!item.badge) return 0;
  const { type, key } = item.badge;
  if (type === 'pendingLeaves') return pendingCount;
  if (type === 'count') return meta?.[key] ?? 0;
  return 0;
}

// Exact match for '/', prefix match for everything else
function isRouteActive(currentPath, href) {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function deriveUserDisplayData(user, meta) {
  const rawName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.fullName ?? meta?.name ?? 'User';

  const initials =
    rawName === 'User'
      ? 'U'
      : rawName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const roles = user?.roles?.length
    ? user.roles
    : [user?.primaryRole ?? meta?.role ?? ROLES.EMPLOYEE];

  const primaryRole = ROLE_PRIORITY.find(r => roles.includes(r)) ?? roles[0] ?? ROLES.EMPLOYEE;

  const isActive =
    typeof user?.isActive === 'boolean'
      ? user.isActive
      : typeof meta?.isActive === 'boolean'
        ? meta.isActive
        : true;

  return {
    displayName: rawName,
    initials,
    roles,
    primaryRole,
    email: user?.email ?? meta?.email ?? '',
    department: user?.department ?? meta?.department ?? '',
    isActive,
    roleBadgeColor: ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500',
  };
}

// ========================
// Sub-components
// ========================
const NavItem = React.memo(({ item, isCollapsed, pendingCount, meta, isDark, onNavClick, locationPath }) => {
  const active = isRouteActive(locationPath, item.href);
  const badgeCount = getBadgeCount(item, pendingCount, meta);

  const activeClasses = isDark
    ? 'bg-indigo-900/60 backdrop-blur-sm text-indigo-300 border-l-4 border-indigo-500 shadow-lg'
    : 'bg-gradient-to-r from-indigo-50/90 to-purple-50/90 text-indigo-700 border-l-4 border-indigo-600 shadow-md';

  const inactiveClasses = isDark
    ? 'text-gray-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900 border-l-4 border-transparent';

  return (
    <Link
      to={item.href}
      onClick={onNavClick}
      aria-current={active ? 'page' : undefined}
      title={isCollapsed ? item.name : undefined}
      className={`
        group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium
        transition-all duration-300 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1
        ${isCollapsed ? 'justify-center' : 'space-x-3'}
        ${active ? activeClasses : inactiveClasses}
      `}
    >
      <item.icon
        className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''
          }`}
      />

      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          {badgeCount > 0 && (
            <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </>
      )}

      {isCollapsed && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </Link>
  );
});
NavItem.displayName = 'NavItem';

const UserSection = React.memo(({ userDisplayData, isCollapsed, isDark, user, meta, onLogout }) => (
  <div className="border-t border-white/20 dark:border-gray-700 p-4 backdrop-blur-md bg-white/60 dark:bg-gray-900/70">
    {/* Avatar + info row */}
    <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
      <div className="relative flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500/40 ring-offset-transparent">
          <span className="text-white font-semibold text-sm">{userDisplayData.initials}</span>
        </div>
        {userDisplayData.isActive && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 shadow" />
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{userDisplayData.displayName}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${userDisplayData.roleBadgeColor}`}>
              {userDisplayData.primaryRole}
            </span>
            {userDisplayData.department && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200/80 dark:bg-gray-700/70">
                {userDisplayData.department}
              </span>
            )}
          </div>
          {userDisplayData.email && (
            <p className="text-xs truncate mt-1 text-slate-500 dark:text-gray-400">{userDisplayData.email}</p>
          )}
        </div>
      )}
    </div>

    {/* Meta info strip */}
    {!isCollapsed && (user?.id || meta) && (
      <div className="mb-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm text-xs">
        <div className="flex justify-between">
          <span><span className="font-medium">ID: </span>{user?.id ?? 'N/A'}</span>
          <span>
            <span className="font-medium">Status: </span>
            <span className={userDisplayData.isActive ? 'text-green-500' : 'text-red-500'}>
              {userDisplayData.isActive ? 'Active' : 'Inactive'}
            </span>
          </span>
        </div>
      </div>
    )}

    <button
      onClick={onLogout}
      className="w-full flex items-center justify-center space-x-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 border border-red-200/60 dark:border-red-800/50 transition-all duration-200"
    >
      <LogOut className="h-4 w-4" />
      {!isCollapsed && <span>Logout</span>}
    </button>
  </div>
));
UserSection.displayName = 'UserSection';

const PublicFooter = React.memo(({ isCollapsed, onNavClick }) => {
  if (isCollapsed) {
    return (
      <div className="border-t border-white/20 dark:border-gray-700 p-4 backdrop-blur-md bg-white/60 dark:bg-gray-900/70">
        <div className="flex flex-col items-center space-y-3">
          <Link to="/login" title="Login" className="p-2 rounded-xl border border-indigo-500/70 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
            <LogIn className="h-4 w-4" />
          </Link>
          <Link to="/register" title="Sign Up" className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow">
            <UserPlus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/20 dark:border-gray-700 p-4 backdrop-blur-md bg-white/60 dark:bg-gray-900/70">
      <div className="space-y-4 mb-4">
        {FOOTER_LINKS.map(section => (
          <div key={section.section}>
            <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider">{section.section}</h4>
            <div className="grid grid-cols-2 gap-2">
              {section.links.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={onNavClick}
                  className="flex items-center space-x-1.5 text-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <link.icon className="h-3 w-3" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Link
          to="/login"
          onClick={onNavClick}
          className="w-full flex items-center justify-center space-x-2 rounded-xl px-3 py-2.5 text-sm border-2 border-indigo-500/70 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
        <Link
          to="/register"
          onClick={onNavClick}
          className="w-full flex items-center justify-center space-x-2 rounded-xl px-3 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          <span>Sign Up</span>
        </Link>
      </div>
    </div>
  );
});
PublicFooter.displayName = 'PublicFooter';

// ========================
// Main Sidebar Component
// ========================
export const Sidebar = ({ isOpen, onClose, pendingCount = 0, onCollapseChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  // Persisted collapse state
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) onClose?.();
  }, [onClose]);

  // Derived user display data — recomputed only when user/meta change
  const userDisplayData = useMemo(() => deriveUserDisplayData(user, meta), [user, meta]);

  // Navigation — stable reference while loading, switches once auth resolves
  const prevNavRef = useRef(PUBLIC_NAVIGATION);
  const navigation = useMemo(() => {
    if (isLoading || isAuthenticated === null) return prevNavRef.current;
    const nav = isAuthenticated
      ? buildAuthNavigation(userDisplayData.roles, userDisplayData.department)
      : PUBLIC_NAVIGATION;
    prevNavRef.current = nav;
    return nav;
  }, [isAuthenticated, isLoading, userDisplayData.roles, userDisplayData.department]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed, but you have been signed out locally');
    } finally {
      navigate('/', { replace: true });
      onClose?.();
    }
  }, [logout, navigate, onClose]);

  const sidebarThemeClass = isDark ? SIDEBAR_THEME.dark : SIDEBAR_THEME.light;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? SIDEBAR_WIDTH.collapsed : `${SIDEBAR_WIDTH.mobile} lg:${SIDEBAR_WIDTH.expanded}`}
          ${sidebarThemeClass}
          overflow-hidden
        `}
      >
        <div className="flex h-full flex-col">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute top-4 right-3 z-50 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all hidden lg:flex items-center justify-center backdrop-blur-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 lg:hidden backdrop-blur-sm z-50"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          >
            {isLoading && prevNavRef.current === PUBLIC_NAVIGATION ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
              </div>
            ) : (
              navigation.map(item => (
                <NavItem
                  key={item.href}
                  item={item}
                  isCollapsed={isCollapsed}
                  pendingCount={pendingCount}
                  meta={meta}
                  isDark={isDark}
                  onNavClick={handleNavClick}
                  locationPath={location.pathname}
                />
              ))
            )}
          </nav>

          {/* Footer: authenticated or public */}
          {isAuthenticated ? (
            <UserSection
              userDisplayData={userDisplayData}
              isCollapsed={isCollapsed}
              isDark={isDark}
              user={user}
              meta={meta}
              onLogout={handleLogout}
            />
          ) : (
            <PublicFooter
              isCollapsed={isCollapsed}
              onNavClick={handleNavClick}
            />
          )}
        </div>
      </aside>
    </>
  );
};