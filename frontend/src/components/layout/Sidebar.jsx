
// // // import React, { useState, useEffect, useMemo, useCallback } from 'react';
// // // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // // import {
// // //   LayoutDashboard,
// // //   Users,
// // //   Calendar,
// // //   Receipt,
// // //   DollarSign,
// // //   Bell,
// // //   LogOut,
// // //   Home,
// // //   Info,
// // //   Sparkles,
// // //   CreditCard,
// // //   PlayCircle,
// // //   BookOpen,
// // //   Briefcase,
// // //   Shield,
// // //   Scale,
// // //   Lock,
// // //   HelpCircle,
// // //   LogIn,
// // //   UserPlus,
// // //   Settings,
// // //   User,
// // //   ClipboardList,
// // //   BarChart,
// // //   MessageSquare,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   Building2,
// // //   FileText,
// // // } from 'lucide-react';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useTheme } from '../../context/ThemeContext';
// // // import { toast } from 'sonner';

// // // // ---------------------------------------------------------------------------
// // // // Navigation config — defined OUTSIDE the component so it is never re-created
// // // // ---------------------------------------------------------------------------
// // // const BASE_NAVIGATION = [
// // //   {
// // //     name: 'Dashboard',
// // //     href: '/dashboard',
// // //     icon: LayoutDashboard,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //     showForAll: true,
// // //   },
// // //   {
// // //     name: 'Department Dashboard',
// // //     href: '/department-dashboard',
// // //     icon: Building2,
// // //     roles: ['Admin', 'HR', 'Manager', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Profile',
// // //     href: '/profile',
// // //     icon: User,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //     showForAll: true,
// // //   },
// // //   {
// // //     name: 'Leave Management',
// // //     href: '/leave',
// // //     icon: Calendar,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Pending Approvals',
// // //     href: '/pending-leave',
// // //     icon: ClipboardList,
// // //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// // //     badge: true,
// // //   },
// // //   {
// // //     name: 'Expenses',
// // //     href: '/expenses',
// // //     icon: Receipt,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Audit Logs',
// // //     href: '/audit-logs',
// // //     icon: FileText,                        // FIX: was BarChart (duplicate)
// // //     roles: ['Admin', 'HR', 'Manager', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Users Management',
// // //     href: '/users',
// // //     icon: Users,
// // //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Payroll',
// // //     href: '/payroll',
// // //     icon: DollarSign,
// // //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Reports & Analytics',
// // //     href: '/reports',
// // //     icon: BarChart,
// // //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Notifications',
// // //     href: '/notifications',
// // //     icon: Bell,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //   },
// // //   {
// // //     name: 'Settings',
// // //     href: '/settings',
// // //     icon: Settings,
// // //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// // //   },
// // // ];

// // // const PUBLIC_NAVIGATION = [
// // //   { name: 'Home', href: '/', icon: Home },
// // //   { name: 'Features', href: '/features', icon: Sparkles },
// // //   { name: 'Pricing', href: '/pricing', icon: CreditCard },
// // //   { name: 'Demo', href: '/demo', icon: PlayCircle },
// // //   { name: 'About', href: '/about', icon: Info },
// // //   { name: 'Contact', href: '/contact', icon: MessageSquare },
// // // ];

// // // const FOOTER_LINKS = [
// // //   {
// // //     section: 'Legal',
// // //     links: [
// // //       { name: 'Privacy', href: '/privacy', icon: Shield },
// // //       { name: 'Terms', href: '/terms', icon: Scale },
// // //       { name: 'Security', href: '/security', icon: Lock },
// // //     ],
// // //   },
// // //   {
// // //     section: 'Support',
// // //     links: [
// // //       { name: 'Help Center', href: '/help', icon: HelpCircle },
// // //       { name: 'Documentation', href: '/docs', icon: BookOpen },
// // //     ],
// // //   },
// // // ];

// // // // FIX: Finance colour added; lookup is now complete
// // // const ROLE_BADGE_COLORS = {
// // //   Admin: 'from-red-500 to-pink-500',
// // //   Manager: 'from-blue-500 to-cyan-500',
// // //   HR: 'from-purple-500 to-indigo-500',
// // //   Employee: 'from-green-500 to-emerald-500',
// // //   Finance: 'from-amber-500 to-orange-500',
// // // };

// // // const DEPARTMENT_EXTRA_NAV = {
// // //   Marketing: [
// // //     { name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: ['Manager', 'Employee'] },
// // //   ],
// // //   HR: [
// // //     { name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: ['Admin', 'Manager', 'HR'] },
// // //   ],
// // // };

// // // // ---------------------------------------------------------------------------
// // // // Helper — build authenticated navigation for a given role + department
// // // // ---------------------------------------------------------------------------
// // // function buildAuthNavigation(role, department) {
// // //   const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
// // //   return [...BASE_NAVIGATION, ...extras].filter(
// // //     (item) => item.showForAll || item.roles.includes(role),
// // //   );
// // // }

// // // // ---------------------------------------------------------------------------
// // // // Sidebar
// // // // ---------------------------------------------------------------------------
// // // export const Sidebar = ({ isOpen, onClose, pendingCount = 0 }) => {
// // //   const location = useLocation();
// // //   const navigate = useNavigate();
// // //   const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
// // //   const { theme } = useTheme();

// // //   // FIX: persist collapse state in localStorage
// // //   const [isCollapsed, setIsCollapsed] = useState(
// // //     () => localStorage.getItem('sidebar-collapsed') === 'true',
// // //   );

// // //   const toggleCollapse = useCallback(() => {
// // //     setIsCollapsed((prev) => {
// // //       const next = !prev;
// // //       localStorage.setItem('sidebar-collapsed', String(next));
// // //       return next;
// // //     });
// // //   }, []);

// // //   // FIX: single shared mobile-close handler (was duplicated 6+ times)
// // //   const handleNavClick = useCallback(() => {
// // //     if (window.innerWidth < 1024 && onClose) onClose();
// // //   }, [onClose]);

// // //   // ---------------------------------------------------------------------------
// // //   // Derived user info (pure functions — no state needed)
// // //   // ---------------------------------------------------------------------------
// // //   const getUserDisplayName = () => {
// // //     if (user?.fullName) return user.fullName;
// // //     if (user?.name) return user.name;
// // //     if (meta?.name) return meta.name;
// // //     return 'User';
// // //   };

// // //   const getUserInitials = () => {
// // //     const name = getUserDisplayName();
// // //     if (name === 'User') return 'U';
// // //     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
// // //   };

// // //   const getUserRole = () => user?.primaryRole || meta?.role || 'Employee';
// // //   const getUserEmail = () => user?.email || meta?.email || '';
// // //   const getDepartment = () => meta?.department || user?.department || '';
// // //   const getRoleBadgeColor = (role) => ROLE_BADGE_COLORS[role] ?? 'from-gray-500 to-slate-500';

// // //   // ---------------------------------------------------------------------------
// // //   // FIX: memoised navigation — only recomputes when deps change
// // //   // ---------------------------------------------------------------------------
// // //   const navigation = useMemo(() => {
// // //     if (!isAuthenticated) return PUBLIC_NAVIGATION;
// // //     return buildAuthNavigation(getUserRole(), getDepartment());
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [isAuthenticated, user, meta]);

// // //   // ---------------------------------------------------------------------------
// // //   // Theme-aware class names — memoised
// // //   // ---------------------------------------------------------------------------
// // //   const themeClasses = useMemo(() => {
// // //     const isDark = theme === 'dark';
// // //     return {
// // //       sidebar: isDark
// // //         ? 'bg-gray-900 border-gray-800 text-white'
// // //         : 'bg-white border-slate-200 text-slate-800',
// // //       navItem: (isActive) =>
// // //         isDark
// // //           ? isActive
// // //             ? 'bg-gray-800 text-indigo-400'
// // //             : 'text-gray-300 hover:bg-gray-800 hover:text-white'
// // //           : isActive
// // //             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
// // //             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
// // //       userSection: isDark
// // //         ? 'bg-gray-800 border-gray-700'
// // //         : 'bg-gradient-to-b from-white to-slate-50 border-slate-200',
// // //       footer: isDark ? 'bg-gray-900 border-gray-800' : 'bg-slate-50 border-slate-200',
// // //     };
// // //   }, [theme]);

// // //   // ---------------------------------------------------------------------------
// // //   // Logout
// // //   // ---------------------------------------------------------------------------
// // //   const handleLogout = async () => {
// // //     try {
// // //       await logout();
// // //       toast.success('Logged out successfully');
// // //     } catch {
// // //       toast.error('Logout failed, but you have been signed out locally');
// // //     } finally {
// // //       navigate('/', { replace: true });
// // //       if (onClose) onClose();
// // //     }
// // //   };

// // //   // ---------------------------------------------------------------------------
// // //   // Render
// // //   // ---------------------------------------------------------------------------
// // //   return (
// // //     <>
// // //       {/* Mobile overlay */}
// // //       {isOpen && (
// // //         <div
// // //           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
// // //           onClick={onClose}
// // //           data-testid="sidebar-overlay"
// // //         />
// // //       )}

// // //       <aside
// // //         className={`
// // //           fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r
// // //           transition-all duration-300 ease-in-out shadow-xl
// // //           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
// // //           lg:translate-x-0
// // //           ${isCollapsed ? 'w-20' : 'w-72'}
// // //           ${themeClasses.sidebar}
// // //         `}
// // //         data-testid="sidebar"
// // //       >
// // //         <div className="flex h-full flex-col">

// // //           {/* Collapse toggle */}
// // //           <button
// // //             onClick={toggleCollapse}
// // //             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
// // //             className={`
// // //               absolute -right-3 top-20 z-40 p-1.5 rounded-full
// // //               bg-white dark:bg-gray-800
// // //               border border-slate-200 dark:border-gray-700
// // //               shadow-md hover:shadow-lg transition-all
// // //               ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
// // //             `}
// // //           >
// // //             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
// // //           </button>

// // //           {/* Navigation */}
// // //           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
// // //             {isLoading ? (
// // //               <div className="flex items-center justify-center py-8">
// // //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
// // //               </div>
// // //             ) : (
// // //               navigation.map((item) => {
// // //                 const isActive = location.pathname === item.href;
// // //                 return (
// // //                   <Link
// // //                     key={item.name}
// // //                     to={item.href}
// // //                     onClick={handleNavClick}
// // //                     aria-current={isActive ? 'page' : undefined}   // FIX: a11y
// // //                     data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
// // //                     title={isCollapsed ? item.name : undefined}
// // //                     className={`
// // //                       group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
// // //                       transition-all duration-200 relative
// // //                       ${isCollapsed ? 'justify-center' : 'space-x-3'}
// // //                       ${themeClasses.navItem(isActive)}
// // //                     `}
// // //                   >
// // //                     <item.icon
// // //                       className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive && theme === 'dark' ? 'text-indigo-400' : ''
// // //                         }`}
// // //                     />

// // //                     {!isCollapsed && (
// // //                       <>
// // //                         <span className="flex-1">{item.name}</span>

// // //                         {/* FIX: badge count comes from prop, not a magic "3" */}
// // //                         {item.badge && pendingCount > 0 && (
// // //                           <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
// // //                             {pendingCount > 99 ? '99+' : pendingCount}
// // //                           </span>
// // //                         )}

// // //                         {isActive && (
// // //                           <div
// // //                             className={`absolute right-0 w-1 h-6 rounded-full ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
// // //                               }`}
// // //                           />
// // //                         )}
// // //                       </>
// // //                     )}
// // //                   </Link>
// // //                 );
// // //               })
// // //             )}
// // //           </nav>

// // //           {/* Bottom section */}
// // //           {isAuthenticated ? (
// // //             <div className={`border-t p-4 ${themeClasses.userSection}`}>

// // //               {/* User profile */}
// // //               <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
// // //                 <div className="relative flex-shrink-0">
// // //                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500 ring-offset-transparent">
// // //                     <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
// // //                   </div>
// // //                   {meta?.isActive && (
// // //                     <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
// // //                   )}
// // //                 </div>

// // //                 {!isCollapsed && (
// // //                   <div className="flex-1 min-w-0">
// // //                     <p
// // //                       className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
// // //                       data-testid="sidebar-user-name"
// // //                     >
// // //                       {getUserDisplayName()}
// // //                     </p>
// // //                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
// // //                       <span
// // //                         className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleBadgeColor(getUserRole())}`}
// // //                       >
// // //                         {getUserRole()}
// // //                       </span>
// // //                       {getDepartment() && (
// // //                         <span
// // //                           className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-slate-200 text-slate-700'
// // //                             }`}
// // //                         >
// // //                           {getDepartment()}
// // //                         </span>
// // //                       )}
// // //                     </div>
// // //                     {getUserEmail() && (
// // //                       <p
// // //                         className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
// // //                         data-testid="sidebar-user-email"
// // //                       >
// // //                         {getUserEmail()}
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                 )}
// // //               </div>

// // //               {/* User metadata */}
// // //               {!isCollapsed && (user?.id || meta) && (
// // //                 <div className={`mb-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'}`}>
// // //                   <div className="grid grid-cols-2 gap-2 text-xs">
// // //                     <div>
// // //                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
// // //                         ID
// // //                       </span>
// // //                       <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
// // //                         {user?.id ?? 'N/A'}
// // //                       </span>
// // //                     </div>
// // //                     <div>
// // //                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
// // //                         Status
// // //                       </span>
// // //                       <span className={meta?.isActive ? 'text-green-500' : 'text-red-500'}>
// // //                         {meta?.isActive ? 'Active' : 'Inactive'}
// // //                       </span>
// // //                     </div>
// // //                   </div>
// // //                 </div>
// // //               )}

// // //               {/* Logout */}
// // //               <button
// // //                 onClick={handleLogout}
// // //                 data-testid="sidebar-logout-button"
// // //                 aria-label="Logout"
// // //                 className={`
// // //                   w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5
// // //                   text-sm font-medium transition-all group
// // //                   ${theme === 'dark'
// // //                     ? 'text-red-400 hover:bg-red-900/20 border border-red-900/30 hover:border-red-500/30'
// // //                     : 'text-red-600 hover:bg-red-50 border border-red-200'}
// // //                 `}
// // //                 title={isCollapsed ? 'Logout' : undefined}
// // //               >
// // //                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
// // //                 {!isCollapsed && <span>Logout</span>}
// // //               </button>
// // //             </div>
// // //           ) : (
// // //             /* Public footer */
// // //             <div className={`border-t p-4 ${themeClasses.footer}`}>
// // //               {!isCollapsed ? (
// // //                 <>
// // //                   {/* Legal & Help links */}
// // //                   <div className="space-y-4 mb-4">
// // //                     {FOOTER_LINKS.map((section) => (
// // //                       <div key={section.section}>
// // //                         <h4
// // //                           className={`text-xs font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
// // //                             }`}
// // //                         >
// // //                           {section.section}
// // //                         </h4>
// // //                         <div className="grid grid-cols-2 gap-2">
// // //                           {section.links.map((link) => (
// // //                             <Link
// // //                               key={link.name}
// // //                               to={link.href}
// // //                               onClick={handleNavClick}
// // //                               className={`flex items-center space-x-1.5 text-xs transition-colors ${theme === 'dark'
// // //                                   ? 'text-gray-400 hover:text-white'
// // //                                   : 'text-slate-600 hover:text-indigo-600'
// // //                                 }`}
// // //                             >
// // //                               <link.icon className="h-3 w-3" />
// // //                               <span>{link.name}</span>
// // //                             </Link>
// // //                           ))}
// // //                         </div>
// // //                       </div>
// // //                     ))}
// // //                   </div>

// // //                   {/* Auth buttons */}
// // //                   <div className="space-y-2">
// // //                     <Link
// // //                       to="/login"
// // //                       onClick={handleNavClick}
// // //                       className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${theme === 'dark'
// // //                           ? 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
// // //                           : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
// // //                         }`}
// // //                     >
// // //                       <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
// // //                       <span>Login</span>
// // //                     </Link>
// // //                     <Link
// // //                       to="/register"
// // //                       onClick={handleNavClick}
// // //                       className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
// // //                     >
// // //                       <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
// // //                       <span>Sign Up</span>
// // //                     </Link>
// // //                   </div>
// // //                 </>
// // //               ) : (
// // //                 /* Collapsed: icon-only auth buttons */
// // //                 <div className="flex flex-col items-center space-y-3">
// // //                   <Link
// // //                     to="/login"
// // //                     onClick={handleNavClick}
// // //                     title="Login"
// // //                     className={`p-2 rounded-lg transition-all ${theme === 'dark'
// // //                         ? 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
// // //                         : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
// // //                       }`}
// // //                   >
// // //                     <LogIn className="h-4 w-4" />
// // //                   </Link>
// // //                   <Link
// // //                     to="/register"
// // //                     onClick={handleNavClick}
// // //                     title="Sign Up"
// // //                     className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all"
// // //                   >
// // //                     <UserPlus className="h-4 w-4" />
// // //                   </Link>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           )}
// // //         </div>
// // //       </aside>
// // //     </>
// // //   );
// // // };


// // import React, { useState, useEffect, useMemo, useCallback } from 'react';
// // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // import {
// //   LayoutDashboard,
// //   Users,
// //   Calendar,
// //   Receipt,
// //   DollarSign,
// //   Bell,
// //   LogOut,
// //   Home,
// //   Info,
// //   Sparkles,
// //   CreditCard,
// //   PlayCircle,
// //   BookOpen,
// //   Briefcase,
// //   Shield,
// //   Scale,
// //   Lock,
// //   HelpCircle,
// //   LogIn,
// //   UserPlus,
// //   Settings,
// //   User,
// //   ClipboardList,
// //   BarChart,
// //   MessageSquare,
// //   ChevronLeft,
// //   ChevronRight,
// //   Building2,
// //   FileText,
// // } from 'lucide-react';
// // import { useAuth } from '../../context/AuthContext';
// // import { useTheme } from '../../context/ThemeContext';
// // import { toast } from 'sonner';

// // // ---------------------------------------------------------------------------
// // // Navigation config — defined OUTSIDE the component so it is never re-created
// // // ---------------------------------------------------------------------------
// // const BASE_NAVIGATION = [
// //   {
// //     name: 'Dashboard',
// //     href: '/dashboard',
// //     icon: LayoutDashboard,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //     showForAll: true,
// //   },
// //   {
// //     name: 'Department Dashboard',
// //     href: '/department-dashboard',
// //     icon: Building2,
// //     roles: ['Admin', 'HR', 'Manager', 'Finance'],
// //   },
// //   {
// //     name: 'Profile',
// //     href: '/profile',
// //     icon: User,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //     showForAll: true,
// //   },
// //   {
// //     name: 'Leave Management',
// //     href: '/leave',
// //     icon: Calendar,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Pending Approvals',
// //     href: '/pending-leave',
// //     icon: ClipboardList,
// //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// //     badge: true,
// //   },
// //   {
// //     name: 'Expenses',
// //     href: '/expenses',
// //     icon: Receipt,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Audit Logs',
// //     href: '/audit-logs',
// //     icon: FileText,
// //     roles: ['Admin', 'HR', 'Manager', 'Finance'],
// //   },
// //   {
// //     name: 'Users Management',
// //     href: '/users',
// //     icon: Users,
// //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Payroll',
// //     href: '/payroll',
// //     icon: DollarSign,
// //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Reports & Analytics',
// //     href: '/reports',
// //     icon: BarChart,
// //     roles: ['Admin', 'Manager', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Notifications',
// //     href: '/notifications',
// //     icon: Bell,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //   },
// //   {
// //     name: 'Settings',
// //     href: '/settings',
// //     icon: Settings,
// //     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
// //   },
// // ];

// // const PUBLIC_NAVIGATION = [
// //   { name: 'Home', href: '/', icon: Home },
// //   { name: 'Features', href: '/features', icon: Sparkles },
// //   { name: 'Pricing', href: '/pricing', icon: CreditCard },
// //   { name: 'Demo', href: '/demo', icon: PlayCircle },
// //   { name: 'About', href: '/about', icon: Info },
// //   { name: 'Contact', href: '/contact', icon: MessageSquare },
// // ];

// // const FOOTER_LINKS = [
// //   {
// //     section: 'Legal',
// //     links: [
// //       { name: 'Privacy', href: '/privacy', icon: Shield },
// //       { name: 'Terms', href: '/terms', icon: Scale },
// //       { name: 'Security', href: '/security', icon: Lock },
// //     ],
// //   },
// //   {
// //     section: 'Support',
// //     links: [
// //       { name: 'Help Center', href: '/help', icon: HelpCircle },
// //       { name: 'Documentation', href: '/docs', icon: BookOpen },
// //     ],
// //   },
// // ];

// // const ROLE_BADGE_COLORS = {
// //   Admin: 'from-red-500 to-pink-500',
// //   Manager: 'from-blue-500 to-cyan-500',
// //   HR: 'from-purple-500 to-indigo-500',
// //   Employee: 'from-green-500 to-emerald-500',
// //   Finance: 'from-amber-500 to-orange-500',
// // };

// // const DEPARTMENT_EXTRA_NAV = {
// //   Marketing: [
// //     { name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: ['Manager', 'Employee'] },
// //   ],
// //   HR: [
// //     { name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: ['Admin', 'Manager', 'HR'] },
// //   ],
// // };

// // // ---------------------------------------------------------------------------
// // // Helper — build authenticated navigation for a given role + department
// // // ---------------------------------------------------------------------------
// // function buildAuthNavigation(role, department) {
// //   const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
// //   return [...BASE_NAVIGATION, ...extras].filter(
// //     (item) => item.showForAll || item.roles.includes(role),
// //   );
// // }

// // // ---------------------------------------------------------------------------
// // // Sidebar
// // // ---------------------------------------------------------------------------
// // export const Sidebar = ({ isOpen, onClose, pendingCount = 0 }) => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
// //   const { theme } = useTheme();

// //   const [isCollapsed, setIsCollapsed] = useState(
// //     () => localStorage.getItem('sidebar-collapsed') === 'true',
// //   );

// //   const toggleCollapse = useCallback(() => {
// //     setIsCollapsed((prev) => {
// //       const next = !prev;
// //       localStorage.setItem('sidebar-collapsed', String(next));
// //       return next;
// //     });
// //   }, []);

// //   const handleNavClick = useCallback(() => {
// //     if (window.innerWidth < 1024 && onClose) onClose();
// //   }, [onClose]);

// //   // ---------------------------------------------------------------------------
// //   // Derived user info — now correctly uses API response structure
// //   // ---------------------------------------------------------------------------
// //   const getUserDisplayName = () => {
// //     // Prefer firstName + lastName from API response
// //     if (user?.firstName && user?.lastName) {
// //       return `${user.firstName} ${user.lastName}`;
// //     }
// //     // Fallback to existing patterns (legacy support)
// //     if (user?.fullName) return user.fullName;
// //     if (user?.name) return user.name;
// //     if (meta?.name) return meta.name;
// //     return 'User';
// //   };

// //   const getUserInitials = () => {
// //     const name = getUserDisplayName();
// //     if (name === 'User') return 'U';
// //     return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
// //   };

// //   const getUserRole = () => {
// //     // Primary source: API's primaryRole field
// //     if (user?.primaryRole) return user.primaryRole;
// //     // Fallbacks
// //     if (meta?.role) return meta.role;
// //     return 'Employee';
// //   };

// //   const getUserEmail = () => {
// //     if (user?.email) return user.email;
// //     if (meta?.email) return meta.email;
// //     return '';
// //   };

// //   const getDepartment = () => {
// //     if (user?.department) return user.department;
// //     if (meta?.department) return meta.department;
// //     return '';
// //   };

// //   const getIsActive = () => {
// //     // API response has isActive on user object
// //     if (typeof user?.isActive === 'boolean') return user.isActive;
// //     if (typeof meta?.isActive === 'boolean') return meta.isActive;
// //     return true; // default optimistic
// //   };

// //   const getRoleBadgeColor = (role) => ROLE_BADGE_COLORS[role] ?? 'from-gray-500 to-slate-500';

// //   // ---------------------------------------------------------------------------
// //   // memoised navigation
// //   // ---------------------------------------------------------------------------
// //   const navigation = useMemo(() => {
// //     if (!isAuthenticated) return PUBLIC_NAVIGATION;
// //     return buildAuthNavigation(getUserRole(), getDepartment());
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [isAuthenticated, user, meta]);

// //   // ---------------------------------------------------------------------------
// //   // Theme-aware class names
// //   // ---------------------------------------------------------------------------
// //   const themeClasses = useMemo(() => {
// //     const isDark = theme === 'dark';
// //     return {
// //       sidebar: isDark
// //         ? 'bg-gray-900 border-gray-800 text-white'
// //         : 'bg-white border-slate-200 text-slate-800',
// //       navItem: (isActive) =>
// //         isDark
// //           ? isActive
// //             ? 'bg-gray-800 text-indigo-400'
// //             : 'text-gray-300 hover:bg-gray-800 hover:text-white'
// //           : isActive
// //             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
// //             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
// //       userSection: isDark
// //         ? 'bg-gray-800 border-gray-700'
// //         : 'bg-gradient-to-b from-white to-slate-50 border-slate-200',
// //       footer: isDark ? 'bg-gray-900 border-gray-800' : 'bg-slate-50 border-slate-200',
// //     };
// //   }, [theme]);

// //   // ---------------------------------------------------------------------------
// //   // Logout
// //   // ---------------------------------------------------------------------------
// //   const handleLogout = async () => {
// //     try {
// //       await logout();
// //       toast.success('Logged out successfully');
// //     } catch {
// //       toast.error('Logout failed, but you have been signed out locally');
// //     } finally {
// //       navigate('/', { replace: true });
// //       if (onClose) onClose();
// //     }
// //   };

// //   // ---------------------------------------------------------------------------
// //   // Render
// //   // ---------------------------------------------------------------------------
// //   return (
// //     <>
// //       {/* Mobile overlay */}
// //       {isOpen && (
// //         <div
// //           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
// //           onClick={onClose}
// //           data-testid="sidebar-overlay"
// //         />
// //       )}

// //       <aside
// //         className={`
// //           fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r
// //           transition-all duration-300 ease-in-out shadow-xl
// //           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
// //           lg:translate-x-0
// //           ${isCollapsed ? 'w-20' : 'w-72'}
// //           ${themeClasses.sidebar}
// //         `}
// //         data-testid="sidebar"
// //       >
// //         <div className="flex h-full flex-col">

// //           {/* Collapse toggle */}
// //           <button
// //             onClick={toggleCollapse}
// //             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
// //             className={`
// //               absolute -right-3 top-20 z-40 p-1.5 rounded-full
// //               bg-white dark:bg-gray-800
// //               border border-slate-200 dark:border-gray-700
// //               shadow-md hover:shadow-lg transition-all
// //               ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}
// //             `}
// //           >
// //             {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
// //           </button>

// //           {/* Navigation */}
// //           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
// //             {isLoading ? (
// //               <div className="flex items-center justify-center py-8">
// //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
// //               </div>
// //             ) : (
// //               navigation.map((item) => {
// //                 const isActive = location.pathname === item.href;
// //                 return (
// //                   <Link
// //                     key={item.name}
// //                     to={item.href}
// //                     onClick={handleNavClick}
// //                     aria-current={isActive ? 'page' : undefined}
// //                     data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
// //                     title={isCollapsed ? item.name : undefined}
// //                     className={`
// //                       group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
// //                       transition-all duration-200 relative
// //                       ${isCollapsed ? 'justify-center' : 'space-x-3'}
// //                       ${themeClasses.navItem(isActive)}
// //                     `}
// //                   >
// //                     <item.icon
// //                       className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive && theme === 'dark' ? 'text-indigo-400' : ''
// //                         }`}
// //                     />

// //                     {!isCollapsed && (
// //                       <>
// //                         <span className="flex-1">{item.name}</span>

// //                         {item.badge && pendingCount > 0 && (
// //                           <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
// //                             {pendingCount > 99 ? '99+' : pendingCount}
// //                           </span>
// //                         )}

// //                         {isActive && (
// //                           <div
// //                             className={`absolute right-0 w-1 h-6 rounded-full ${theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-600'
// //                               }`}
// //                           />
// //                         )}
// //                       </>
// //                     )}
// //                   </Link>
// //                 );
// //               })
// //             )}
// //           </nav>

// //           {/* Bottom section */}
// //           {isAuthenticated ? (
// //             <div className={`border-t p-4 ${themeClasses.userSection}`}>

// //               {/* User profile */}
// //               <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
// //                 <div className="relative flex-shrink-0">
// //                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500 ring-offset-transparent">
// //                     <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
// //                   </div>
// //                   {getIsActive() && (
// //                     <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
// //                   )}
// //                 </div>

// //                 {!isCollapsed && (
// //                   <div className="flex-1 min-w-0">
// //                     <p
// //                       className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
// //                       data-testid="sidebar-user-name"
// //                     >
// //                       {getUserDisplayName()}
// //                     </p>
// //                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
// //                       <span
// //                         className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleBadgeColor(getUserRole())}`}
// //                       >
// //                         {getUserRole()}
// //                       </span>
// //                       {getDepartment() && (
// //                         <span
// //                           className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-slate-200 text-slate-700'
// //                             }`}
// //                         >
// //                           {getDepartment()}
// //                         </span>
// //                       )}
// //                     </div>
// //                     {getUserEmail() && (
// //                       <p
// //                         className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
// //                         data-testid="sidebar-user-email"
// //                       >
// //                         {getUserEmail()}
// //                       </p>
// //                     )}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* User metadata (ID and Status) */}
// //               {!isCollapsed && (user?.id || meta) && (
// //                 <div className={`mb-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-slate-100'}`}>
// //                   <div className="grid grid-cols-2 gap-2 text-xs">
// //                     <div>
// //                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
// //                         ID
// //                       </span>
// //                       <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
// //                         {user?.id ?? 'N/A'}
// //                       </span>
// //                     </div>
// //                     <div>
// //                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
// //                         Status
// //                       </span>
// //                       <span className={getIsActive() ? 'text-green-500' : 'text-red-500'}>
// //                         {getIsActive() ? 'Active' : 'Inactive'}
// //                       </span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Logout */}
// //               <button
// //                 onClick={handleLogout}
// //                 data-testid="sidebar-logout-button"
// //                 aria-label="Logout"
// //                 className={`
// //                   w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5
// //                   text-sm font-medium transition-all group
// //                   ${theme === 'dark'
// //                     ? 'text-red-400 hover:bg-red-900/20 border border-red-900/30 hover:border-red-500/30'
// //                     : 'text-red-600 hover:bg-red-50 border border-red-200'}
// //                 `}
// //                 title={isCollapsed ? 'Logout' : undefined}
// //               >
// //                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                 {!isCollapsed && <span>Logout</span>}
// //               </button>
// //             </div>
// //           ) : (
// //             /* Public footer */
// //             <div className={`border-t p-4 ${themeClasses.footer}`}>
// //               {!isCollapsed ? (
// //                 <>
// //                   {/* Legal & Help links */}
// //                   <div className="space-y-4 mb-4">
// //                     {FOOTER_LINKS.map((section) => (
// //                       <div key={section.section}>
// //                         <h4
// //                           className={`text-xs font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
// //                             }`}
// //                         >
// //                           {section.section}
// //                         </h4>
// //                         <div className="grid grid-cols-2 gap-2">
// //                           {section.links.map((link) => (
// //                             <Link
// //                               key={link.name}
// //                               to={link.href}
// //                               onClick={handleNavClick}
// //                               className={`flex items-center space-x-1.5 text-xs transition-colors ${theme === 'dark'
// //                                 ? 'text-gray-400 hover:text-white'
// //                                 : 'text-slate-600 hover:text-indigo-600'
// //                                 }`}
// //                             >
// //                               <link.icon className="h-3 w-3" />
// //                               <span>{link.name}</span>
// //                             </Link>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>

// //                   {/* Auth buttons */}
// //                   <div className="space-y-2">
// //                     <Link
// //                       to="/login"
// //                       onClick={handleNavClick}
// //                       className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${theme === 'dark'
// //                         ? 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
// //                         : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
// //                         }`}
// //                     >
// //                       <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                       <span>Login</span>
// //                     </Link>
// //                     <Link
// //                       to="/register"
// //                       onClick={handleNavClick}
// //                       className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
// //                     >
// //                       <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                       <span>Sign Up</span>
// //                     </Link>
// //                   </div>
// //                 </>
// //               ) : (
// //                 /* Collapsed: icon-only auth buttons */
// //                 <div className="flex flex-col items-center space-y-3">
// //                   <Link
// //                     to="/login"
// //                     onClick={handleNavClick}
// //                     title="Login"
// //                     className={`p-2 rounded-lg transition-all ${theme === 'dark'
// //                       ? 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
// //                       : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
// //                       }`}
// //                   >
// //                     <LogIn className="h-4 w-4" />
// //                   </Link>
// //                   <Link
// //                     to="/register"
// //                     onClick={handleNavClick}
// //                     title="Sign Up"
// //                     className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all"
// //                   >
// //                     <UserPlus className="h-4 w-4" />
// //                   </Link>
// //                 </div>
// //               )}
// //             </div>
// //           )}
// //         </div>
// //       </aside>
// //     </>
// //   );
// // };

// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Users,
//   Calendar,
//   Receipt,
//   DollarSign,
//   Bell,
//   LogOut,
//   Home,
//   Info,
//   Sparkles,
//   CreditCard,
//   PlayCircle,
//   BookOpen,
//   Briefcase,
//   Shield,
//   Scale,
//   Lock,
//   HelpCircle,
//   LogIn,
//   UserPlus,
//   Settings,
//   User,
//   ClipboardList,
//   BarChart,
//   MessageSquare,
//   ChevronLeft,
//   ChevronRight,
//   Building2,
//   FileText,
//   X,
// } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { toast } from 'sonner';

// // ---------------------------------------------------------------------------
// // Navigation config — defined OUTSIDE the component so it is never re-created
// // ---------------------------------------------------------------------------
// const BASE_NAVIGATION = [
//   {
//     name: 'Dashboard',
//     href: '/dashboard',
//     icon: LayoutDashboard,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//     showForAll: true,
//   },
//   {
//     name: 'Department Dashboard',
//     href: '/department-dashboard',
//     icon: Building2,
//     roles: ['Admin', 'HR', 'Manager', 'Finance'],
//   },
//   {
//     name: 'Profile',
//     href: '/profile',
//     icon: User,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//     showForAll: true,
//   },
//   {
//     name: 'Leave Management',
//     href: '/leave',
//     icon: Calendar,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//   },
//   {
//     name: 'Pending Approvals',
//     href: '/pending-leave',
//     icon: ClipboardList,
//     roles: ['Admin', 'Manager', 'HR', 'Finance'],
//     badge: true,
//   },
//   {
//     name: 'Expenses',
//     href: '/expenses',
//     icon: Receipt,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//   },
//   {
//     name: 'Audit Logs',
//     href: '/audit-logs',
//     icon: FileText,
//     roles: ['Admin', 'HR', 'Manager', 'Finance'],
//   },
//   {
//     name: 'Users Management',
//     href: '/users',
//     icon: Users,
//     roles: ['Admin', 'Manager', 'HR', 'Finance'],
//   },
//   {
//     name: 'Payroll',
//     href: '/payroll',
//     icon: DollarSign,
//     roles: ['Admin', 'Manager', 'HR', 'Finance'],
//   },
//   {
//     name: 'Reports & Analytics',
//     href: '/reports',
//     icon: BarChart,
//     roles: ['Admin', 'Manager', 'HR', 'Finance'],
//   },
//   {
//     name: 'Notifications',
//     href: '/notifications',
//     icon: Bell,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//   },
//   {
//     name: 'Settings',
//     href: '/settings',
//     icon: Settings,
//     roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'],
//   },
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
//     ],
//   },
//   {
//     section: 'Support',
//     links: [
//       { name: 'Help Center', href: '/help', icon: HelpCircle },
//       { name: 'Documentation', href: '/docs', icon: BookOpen },
//     ],
//   },
// ];

// const ROLE_BADGE_COLORS = {
//   Admin: 'from-red-500 to-pink-500',
//   Manager: 'from-blue-500 to-cyan-500',
//   HR: 'from-purple-500 to-indigo-500',
//   Employee: 'from-green-500 to-emerald-500',
//   Finance: 'from-amber-500 to-orange-500',
// };

// const DEPARTMENT_EXTRA_NAV = {
//   Marketing: [
//     { name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: ['Manager', 'Employee'] },
//   ],
//   HR: [
//     { name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: ['Admin', 'Manager', 'HR'] },
//   ],
// };

// // ---------------------------------------------------------------------------
// // Helper — build authenticated navigation for given roles + department
// // ---------------------------------------------------------------------------
// function buildAuthNavigation(userRoles, department) {
//   const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
//   const allItems = [...BASE_NAVIGATION, ...extras];

//   return allItems.filter((item) => {
//     if (item.showForAll) return true;
//     // Check if any of user's roles matches item's required roles
//     return item.roles.some(role => userRoles.includes(role));
//   });
// }

// // ---------------------------------------------------------------------------
// // Sidebar Component
// // ---------------------------------------------------------------------------
// export const Sidebar = ({ isOpen, onClose, pendingCount = 0 }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, meta, logout, isAuthenticated, isLoading } = useAuth();
//   const { theme } = useTheme();

//   const [isCollapsed, setIsCollapsed] = useState(
//     () => localStorage.getItem('sidebar-collapsed') === 'true'
//   );

//   const toggleCollapse = useCallback(() => {
//     setIsCollapsed((prev) => {
//       const next = !prev;
//       localStorage.setItem('sidebar-collapsed', String(next));
//       return next;
//     });
//   }, []);

//   const handleNavClick = useCallback(() => {
//     if (window.innerWidth < 1024 && onClose) onClose();
//   }, [onClose]);

//   // -------------------------------------------------------------------------
//   // Derived user info with memoization
//   // -------------------------------------------------------------------------
//   const userDisplayData = useMemo(() => {
//     // Name
//     let displayName = 'User';
//     if (user?.firstName && user?.lastName) {
//       displayName = `${user.firstName} ${user.lastName}`;
//     } else if (user?.fullName) {
//       displayName = user.fullName;
//     } else if (meta?.name) {
//       displayName = meta.name;
//     }

//     // Initials
//     const initials = displayName === 'User'
//       ? 'U'
//       : displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

//     // Roles (use array if available, else fallback to single role)
//     const roles = user?.roles?.length
//       ? user.roles
//       : [user?.primaryRole || meta?.role || 'Employee'];

//     // Primary role for badge (first in array or fallback)
//     const primaryRole = roles[0] || 'Employee';

//     // Email
//     const email = user?.email || meta?.email || '';

//     // Department
//     const department = user?.department || meta?.department || '';

//     // Active status
//     const isActive = typeof user?.isActive === 'boolean'
//       ? user.isActive
//       : typeof meta?.isActive === 'boolean'
//         ? meta.isActive
//         : true;

//     // Role badge color
//     const roleBadgeColor = ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500';

//     return { displayName, initials, roles, primaryRole, email, department, isActive, roleBadgeColor };
//   }, [user, meta]);

//   // -------------------------------------------------------------------------
//   // Memoized navigation
//   // -------------------------------------------------------------------------
//   const navigation = useMemo(() => {
//     if (!isAuthenticated) return PUBLIC_NAVIGATION;
//     return buildAuthNavigation(userDisplayData.roles, userDisplayData.department);
//   }, [isAuthenticated, userDisplayData.roles, userDisplayData.department]);

//   // -------------------------------------------------------------------------
//   // Theme-aware class names
//   // -------------------------------------------------------------------------
//   const themeClasses = useMemo(() => {
//     const isDark = theme === 'dark';
//     return {
//       sidebar: isDark
//         ? 'bg-gray-900/95 backdrop-blur-xl border-gray-800 text-white'
//         : 'bg-white/95 backdrop-blur-xl border-slate-200 text-slate-800',
//       navItem: (isActive) =>
//         isDark
//           ? isActive
//             ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border-l-4 border-indigo-500'
//             : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
//           : isActive
//             ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-l-4 border-indigo-600'
//             : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
//       userSection: isDark
//         ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700'
//         : 'bg-gradient-to-b from-white/80 to-slate-50/80 backdrop-blur-sm border-slate-200',
//       footer: isDark
//         ? 'bg-gray-900/90 border-gray-800'
//         : 'bg-slate-50/90 border-slate-200',
//       tooltip: isDark
//         ? 'bg-gray-800 text-white border-gray-700'
//         : 'bg-white text-slate-800 border-slate-200 shadow-lg',
//     };
//   }, [theme]);

//   // -------------------------------------------------------------------------
//   // Logout handler
//   // -------------------------------------------------------------------------
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

//   // -------------------------------------------------------------------------
//   // Render helper for navigation items
//   // -------------------------------------------------------------------------
//   const renderNavItem = (item) => {
//     const isActive = location.pathname === item.href;
//     return (
//       <Link
//         key={item.name}
//         to={item.href}
//         onClick={handleNavClick}
//         aria-current={isActive ? 'page' : undefined}
//         data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
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

//             {item.badge && pendingCount > 0 && (
//               <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-sm">
//                 {pendingCount > 99 ? '99+' : pendingCount}
//               </span>
//             )}
//           </>
//         )}

//         {/* Collapsed badge indicator */}
//         {isCollapsed && item.badge && pendingCount > 0 && (
//           <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
//             {pendingCount > 9 ? '9+' : pendingCount}
//           </span>
//         )}
//       </Link>
//     );
//   };

//   // -------------------------------------------------------------------------
//   // Render
//   // -------------------------------------------------------------------------
//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
//           onClick={onClose}
//           data-testid="sidebar-overlay"
//         />
//       )}

//       <aside
//         className={`
//           fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r
//           transition-all duration-300 ease-in-out
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//           ${isCollapsed ? 'w-20' : 'w-72'}
//           ${themeClasses.sidebar}
//           shadow-xl
//         `}
//         data-testid="sidebar"
//       >
//         <div className="flex h-full flex-col">
//           {/* Collapse toggle - visible on desktop */}
//           <button
//             onClick={toggleCollapse}
//             aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//             className={`
//               absolute -right-3 top-20 z-40 p-1.5 rounded-full
//               bg-white dark:bg-gray-800
//               border border-slate-200 dark:border-gray-700
//               shadow-md hover:shadow-lg transition-all
//               hidden lg:block
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
//           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin" aria-label="Main navigation">
//             {isLoading ? (
//               <div className="flex items-center justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//               </div>
//             ) : (
//               navigation.map(renderNavItem)
//             )}
//           </nav>

//           {/* Bottom section */}
//           {isAuthenticated ? (
//             <div className={`border-t p-4 ${themeClasses.userSection}`}>
//               {/* User profile */}
//               <div className={`flex ${isCollapsed ? 'justify-center' : 'space-x-3'} mb-4`}>
//                 <div className="relative flex-shrink-0 group">
//                   <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-indigo-500/50 ring-offset-transparent transition-transform group-hover:scale-105">
//                     <span className="text-white font-semibold text-sm">{userDisplayData.initials}</span>
//                   </div>
//                   {userDisplayData.isActive && (
//                     <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 animate-pulse" />
//                   )}
//                 </div>

//                 {!isCollapsed && (
//                   <div className="flex-1 min-w-0">
//                     <p
//                       className={`text-sm font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
//                       data-testid="sidebar-user-name"
//                     >
//                       {userDisplayData.displayName}
//                     </p>
//                     <div className="flex flex-wrap items-center gap-1.5 mt-1">
//                       <span
//                         className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${userDisplayData.roleBadgeColor} shadow-sm`}
//                       >
//                         {userDisplayData.primaryRole}
//                       </span>
//                       {userDisplayData.department && (
//                         <span
//                           className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-slate-200 text-slate-700'
//                             }`}
//                         >
//                           {userDisplayData.department}
//                         </span>
//                       )}
//                     </div>
//                     {userDisplayData.email && (
//                       <p
//                         className={`text-xs truncate mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
//                         data-testid="sidebar-user-email"
//                       >
//                         {userDisplayData.email}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* User metadata (ID and Status) */}
//               {!isCollapsed && (user?.id || meta) && (
//                 <div className={`mb-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-slate-100/80'}`}>
//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div>
//                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
//                         ID
//                       </span>
//                       <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
//                         {user?.id ?? 'N/A'}
//                       </span>
//                     </div>
//                     <div>
//                       <span className={`font-medium block ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
//                         Status
//                       </span>
//                       <span className={userDisplayData.isActive ? 'text-green-500' : 'text-red-500'}>
//                         {userDisplayData.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Logout */}
//               <button
//                 onClick={handleLogout}
//                 data-testid="sidebar-logout-button"
//                 aria-label="Logout"
//                 className={`
//                   w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5
//                   text-sm font-medium transition-all group relative
//                   ${theme === 'dark'
//                     ? 'text-red-400 hover:bg-red-900/20 border border-red-900/30 hover:border-red-500/30'
//                     : 'text-red-600 hover:bg-red-50 border border-red-200'}
//                 `}
//                 title={isCollapsed ? 'Logout' : undefined}
//               >
//                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                 {!isCollapsed && <span>Logout</span>}
//               </button>
//             </div>
//           ) : (
//             /* Public footer */
//             <div className={`border-t p-4 ${themeClasses.footer}`}>
//               {!isCollapsed ? (
//                 <>
//                   {/* Legal & Help links */}
//                   <div className="space-y-4 mb-4">
//                     {FOOTER_LINKS.map((section) => (
//                       <div key={section.section}>
//                         <h4
//                           className={`text-xs font-semibold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'
//                             }`}
//                         >
//                           {section.section}
//                         </h4>
//                         <div className="grid grid-cols-2 gap-2">
//                           {section.links.map((link) => (
//                             <Link
//                               key={link.name}
//                               to={link.href}
//                               onClick={handleNavClick}
//                               className={`flex items-center space-x-1.5 text-xs transition-colors ${theme === 'dark'
//                                   ? 'text-gray-400 hover:text-white'
//                                   : 'text-slate-600 hover:text-indigo-600'
//                                 }`}
//                             >
//                               <link.icon className="h-3 w-3" />
//                               <span>{link.name}</span>
//                             </Link>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Auth buttons */}
//                   <div className="space-y-2">
//                     <Link
//                       to="/login"
//                       onClick={handleNavClick}
//                       className={`w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group ${theme === 'dark'
//                           ? 'border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
//                           : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
//                         }`}
//                     >
//                       <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                       <span>Login</span>
//                     </Link>
//                     <Link
//                       to="/register"
//                       onClick={handleNavClick}
//                       className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
//                     >
//                       <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                       <span>Sign Up</span>
//                     </Link>
//                   </div>
//                 </>
//               ) : (
//                 /* Collapsed: icon-only auth buttons */
//                 <div className="flex flex-col items-center space-y-3">
//                   <Link
//                     to="/login"
//                     onClick={handleNavClick}
//                     title="Login"
//                     className={`p-2 rounded-lg transition-all ${theme === 'dark'
//                         ? 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10'
//                         : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
//                       }`}
//                   >
//                     <LogIn className="h-4 w-4" />
//                   </Link>
//                   <Link
//                     to="/register"
//                     onClick={handleNavClick}
//                     title="Sign Up"
//                     className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg transition-all"
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


// src/components/layout/Sidebar.jsx
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

// ------------------------------ CONFIG ------------------------------
const BASE_NAVIGATION = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'], showForAll: true },
  { name: 'Department Dashboard', href: '/department-dashboard', icon: Building2, roles: ['Admin', 'HR', 'Manager', 'Finance'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'], showForAll: true },
  { name: 'Leave Management', href: '/leave', icon: Calendar, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance']
  },

  { name: 'Pending Approvals', href: '/pending-leave', icon: ClipboardList, roles: ['Admin', 'Manager', 'HR', 'Finance'], badge: true },

  {
    name: 'Approved Leaves',
    href: '/approved-leave',
    icon: ClipboardList,
    roles: ['Admin', 'Manager', 'HR', 'Finance'],
    badge: {
      type: 'count', // or 'dot'
      key: 'approvedLeaves'
    }
  },

  {
    name: 'Year End',
    href: '/year-end',
    icon: BarChart3,
    roles: ['Admin', 'HR', 'Finance', 'Manager']
  },
 
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Receipt,
    roles: ['Admin', 'HR', 'Manager', 'Finance']
  },

  {
    name: 'Company',
    href: '/company',
    icon: Building2,
    roles: ['Admin', 'HR']
  },
  { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText, roles: ['Admin', 'HR', 'Manager', 'Finance'] },
  { name: 'Users Management', href: '/users', icon: Users, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
  { name: 'Payroll', href: '/payroll', icon: IndianRupee, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart, roles: ['Admin', 'Manager', 'HR', 'Finance'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee', 'HR', 'Finance'] },
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
    section: 'Legal', links: [
      { name: 'Privacy', href: '/privacy', icon: Shield },
      { name: 'Terms', href: '/terms', icon: Scale },
      { name: 'Security', href: '/security', icon: Lock },
    ]
  },
  {
    section: 'Support', links: [
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'Documentation', href: '/docs', icon: BookOpen },
    ]
  },
];

const ROLE_BADGE_COLORS = {
  Admin: 'from-red-500 to-pink-500',
  Manager: 'from-blue-500 to-cyan-500',
  HR: 'from-purple-500 to-indigo-500',
  Employee: 'from-green-500 to-emerald-500',
  Finance: 'from-amber-500 to-orange-500',
};

const DEPARTMENT_EXTRA_NAV = {
  Marketing: [{ name: 'Marketing Tools', href: '/marketing', icon: Briefcase, roles: ['Manager', 'Employee'] }],
  HR: [{ name: 'Recruitment', href: '/recruitment', icon: Briefcase, roles: ['Admin', 'Manager', 'HR'] }],
};

function buildAuthNavigation(userRoles, department) {
  const extras = DEPARTMENT_EXTRA_NAV[department] ?? [];
  return [...BASE_NAVIGATION, ...extras].filter(item =>
    item.showForAll || item.roles.some(role => userRoles.includes(role))
  );
}

// ------------------------------ COMPONENT ------------------------------
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
      onCollapseChange?.(next);
      return next;
    });
  }, [onCollapseChange]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024 && onClose) onClose();
  }, [onClose]);

  // Notify parent of initial collapse state
  useEffect(() => {
    onCollapseChange?.(isCollapsed);
  }, []);

  const userDisplayData = useMemo(() => {
    let displayName = 'User';
    if (user?.firstName && user?.lastName) displayName = `${user.firstName} ${user.lastName}`;
    else if (user?.fullName) displayName = user.fullName;
    else if (meta?.name) displayName = meta.name;

    const initials = displayName === 'User' ? 'U' : displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const roles = user?.roles?.length ? user.roles : [user?.primaryRole || meta?.role || 'Employee'];
    const primaryRole = roles[0] || 'Employee';
    const email = user?.email || meta?.email || '';
    const department = user?.department || meta?.department || '';
    const isActive = typeof user?.isActive === 'boolean' ? user.isActive : (typeof meta?.isActive === 'boolean' ? meta.isActive : true);
    const roleBadgeColor = ROLE_BADGE_COLORS[primaryRole] ?? 'from-gray-500 to-slate-500';

    return { displayName, initials, roles, primaryRole, email, department, isActive, roleBadgeColor };
  }, [user, meta]);

  const navigation = useMemo(() => {
    if (!isAuthenticated) return PUBLIC_NAVIGATION;
    return buildAuthNavigation(userDisplayData.roles, userDisplayData.department);
  }, [isAuthenticated, userDisplayData.roles, userDisplayData.department]);

  const themeClasses = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      sidebar: isDark
        ? 'bg-gray-900 border-gray-800 text-white'  // removed backdrop-blur
        : 'bg-white border-slate-200 text-slate-800',
      navItem: (isActive) =>
        isDark
          ? isActive
            ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 border-l-4 border-indigo-500'
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          : isActive
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-l-4 border-indigo-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      userSection: isDark
        ? 'bg-gray-800/80 border-gray-700'
        : 'bg-gradient-to-b from-white to-slate-50 border-slate-200',
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

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={handleNavClick}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? item.name : undefined}
        className={`
          group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
          transition-all duration-200 ease-out
          ${isCollapsed ? 'justify-center' : 'space-x-3'}
          ${themeClasses.navItem(isActive)}
          ${!isActive && 'border-l-4 border-transparent'}
        `}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : ''}`} />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {item.badge && pendingCount > 0 && (
              <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1 text-[10px] font-bold text-white shadow-sm">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </>
        )}
        {isCollapsed && item.badge && pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${themeClasses.sidebar}
          shadow-xl
        `}
      >
        <div className="flex h-full flex-col">
          {/* Collapse toggle - repositioned to avoid header overlap */}
          <button
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              navigation.map(renderNavItem)
            )}
          </nav>

          {/* Bottom section */}
          {isAuthenticated ? (
            <div className={`border-t p-4 ${themeClasses.userSection}`}>
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
                    <div><span className="font-medium">Status</span> <span className={userDisplayData.isActive ? 'text-green-500' : 'text-red-500'}>{userDisplayData.isActive ? 'Active' : 'Inactive'}</span></div>
                  </div>
                </div>
              )}
              <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          ) : (
            <div className={`border-t p-4 ${themeClasses.footer}`}>
              {!isCollapsed ? (
                <>
                  <div className="space-y-4 mb-4">
                    {FOOTER_LINKS.map(section => (
                      <div key={section.section}>
                        <h4 className="text-xs font-semibold mb-2 uppercase">{section.section}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {section.links.map(link => (
                            <Link key={link.name} to={link.href} onClick={handleNavClick} className="flex items-center space-x-1.5 text-xs">
                              <link.icon className="h-3 w-3" /><span>{link.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Link to="/login" onClick={handleNavClick} className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                      <LogIn className="h-4 w-4" /><span>Login</span>
                    </Link>
                    <Link to="/register" onClick={handleNavClick} className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <UserPlus className="h-4 w-4" /><span>Sign Up</span>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <Link to="/login" title="Login" className="p-2 rounded-lg border border-indigo-600 text-indigo-600"><LogIn className="h-4 w-4" /></Link>
                  <Link to="/register" title="Sign Up" className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white"><UserPlus className="h-4 w-4" /></Link>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};