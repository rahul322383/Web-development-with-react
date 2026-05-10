
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, LogIn, UserPlus, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';
import {
  PUBLIC_NAVIGATION,
  AUTH_NAVIGATION,
  FOOTER_LINKS,
  ROLES,
  filterNavigation,
} from '../../config/navigation';

// ─── Role badge colors (unchanged) ────────────────────────────────────────────
const ROLE_BADGE_COLORS = {
  [ROLES.ADMIN]: 'from-red-500 to-pink-500',
  [ROLES.MANAGER]: 'from-blue-500 to-cyan-500',
  [ROLES.HR]: 'from-purple-500 to-indigo-500',
  [ROLES.EMPLOYEE]: 'from-green-500 to-emerald-500',
  [ROLES.FINANCE]: 'from-amber-500 to-orange-500',
};

const ROLE_PRIORITY = [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE, ROLES.EMPLOYEE];

// ─── Helper functions ─────────────────────────────────────────────────────────
function getBadgeCount(item, pendingCount, meta) {
  if (!item.badge) return 0;
  const { type, key } = item.badge;
  if (type === 'pendingLeaves') return pendingCount;
  if (type === 'count') return meta?.[key] ?? 0;
  return 0;
}

function isRouteActive(currentPath, href) {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href + '/');
}

// ─── Sub‑components (unchanged) ───────────────────────────────────────────────
const NavItem = ({ item, isCollapsed, pendingCount, meta, theme, onNavClick, locationPath }) => {
  const active = isRouteActive(locationPath, item.href);
  const badgeCount = getBadgeCount(item, pendingCount, meta);
  const isDark = theme === 'dark';

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
};

const UserSection = ({ userDisplayData, isCollapsed, theme, user, meta, onLogout }) => {
  // (identical to original)
  return (
    <div className="border-t border-white/20 dark:border-gray-700 p-4 backdrop-blur-md bg-white/60 dark:bg-gray-900/70">
      <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
        <div className="relative flex-shrink-0 group">
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
      {!isCollapsed && (user?.id || meta) && (
        <div className="mb-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="font-medium">ID</span> {user?.id ?? 'N/A'}</div>
            <div>
              <span className="font-medium">Status</span>{' '}
              <span className={userDisplayData.isActive ? 'text-green-500' : 'text-red-500'}>
                {userDisplayData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
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
  );
};

const PublicFooter = ({ isCollapsed, theme, onNavClick }) => {
  // (identical to original)
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
};

// ─── Main Sidebar Component ───────────────────────────────────────────────────
export const Sidebar = ({ isOpen, onClose, pendingCount = 0, onCollapseChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  // Collapse state (desktop only, persisted)
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  // Track mobile
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const effectiveCollapsed = !isMobile && isCollapsed;

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    onCollapseChange?.(effectiveCollapsed);
  }, [effectiveCollapsed, onCollapseChange]);

  const handleNavClick = useCallback(() => {
    if (isMobile && onClose) onClose();
  }, [isMobile, onClose]);

  // User display data
  const userDisplayData = useMemo(() => {
    let displayName = 'User';
    if (user?.firstName && user?.lastName) displayName = `${user.firstName} ${user.lastName}`;
    else if (user?.fullName) displayName = user.fullName;
    else if (meta?.name) displayName = meta.name;

    const initials = displayName === 'User'
      ? 'U'
      : displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const roles = user?.roles?.length
      ? user.roles
      : [user?.primaryRole || meta?.role || ROLES.EMPLOYEE];

    const primaryRole = ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0] || ROLES.EMPLOYEE;
    const email = user?.email || meta?.email || '';
    const department = user?.department || meta?.department || '';
    const isActive = typeof user?.isActive === 'boolean'
      ? user.isActive
      : (typeof meta?.isActive === 'boolean' ? meta.isActive : true);
    const roleBadgeColor = ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500';

    return { displayName, initials, roles, primaryRole, email, department, isActive, roleBadgeColor };
  }, [user, meta]);

  // Navigation (anti‑flicker) — now uses central config
  const lastNavigationRef = useRef(null);
  const navigation = useMemo(() => {
    if (isLoading || isAuthenticated === null) {
      return lastNavigationRef.current || PUBLIC_NAVIGATION;
    }
    const nav = isAuthenticated
      ? filterNavigation(AUTH_NAVIGATION, userDisplayData.roles, userDisplayData.department)
      : PUBLIC_NAVIGATION;
    lastNavigationRef.current = nav;
    return nav;
  }, [isAuthenticated, isLoading, userDisplayData.roles, userDisplayData.department]);

  // Theme
  const sidebarBg = theme === 'dark'
    ? 'bg-gray-900/80 backdrop-blur-2xl border-gray-800/80 shadow-2xl'
    : 'bg-white/70 backdrop-blur-2xl border-slate-200/60 shadow-2xl';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed, but you have been signed out locally');
    } finally {
      navigate('/', { replace: true });
      onClose?.();
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r
          transition-all duration-300 ease-in-out
          flex flex-col overflow-hidden
          w-[85%] max-w-xs ${effectiveCollapsed ? 'lg:w-20' : 'lg:w-72'}
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${sidebarBg}
        `}
        aria-label="Sidebar navigation"
      >
        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute top-4 right-3 z-50 p-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center backdrop-blur-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="absolute right-3 top-3 z-50 p-1.5 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Navigation list */}
        <nav
          role="navigation"
          className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          {isLoading && !lastNavigationRef.current ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            navigation.map(item => (
              <NavItem
                key={item.name}
                item={item}
                isCollapsed={effectiveCollapsed}
                pendingCount={pendingCount}
                meta={meta}
                theme={theme}
                onNavClick={handleNavClick}
                locationPath={location.pathname}
              />
            ))
          )}
        </nav>

        {/* User section / public footer */}
        {isAuthenticated ? (
          <UserSection
            userDisplayData={userDisplayData}
            isCollapsed={effectiveCollapsed}
            theme={theme}
            user={user}
            meta={meta}
            onLogout={handleLogout}
          />
        ) : (
          <PublicFooter
            isCollapsed={effectiveCollapsed}
            theme={theme}
            onNavClick={handleNavClick}
          />
        )}
      </aside>
    </>
  );
};