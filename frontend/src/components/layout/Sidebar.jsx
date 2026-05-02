
// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard, Users, Calendar, Receipt, DollarSign, Bell, LogOut,
//   Home, Info, Sparkles, CreditCard, PlayCircle, BookOpen, Briefcase,
//   Shield, Scale, Lock, HelpCircle, LogIn, UserPlus, Settings, User,
//   ClipboardList, BarChart, MessageSquare, ChevronLeft, ChevronRight,
//   Building2, FileText, X, IndianRupee, BarChart3
// } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { toast } from 'sonner';

// // ------------------------------ CONFIG ------------------------------
// const BASE_NAVIGATION = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'], showForAll: true },
//   { name: 'Department Dashboard', href: '/department-dashboard', icon: Building2, roles: ['Admin', 'HR', 'Manager', 'Finance'] },
//   { name: 'Profile', href: '/profile', icon: User, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'], showForAll: true },
//   { name: 'Leave Management', href: '/leave', icon: Calendar, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
//   { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
//   { name: 'Pending Approvals', href: '/pending-leave', icon: ClipboardList, roles: ['Admin', 'Manager', 'HR', 'Finance'], badge: true },
//   {
//     name: 'Approved Leaves',
//     href: '/approved-leave',
//     icon: ClipboardList,
//     roles: ['Admin', 'Manager', 'HR', 'Finance'],
//     badge: { type: 'count', key: 'approvedLeaves' }
//   },
//   { name: 'Year End', href: '/year-end', icon: BarChart3, roles: ['Admin', 'HR', 'Finance', 'Manager'] },
//   { name: 'Analytics', href: '/analytics', icon: Receipt, roles: ['Admin', 'HR', 'Manager', 'Finance'] },
//   { name: 'Company', href: '/company', icon: Building2, roles: ['Admin', 'HR'] },
//   { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
//   { name: 'Audit Logs', href: '/audit-logs', icon: FileText, roles: ['Admin', 'HR', 'Manager', 'Finance'] },
//   { name: 'Users Management', href: '/users', icon: Users, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
//   { name: 'Payroll', href: '/payroll', icon: IndianRupee, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
//   { name: 'Reports & Analytics', href: '/reports', icon: BarChart, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
//   { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
//   { name: 'Settings', href: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
// ];

// const PUBLIC_NAVIGATION = [
//   { name: 'Home', href: '/', icon: Home },
//   { name: 'Features', href: '/features', icon: Sparkles },
//   { name: 'Pricing', href: '/pricing', icon: CreditCard },
//   { name: 'Demo', href: '/demo', icon: PlayCircle },
//   { name: 'About', href: '/about', icon: Info },
//   { name: 'Contact', href: '/contact', icon: MessageSquare },
// ];

// const FOOTER_LINKS = [
//   {
//     section: 'Legal',
//     links: [
//       { name: 'Privacy', href: '/privacy', icon: Shield },
//       { name: 'Terms', href: '/terms', icon: Scale },
//       { name: 'Security', href: '/security', icon: Lock },
//     ]
//   },
//   {
//     section: 'Support',
//     links: [
//       { name: 'Help Center', href: '/help', icon: HelpCircle },
//       { name: 'Documentation', href: '/docs', icon: BookOpen },
//     ]
//   },
// ];

// const ROLE_BADGE_COLORS = {
//   Admin: 'from-red-500 to-pink-500',
//   Manager: 'from-blue-500 to-cyan-500',
//   HR: 'from-purple-500 to-indigo-500',
//   Employee: 'from-green-500 to-emerald-500',
//   Finance: 'from-amber-500 to-orange-500',
// };

// const ROLE_PRIORITY = ['Admin', 'Manager', 'HR', 'Finance', 'Employee'];

// const DEPARTMENT_EXTRA_NAV = {
//   Marketing: [{ name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: ['Manager', 'Employee'] }],
//   HR: [{ name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: ['Admin', 'Manager', 'HR'] }],
// };

// // ------------------------------ HELPERS ------------------------------
// function buildAuthNavigation(userRoles, department) {
//   const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
//   const safeRoles = userRoles || [];
//   return [...BASE_NAVIGATION, ...extras].filter(item =>
//     item.showForAll || (item.roles || []).some(role => safeRoles.includes(role))
//   );
// }

// function getBadgeCount(item, pendingCount, meta) {
//   if (!item.badge) return 0;
//   if (item.badge === true) return pendingCount;
//   if (item.badge.type === 'count') {
//     return meta?.[item.badge.key] ?? 0;
//   }
//   return 0;
// }

// // ------------------------------ COMPONENT ------------------------------
// export const Sidebar = ({ isOpen, onClose, pendingCount = 0, onCollapseChange }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
//   const { theme } = useTheme();

//   const [isCollapsed, setIsCollapsed] = useState(() =>
//     localStorage.getItem('sidebar-collapsed') === 'true'
//   );

//   const toggleCollapse = useCallback(() => {
//     setIsCollapsed(prev => {
//       const next = !prev;
//       localStorage.setItem('sidebar-collapsed', String(next));
//       return next;
//     });
//   }, []);

//   useEffect(() => {
//     onCollapseChange?.(isCollapsed);
//   }, [isCollapsed, onCollapseChange]);

//   const handleNavClick = useCallback(() => {
//     if (window.innerWidth < 1024 && onClose) onClose();
//   }, [onClose]);

//   const userDisplayData = useMemo(() => {
//     let displayName = 'User';
//     if (user?.firstName && user?.lastName) displayName = `${user.firstName} ${user.lastName}`;
//     else if (user?.fullName) displayName = user.fullName;
//     else if (meta?.name) displayName = meta.name;

//     const initials = displayName === 'User' ? 'U' : displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//     const roles = (user?.roles?.length)
//       ? user.roles
//       : [user?.primaryRole || meta?.role || 'Employee'];
//     const primaryRole = ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0] || 'Employee';
//     const email = user?.email || meta?.email || '';
//     const department = user?.department || meta?.department || '';
//     const isActive = typeof user?.isActive === 'boolean' ? user.isActive : (typeof meta?.isActive === 'boolean' ? meta.isActive : true);
//     const roleBadgeColor = ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500';

//     return { displayName, initials, roles, primaryRole, email, department, isActive, roleBadgeColor };
//   }, [user, meta]);

//   // Wait for loading to finish before filtering – SOLVES route hiding on refresh
//   const navigation = useMemo(() => {
//     if (isLoading) return [];
//     if (!isAuthenticated) return PUBLIC_NAVIGATION;
//     return buildAuthNavigation(userDisplayData.roles, userDisplayData.department);
//   }, [isAuthenticated, isLoading, userDisplayData.roles, userDisplayData.department]);

//   const themeClasses = useMemo(() => {
//     const isDark = theme === 'dark';
//     return {
//       sidebar: isDark
//         ? 'bg-gray-900 border-gray-800 text-white'
//         : 'bg-white border-slate-200 text-slate-800',
//       navItem: (isActive) =>
//         isDark
//           ? isActive
//             ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border-l-4 border-indigo-500'
//             : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//           : isActive
//             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-l-4 border-indigo-600'
//             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
//       userSection: isDark
//         ? 'bg-gray-800/80 border-gray-700'
//         : 'bg-gradient-to-b from-white to-slate-50 border-slate-200',
//       footer: isDark
//         ? 'bg-gray-900/90 border-gray-800'
//         : 'bg-slate-50 border-slate-200',
//     };
//   }, [theme]);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast.success('Logged out successfully');
//     } catch {
//       toast.error('Logout failed, but you have been signed out locally');
//     } finally {
//       navigate('/', { replace: true });
//       if (onClose) onClose();
//     }
//   };

//   const renderNavItem = (item) => {
//     const isActive = location.pathname.startsWith(item.href);
//     const badgeCount = getBadgeCount(item, pendingCount, meta);

//     return (
//       <Link
//         key={item.name}
//         to={item.href}
//         onClick={handleNavClick}
//         aria-current={isActive ? 'page' : undefined}
//         title={isCollapsed ? item.name : undefined}
//         className={`
//           group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
//           transition-all duration-200 ease-out
//           ${isCollapsed ? 'justify-center' : 'space-x-3'}
//           ${themeClasses.navItem(isActive)}
//           ${!isActive && 'border-l-4 border-transparent'}
//         `}
//       >
//         <item.icon
//           className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : ''
//             }`}
//         />
//         {!isCollapsed && (
//           <>
//             <span className="flex-1 truncate">{item.name}</span>
//             {badgeCount > 0 && (
//               <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-sm">
//                 {badgeCount > 99 ? '99+' : badgeCount}
//               </span>
//             )}
//           </>
//         )}
//         {isCollapsed && badgeCount > 0 && (
//           <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
//             {badgeCount > 9 ? '9+' : badgeCount}
//           </span>
//         )}
//       </Link>
//     );
//   };

//   return (
//     <>
//       {/* Overlay (no blur) */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/50 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       <aside
//         className={`
//           fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r
//           transition-all duration-300 ease-in-out
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//           ${isCollapsed ? 'w-20' : 'w-[85%] max-w-xs lg:w-72'} /* responsive width */
//           ${themeClasses.sidebar}
//           shadow-xl
//         `}
//       >
//         <div className="flex h-full flex-col">
//           {/* Collapse toggle (desktop) */}
//           <button
//             onClick={toggleCollapse}
//             onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleCollapse()}
//             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//             tabIndex={0}
//             className={`
//               absolute -right-3 top-4 z-50 p-1.5 rounded-full
//               bg-white dark:bg-gray-800
//               border border-slate-200 dark:border-gray-700
//               shadow-md hover:shadow-lg transition-all
//               hidden lg:flex items-center justify-center
//               ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
//             `}
//           >
//             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
//           </button>

//           {/* Mobile close button */}
//           <button
//             onClick={onClose}
//             className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 lg:hidden"
//             aria-label="Close sidebar"
//           >
//             <X className="h-5 w-5" />
//           </button>

//           {/* Navigation */}
//           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
//             {isLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//               </div>
//             ) : (
//               navigation.map(renderNavItem)
//             )}
//           </nav>

//           {/* Bottom section (authenticated / public) */}
//           {isAuthenticated ? (
//             <div className={`border-t p-4 ${themeClasses.userSection}`}>
//               <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
//                 <div className="relative flex-shrink-0 group">
//                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500/50 ring-offset-transparent">
//                     <span className="text-white font-semibold text-sm">{userDisplayData.initials}</span>
//                   </div>
//                   {userDisplayData.isActive && (
//                     <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
//                   )}
//                 </div>
//                 {!isCollapsed && (
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate">{userDisplayData.displayName}</p>
//                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
//                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${userDisplayData.roleBadgeColor}`}>
//                         {userDisplayData.primaryRole}
//                       </span>
//                       {userDisplayData.department && (
//                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-gray-700">
//                           {userDisplayData.department}
//                         </span>
//                       )}
//                     </div>
//                     {userDisplayData.email && (
//                       <p className="text-xs truncate mt-1 text-slate-500 dark:text-gray-400">{userDisplayData.email}</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//               {!isCollapsed && (user?.id || meta) && (
//                 <div className="mb-3 p-3 rounded-lg bg-slate-100/80 dark:bg-gray-700/50">
//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div><span className="font-medium">ID</span> {user?.id ?? 'N/A'}</div>
//                     <div>
//                       <span className="font-medium">Status</span>{' '}
//                       <span className={userDisplayData.isActive ? 'text-green-500' : 'text-red-500'}>
//                         {userDisplayData.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30"
//               >
//                 <LogOut className="h-4 w-4" />
//                 {!isCollapsed && <span>Logout</span>}
//               </button>
//             </div>
//           ) : (
//             <div className={`border-t p-4 ${themeClasses.footer}`}>
//               {!isCollapsed ? (
//                 <>
//                   <div className="space-y-4 mb-4">
//                     {FOOTER_LINKS.map(section => (
//                       <div key={section.section}>
//                         <h4 className="text-xs font-semibold mb-2 uppercase">{section.section}</h4>
//                         <div className="grid grid-cols-2 gap-2">
//                           {section.links.map(link => (
//                             <Link
//                               key={link.name}
//                               to={link.href}
//                               onClick={handleNavClick}
//                               className="flex items-center space-x-1.5 text-xs"
//                             >
//                               <link.icon className="h-3 w-3" />
//                               <span>{link.name}</span>
//                             </Link>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                   <div className="space-y-2">
//                     <Link
//                       to="/login"
//                       onClick={handleNavClick}
//                       className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
//                     >
//                       <LogIn className="h-4 w-4" />
//                       <span>Login</span>
//                     </Link>
//                     <Link
//                       to="/register"
//                       onClick={handleNavClick}
//                       className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                     >
//                       <UserPlus className="h-4 w-4" />
//                       <span>Sign Up</span>
//                     </Link>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center space-y-3">
//                   <Link
//                     to="/login"
//                     title="Login"
//                     className="p-2 rounded-lg border border-indigo-600 text-indigo-600"
//                   >
//                     <LogIn className="h-4 w-4" />
//                   </Link>
//                   <Link
//                     to="/register"
//                     title="Sign Up"
//                     className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                   >
//                     <UserPlus className="h-4 w-4" />
//                   </Link>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Receipt, DollarSign, Bell, LogOut,
  Home, Info, Sparkles, CreditCard, PlayCircle, BookOpen, Briefcase,
  Shield, Scale, Lock, HelpCircle, LogIn, UserPlus, Settings, User,
  ClipboardList, BarChart, MessageSquare, ChevronLeft, ChevronRight,
  Building2, FileText, X, IndianRupee, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'sonner';

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
    ]
  },
  {
    section: 'Support',
    links: [
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'Documentation', href: '/docs', icon: BookOpen },
    ]
  },
];

const ROLE_BADGE_COLORS = {
  [ROLES.ADMIN]: 'from-red-500 to-pink-500',
  [ROLES.MANAGER]: 'from-blue-500 to-cyan-500',
  [ROLES.HR]: 'from-purple-500 to-indigo-500',
  [ROLES.EMPLOYEE]: 'from-green-500 to-emerald-500',
  [ROLES.FINANCE]: 'from-amber-500 to-orange-500',
};

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

function buildAuthNavigation(userRoles, department) {
  const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
  const safeRoles = userRoles || [];
  return [...BASE_NAVIGATION, ...extras].filter(item =>
    item.showForAll || (item.roles || []).some(role => safeRoles.includes(role))
  );
}

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

const NavItem = ({ item, isCollapsed, pendingCount, meta, theme, onNavClick, locationPath }) => {
  const active = isRouteActive(locationPath, item.href);
  const badgeCount = getBadgeCount(item, pendingCount, meta);
  const isDark = theme === 'dark';

  const activeClasses = isDark
    ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border-l-4 border-indigo-500'
    : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-l-4 border-indigo-600';

  const inactiveClasses = isDark
    ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white border-l-4 border-transparent'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent';

  return (
    <Link
      to={item.href}
      onClick={onNavClick}
      aria-current={active ? 'page' : undefined}
      title={isCollapsed ? item.name : undefined}
      className={`
        group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
        transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        ${isCollapsed ? 'justify-center' : 'space-x-3'}
        ${active ? activeClasses : inactiveClasses}
      `}
    >
      <item.icon
        className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : ''
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
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </Link>
  );
};

const UserSection = ({ userDisplayData, isCollapsed, theme, user, meta, onLogout }) => {
  const isDark = theme === 'dark';
  const sectionBg = isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200';

  return (
    <div className={`border-t p-4 ${sectionBg}`}>
      <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
        <div className="relative flex-shrink-0 group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500/50 ring-offset-transparent">
            <span className="text-white font-semibold text-sm">{userDisplayData.initials}</span>
          </div>
          {userDisplayData.isActive && (
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-gray-700">
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
        <div className="mb-3 p-3 rounded-lg bg-slate-100/80 dark:bg-gray-700/50">
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
        className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30"
      >
        <LogOut className="h-4 w-4" />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </div>
  );
};

const PublicFooter = ({ isCollapsed, theme, onNavClick }) => {
  const isDark = theme === 'dark';
  const footerBg = isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-slate-50 border-slate-200';

  if (isCollapsed) {
    return (
      <div className={`border-t p-4 ${footerBg}`}>
        <div className="flex flex-col items-center space-y-3">
          <Link to="/login" title="Login" className="p-2 rounded-lg border border-indigo-600 text-indigo-600">
            <LogIn className="h-4 w-4" />
          </Link>
          <Link to="/register" title="Sign Up" className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <UserPlus className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t p-4 ${footerBg}`}>
      <div className="space-y-4 mb-4">
        {FOOTER_LINKS.map(section => (
          <div key={section.section}>
            <h4 className="text-xs font-semibold mb-2 uppercase">{section.section}</h4>
            <div className="grid grid-cols-2 gap-2">
              {section.links.map(link => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={onNavClick}
                  className="flex items-center space-x-1.5 text-xs"
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
          className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
        >
          <LogIn className="h-4 w-4" />
          <span>Login</span>
        </Link>
        <Link
          to="/register"
          onClick={onNavClick}
          className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
        >
          <UserPlus className="h-4 w-4" />
          <span>Sign Up</span>
        </Link>
      </div>
    </div>
  );
};

export const Sidebar = ({ isOpen, onClose, pendingCount = 0, onCollapseChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('sidebar-collapsed') === 'true'
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
    if (window.innerWidth < 1024 && onClose) onClose();
  }, [onClose]);

  const userDisplayData = useMemo(() => {
    let displayName = 'User';
    if (user?.firstName && user?.lastName) displayName = `${user.firstName} ${user.lastName}`;
    else if (user?.fullName) displayName = user.fullName;
    else if (meta?.name) displayName = meta.name;

    const initials = displayName === 'User' ? 'U' : displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const roles = (user?.roles?.length)
      ? user.roles
      : [user?.primaryRole || meta?.role || ROLES.EMPLOYEE];
    const primaryRole = ROLE_PRIORITY.find(r => roles.includes(r)) || roles[0] || ROLES.EMPLOYEE;
    const email = user?.email || meta?.email || '';
    const department = user?.department || meta?.department || '';
    const isActive = typeof user?.isActive === 'boolean' ? user.isActive : (typeof meta?.isActive === 'boolean' ? meta.isActive : true);
    const roleBadgeColor = ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500';

    return { displayName, initials, roles, primaryRole, email, department, isActive, roleBadgeColor };
  }, [user, meta]);

  const roles = userDisplayData.roles;
  const department = userDisplayData.department;

  const navigation = useMemo(() => {
    if (isLoading) return [];
    if (!isAuthenticated) return PUBLIC_NAVIGATION;
    return buildAuthNavigation(roles, department);
  }, [isAuthenticated, isLoading, roles, department]);

  const themeClasses = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      sidebar: isDark
        ? 'bg-gray-900 border-gray-800 text-white'
        : 'bg-white border-slate-200 text-slate-800',
      footer: isDark
        ? 'bg-gray-900/90 border-gray-800'
        : 'bg-slate-50 border-slate-200',
    };
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed, but you have been signed out locally');
    } finally {
      navigate('/', { replace: true });
      if (onClose) onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
          ${themeClasses.sidebar}
          shadow-xl
        `}
      >
        <div className="flex h-full flex-col">
          <button
            onClick={toggleCollapse}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleCollapse()}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            tabIndex={0}
            className={`
              absolute -right-3 top-4 z-50 p-1.5 rounded-full
              bg-white dark:bg-gray-800
              border border-slate-200 dark:border-gray-700
              shadow-md hover:shadow-lg transition-all
              hidden lg:flex items-center justify-center
              ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
            `}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          <nav role="navigation" className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              navigation.map(item => (
                <NavItem
                  key={item.name}
                  item={item}
                  isCollapsed={isCollapsed}
                  pendingCount={pendingCount}
                  meta={meta}
                  theme={theme}
                  onNavClick={handleNavClick}
                  locationPath={location.pathname}
                />
              ))
            )}
          </nav>

          {isAuthenticated ? (
            <UserSection
              userDisplayData={userDisplayData}
              isCollapsed={isCollapsed}
              theme={theme}
              user={user}
              meta={meta}
              onLogout={handleLogout}
            />
          ) : (
            <PublicFooter
              isCollapsed={isCollapsed}
              theme={theme}
              onNavClick={handleNavClick}
            />
          )}
        </div>
      </aside>
    </>
  );
};