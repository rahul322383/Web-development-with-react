
// // import React, { useState, useEffect } from 'react';
// // import { Link, useLocation, useNavigate } from 'react-router-dom';
// // import { 
// //   LayoutDashboard, 
// //   Users, 
// //   Calendar, 
// //   Receipt, 
// //   DollarSign,
// //   Bell,
// //   LogOut,
// //   X,
// //   Menu,
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
// //   UserPlus
// // } from 'lucide-react';
// // import { useAuth } from "../../context/AuthContext";
// // import { toast } from 'sonner';
// // import PendingLeaves from '../../leave/pending-leave';

// // export const Sidebar = ({ isOpen, onClose }) => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const { user, logout, isAuthenticated } = useAuth();

// //   // Navigation for authenticated users based on role
// //   const getAuthenticatedNavigation = () => {
// //     const baseNavigation = [
// //       { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
// //       { name: 'Pending Leaves', href: '/pending-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
// //       { name: 'Approved Leaves', href: '/approved-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
// //       { name: 'Users', href: '/users', icon: Users, roles: ['Admin', 'Manager', 'HR'] },
// //       { name: 'Leave', href: '/leave', icon: Calendar, roles: ['Admin', 'Manager', 'Employee' , 'HR'] },
// //       { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee'] },
// //       { name: 'Payroll', href: '/payroll', icon: DollarSign, roles: ['Admin'] },
// //       { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Employee'] }
// //     ];

// //     // Filter navigation based on user's role
// //     if (user?.primaryRole) {
// //       return baseNavigation.filter(item => item.roles.includes(user.primaryRole));
// //     }
// //     return baseNavigation.filter(item => item.roles.includes('Employee'));
// //   };

// //   // Navigation for non-authenticated users
// //   const publicNavigation = [
// //     { name: 'Home', href: '/', icon: Home },
// //     { name: 'Features', href: '/features', icon: Sparkles },
// //     { name: 'Pricing', href: '/pricing', icon: CreditCard },
// //     { name: 'Demo', href: '/demo', icon: PlayCircle },
// //     { name: 'About', href: '/about', icon: Info },
// //     {name : 'Contact', href: '/contact', icon: Info },
// //     { name : 'Help', href: '/help', icon: HelpCircle },
// //     { name: 'Privacy', href: '/privacy', icon: Shield },
// //     { name: 'Terms', href: '/terms', icon: Scale },
// //     { name: 'Security', href: '/security', icon: Lock }
// //   ];

// //   // Footer links for non-authenticated users
// //   const footerLinks = [
// //     { name: 'Privacy', href: '/privacy', icon: Shield },
// //     { name: 'Terms', href: '/terms', icon: Scale },
// //     { name: 'Security', href: '/security', icon: Lock },
// //     { name: 'Help', href: '/help', icon: HelpCircle }
// //   ];

// //   const handleLogout = async () => {
// //     try {
// //       await logout();
// //       toast.success('Logged out successfully');
// //       navigate('/', { replace: true });
// //       if (onClose) onClose(); // Close sidebar on mobile after logout
// //     } catch (error) {
// //       toast.error('Logout failed, but you have been signed out locally');
// //       navigate('/', { replace: true });
// //     }
// //   };

// //   const navigation = isAuthenticated ? getAuthenticatedNavigation() : publicNavigation;

// //   // Get user display name and initials
// //   const getUserDisplayName = () => {
// //     if (user?.fullName) return user.fullName;
// //     if (user?.name) return user.name;
// //     return 'User';
// //   };

// //   const getUserInitials = () => {
// //     const name = getUserDisplayName();
// //     if (name === 'User') return 'U';
// //     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
// //   };

// //   const getUserRole = () => {
// //     if (user?.primaryRole) return user.primaryRole;
// //     if (user?.role) return user.role;
// //     return 'Employee';
// //   };

// //   const getUserEmail = () => {
// //     if (user?.email) return user.email;
// //     return '';
// //   };

// //   // Get role badge color
// //   const getRoleBadgeColor = (role) => {
// //     switch(role?.toLowerCase()) {
// //       case 'admin':
// //         return 'bg-gradient-to-r from-red-500 to-pink-500';
// //       case 'manager':
// //         return 'bg-gradient-to-r from-blue-500 to-cyan-500';
// //       default:
// //         return 'bg-gradient-to-r from-green-500 to-emerald-500';
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Mobile overlay - only shows when sidebar is open */}
// //       {isOpen && (
// //         <div 
// //           className="fixed inset-0 bg-black/50 z-20 lg:hidden"
// //           onClick={onClose}
// //           data-testid="sidebar-overlay"
// //         />
// //       )}

// //       {/* Sidebar - always visible on desktop, controlled on mobile */}
// //       <aside
// //         className={`
// //           fixed left-0 top-0 z-30 h-full w-64 border-r border-slate-200 bg-white
// //           transition-transform duration-300 ease-in-out shadow-xl
// //           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
// //           lg:translate-x-0
// //         `}
// //         data-testid="sidebar"
// //       >
// //         <div className="flex h-full flex-col">
// //           {/* Logo and close button */}
// //           <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
// //             <div className="flex items-center space-x-2">
// //               <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
// //                 <span className="text-white font-bold text-sm">HR</span>
// //               </div>
// //               <span className="font-bold text-slate-800">HR Management</span>
// //             </div>
// //             <button
// //               onClick={onClose}
// //               className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
// //               data-testid="sidebar-close-button"
// //             >
// //               <X className="h-5 w-5 text-slate-600" />
// //             </button>
// //           </div>

// //           {/* Navigation */}
// //           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
// //             {navigation.map((item) => {
// //               const isActive = location.pathname === item.href;
// //               return (
// //                 <Link
// //                   key={item.name}
// //                   to={item.href}
// //                   onClick={() => {
// //                     if (window.innerWidth < 1024 && onClose) {
// //                       onClose(); // Close sidebar on mobile after navigation
// //                     }
// //                   }}
// //                   data-testid={`nav-${item.name.toLowerCase()}`}
// //                   className={`
// //                     group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium
// //                     transition-all duration-200
// //                     ${
// //                       isActive
// //                         ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
// //                         : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
// //                     }
// //                   `}
// //                 >
// //                   <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
// //                     isActive ? 'text-indigo-600' : 'text-slate-500'
// //                   }`} />
// //                   <span>{item.name}</span>
// //                   {isActive && (
// //                     <div className="ml-auto w-1 h-6 bg-indigo-600 rounded-full"></div>
// //                   )}
// //                 </Link>
// //               );
// //             })}
// //           </nav>

// //           {/* User section for authenticated users */}
// //           {isAuthenticated ? (
// //             <div className="border-t border-slate-200 p-4 bg-gradient-to-b from-white to-slate-50">
// //               <div className="flex items-center space-x-3 mb-4">
// //                 <div className="relative">
// //                   <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
// //                     <span className="text-white font-semibold text-sm">
// //                       {getUserInitials()}
// //                     </span>
// //                   </div>
// //                   <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white`}></div>
// //                 </div>
// //                 <div className="flex-1 min-w-0">
// //                   <p className="text-sm font-semibold text-slate-900 truncate" data-testid="sidebar-user-name">
// //                     {getUserDisplayName()}
// //                   </p>
// //                   <div className="flex items-center space-x-2 mt-1">
// //                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(getUserRole())}`}>
// //                       {getUserRole()}
// //                     </span>
// //                   </div>
// //                   {getUserEmail() && (
// //                     <p className="text-xs text-slate-500 truncate mt-1" data-testid="sidebar-user-email">
// //                       {getUserEmail()}
// //                     </p>
// //                   )}
// //                 </div>
// //               </div>
              
// //               {/* User stats or additional info */}
// //               <div className="mb-3 p-2 bg-slate-100 rounded-lg">
// //                 <div className="text-xs text-slate-600">
// //                   <span className="font-medium">ID:</span> {user?.id || 'N/A'}
// //                 </div>
// //               </div>
              
// //               <button
// //                 onClick={handleLogout}
// //                 data-testid="sidebar-logout-button"
// //                 className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors group border border-red-200"
// //               >
// //                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                 <span>Logout</span>
// //               </button>
// //             </div>
// //           ) : (
// //             /* Footer links for non-authenticated users */
// //             <div className="border-t border-slate-200 p-4 bg-slate-50">
// //               {/* Legal & Help Links */}
// //               <div className="grid grid-cols-2 gap-2 mb-4">
// //                 {footerLinks.map((link) => (
// //                   <Link
// //                     key={link.name}
// //                     to={link.href}
// //                     onClick={() => {
// //                       if (window.innerWidth < 1024 && onClose) {
// //                         onClose();
// //                       }
// //                     }}
// //                     className="flex items-center space-x-1 text-xs text-slate-600 hover:text-indigo-600 transition-colors"
// //                   >
// //                     <link.icon className="h-3 w-3" />
// //                     <span>{link.name}</span>
// //                   </Link>
// //                 ))}
// //               </div>

// //               {/* Auth Buttons */}
// //               <div className="space-y-2">
// //                 <Link
// //                   to="/login"
// //                   onClick={() => {
// //                     if (window.innerWidth < 1024 && onClose) {
// //                       onClose();
// //                     }
// //                   }}
// //                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors group"
// //                 >
// //                   <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                   <span>Login</span>
// //                 </Link>
// //                 <Link
// //                   to="/register"
// //                   onClick={() => {
// //                     if (window.innerWidth < 1024 && onClose) {
// //                       onClose();
// //                     }
// //                   }}
// //                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
// //                 >
// //                   <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
// //                   <span>Sign Up</span>
// //                 </Link>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </aside>
// //     </>
// //   );
// // };


// import React, { useState, useEffect } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   Users, 
//   Calendar, 
//   Receipt, 
//   DollarSign,
//   Bell,
//   LogOut,
//   X,
//   Menu,
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
//   Sun,
//   Moon,
//   Monitor
// } from 'lucide-react';
// import { useAuth } from "../../context/AuthContext";
// import { toast } from 'sonner';

// // Theme context hook (you'll need to implement this in your app)
// const useTheme = () => {
//   const [theme, setTheme] = useState(() => {
//     if (typeof window !== 'undefined') {
//       const stored = localStorage.getItem('theme');
//       if (stored) return stored;
//       return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     }
//     return 'light';
//   });

//   useEffect(() => {
//     const root = document.documentElement;
//     root.classList.remove('light', 'dark');
//     root.classList.add(theme);
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'light' ? 'dark' : 'light');
//   };

//   const setSystemTheme = () => {
//     const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     setTheme(systemTheme);
//   };

//   return { theme, toggleTheme, setSystemTheme };
// };

// export const Sidebar = ({ isOpen, onClose }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, logout, isAuthenticated } = useAuth();
//   const { theme, toggleTheme, setSystemTheme } = useTheme();
//   const [showThemeMenu, setShowThemeMenu] = useState(false);

//   // Navigation for authenticated users based on role
//   const getAuthenticatedNavigation = () => {
//     const baseNavigation = [
//       { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
//       { name: 'Pending Leaves', href: '/pending-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
//       { name: 'Approved Leaves', href: '/approved-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
//       { name: 'Users', href: '/users', icon: Users, roles: ['Admin', 'Manager', 'HR'] },
//       { name: 'Leave', href: '/leave', icon: Calendar, roles: ['Admin', 'Manager', 'Employee', 'HR'] },
//       { name: 'Expenses', href: '/expenses', icon: Receipt, roles: ['Admin', 'Manager', 'Employee'] },
//       { name: 'Payroll', href: '/payroll', icon: DollarSign, roles: ['Admin'] },
//       { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['Admin', 'Manager', 'Employee'] }
//     ];

//     if (user?.primaryRole) {
//       return baseNavigation.filter(item => item.roles.includes(user.primaryRole));
//     }
//     return baseNavigation.filter(item => item.roles.includes('Employee'));
//   };

//   // Navigation for non-authenticated users
//   const publicNavigation = [
//     { name: 'Home', href: '/', icon: Home },
//     { name: 'Features', href: '/features', icon: Sparkles },
//     { name: 'Pricing', href: '/pricing', icon: CreditCard },
//     { name: 'Demo', href: '/demo', icon: PlayCircle },
//     { name: 'About', href: '/about', icon: Info },
//     { name: 'Contact', href: '/contact', icon: Info },
//     { name: 'Help', href: '/help', icon: HelpCircle },
//     { name: 'Privacy', href: '/privacy', icon: Shield },
//     { name: 'Terms', href: '/terms', icon: Scale },
//     { name: 'Security', href: '/security', icon: Lock }
//   ];

//   // Footer links for non-authenticated users
//   const footerLinks = [
//     { name: 'Privacy', href: '/privacy', icon: Shield },
//     { name: 'Terms', href: '/terms', icon: Scale },
//     { name: 'Security', href: '/security', icon: Lock },
//     { name: 'Help', href: '/help', icon: HelpCircle }
//   ];

//   const handleLogout = async () => {
//     try {
//       await logout();
//       toast.success('Logged out successfully');
//       navigate('/', { replace: true });
//       if (onClose) onClose();
//     } catch (error) {
//       toast.error('Logout failed, but you have been signed out locally');
//       navigate('/', { replace: true });
//     }
//   };

//   const navigation = isAuthenticated ? getAuthenticatedNavigation() : publicNavigation;

//   const getUserDisplayName = () => {
//     if (user?.fullName) return user.fullName;
//     if (user?.name) return user.name;
//     return 'User';
//   };

//   const getUserInitials = () => {
//     const name = getUserDisplayName();
//     if (name === 'User') return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const getUserRole = () => {
//     if (user?.primaryRole) return user.primaryRole;
//     if (user?.role) return user.role;
//     return 'Employee';
//   };

//   const getUserEmail = () => {
//     if (user?.email) return user.email;
//     return '';
//   };

//   const getRoleBadgeColor = (role) => {
//     const colors = {
//       light: {
//         admin: 'bg-gradient-to-r from-red-500 to-pink-500',
//         manager: 'bg-gradient-to-r from-blue-500 to-cyan-500',
//         employee: 'bg-gradient-to-r from-green-500 to-emerald-500'
//       },
//       dark: {
//         admin: 'bg-gradient-to-r from-red-600 to-pink-600',
//         manager: 'bg-gradient-to-r from-blue-600 to-cyan-600',
//         employee: 'bg-gradient-to-r from-green-600 to-emerald-600'
//       }
//     };
    
//     const roleKey = role?.toLowerCase() || 'employee';
//     return colors[theme]?.[roleKey] || colors.light[roleKey];
//   };

//   // Close theme menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showThemeMenu && !event.target.closest('.theme-menu-container')) {
//         setShowThemeMenu(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showThemeMenu]);

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-20 lg:hidden transition-all duration-300"
//           onClick={onClose}
//           data-testid="sidebar-overlay"
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed left-0 top-0 z-30 h-full w-72 border-r 
//           border-slate-200 dark:border-slate-700
//           bg-white dark:bg-slate-900
//           transition-all duration-300 ease-in-out shadow-xl
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//         `}
//         data-testid="sidebar"
//       >
//         <div className="flex h-full flex-col">
//           {/* Logo and close button */}
//           <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
//                   <span className="text-white font-bold text-sm">HR</span>
//                 </div>
//                 <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
//               </div>
//               <span className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//                 HR Management
//               </span>
//             </div>
//             <button
//               onClick={onClose}
//               className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
//               data-testid="sidebar-close-button"
//             >
//               <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
//             </button>
//           </div>
//           {/* Navigation */}
//           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin 
//             scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 
//             scrollbar-track-transparent"
//           >
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   onClick={() => {
//                     if (window.innerWidth < 1024 && onClose) {
//                       onClose();
//                     }
//                   }}
//                   data-testid={`nav-${item.name.toLowerCase()}`}
//                   className={`
//                     group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium
//                     transition-all duration-200 relative
//                     ${
//                       isActive
//                         ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
//                         : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
//                     }
//                   `}
//                 >
//                   <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
//                     isActive 
//                       ? 'text-indigo-600 dark:text-indigo-400' 
//                       : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
//                   }`} />
//                   <span className="flex-1">{item.name}</span>
//                   {isActive && (
//                     <>
//                       <div className="absolute right-0 w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-l-full"></div>
//                       <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-lg"></div>
//                     </>
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* User section for authenticated users */}
//           {isAuthenticated ? (
//             <div className="border-t border-slate-200 dark:border-slate-700 p-4 
//               bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50"
//             >
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="relative">
//                   <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
//                     dark:from-indigo-600 dark:to-purple-700 
//                     flex items-center justify-center shadow-lg shadow-indigo-500/25"
//                   >
//                     <span className="text-white font-semibold text-sm">
//                       {getUserInitials()}
//                     </span>
//                   </div>
//                   <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full 
//                     bg-green-500 border-2 border-white dark:border-slate-900 
//                     ring-2 ring-green-500/20 animate-pulse"
//                   ></div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" 
//                      data-testid="sidebar-user-name"
//                   >
//                     {getUserDisplayName()}
//                   </p>
//                   <div className="flex items-center space-x-2 mt-1">
//                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-sm ${getRoleBadgeColor(getUserRole())}`}>
//                       {getUserRole()}
//                     </span>
//                   </div>
//                   {getUserEmail() && (
//                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1" 
//                        data-testid="sidebar-user-email"
//                     >
//                       {getUserEmail()}
//                     </p>
//                   )}
//                 </div>
//               </div>
              
//               {/* User stats */}
//               <div className="mb-3 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
//                 <div className="text-xs space-y-1">
//                   <div className="flex justify-between">
//                     <span className="text-slate-600 dark:text-slate-400">ID:</span>
//                     <span className="font-mono font-medium text-slate-900 dark:text-slate-200">
//                       {user?.id || 'N/A'}
//                     </span>
//                   </div>
//                   {user?.department && (
//                     <div className="flex justify-between">
//                       <span className="text-slate-600 dark:text-slate-400">Dept:</span>
//                       <span className="font-medium text-slate-900 dark:text-slate-200">
//                         {user.department}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <button
//                 onClick={handleLogout}
//                 data-testid="sidebar-logout-button"
//                 className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 
//                   text-sm font-medium 
//                   text-red-600 dark:text-red-400 
//                   hover:bg-red-50 dark:hover:bg-red-950/30 
//                   border border-red-200 dark:border-red-800
//                   transition-all duration-200 group
//                   hover:shadow-md hover:shadow-red-500/10"
//               >
//                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           ) : (
//             /* Footer links for non-authenticated users */
//             <div className="border-t border-slate-200 dark:border-slate-700 p-4 
//               bg-slate-50 dark:bg-slate-800/50"
//             >
//               {/* Legal & Help Links */}
//               <div className="grid grid-cols-2 gap-2 mb-4">
//                 {footerLinks.map((link) => (
//                   <Link
//                     key={link.name}
//                     to={link.href}
//                     onClick={() => {
//                       if (window.innerWidth < 1024 && onClose) {
//                         onClose();
//                       }
//                     }}
//                     className="flex items-center space-x-1.5 text-xs 
//                       text-slate-600 dark:text-slate-400 
//                       hover:text-indigo-600 dark:hover:text-indigo-400 
//                       transition-colors group"
//                   >
//                     <link.icon className="h-3 w-3 group-hover:scale-110 transition-transform" />
//                     <span>{link.name}</span>
//                   </Link>
//                 ))}
//               </div>

//               {/* Auth Buttons */}
//               <div className="space-y-2">
//                 <Link
//                   to="/login"
//                   onClick={() => {
//                     if (window.innerWidth < 1024 && onClose) {
//                       onClose();
//                     }
//                   }}
//                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 
//                     text-sm font-medium 
//                     border-2 border-indigo-600 dark:border-indigo-500 
//                     text-indigo-600 dark:text-indigo-400 
//                     hover:bg-indigo-50 dark:hover:bg-indigo-950/30 
//                     transition-all duration-200 group
//                     hover:shadow-md hover:shadow-indigo-500/10"
//                 >
//                   <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                   <span>Login</span>
//                 </Link>
//                 <Link
//                   to="/register"
//                   onClick={() => {
//                     if (window.innerWidth < 1024 && onClose) {
//                       onClose();
//                     }
//                   }}
//                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2.5 
//                     text-sm font-medium 
//                     bg-gradient-to-r from-indigo-600 to-purple-600 
//                     dark:from-indigo-500 dark:to-purple-500
//                     text-white 
//                     hover:shadow-lg hover:shadow-indigo-500/25 
//                     dark:hover:shadow-indigo-500/20
//                     transition-all duration-200 group
//                     relative overflow-hidden"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
//                     translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
//                   ></div>
//                   <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform relative z-10" />
//                   <span className="relative z-10">Sign Up</span>
//                 </Link>
//               </div>

//               {/* Version info */}
//               <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
//                 <p className="text-center text-xs text-slate-500 dark:text-slate-500">
//                   v1.0.0 • © 2024 HR Management
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };


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


export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Navigation for authenticated users based on role
  const getAuthenticatedNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
      { name: 'Pending Leaves', href: '/pending-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
      { name: 'Approved Leaves', href: '/approved-leave', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'HR'] },
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
    {name : 'Contact', href: '/contact', icon: Info },
    { name : 'Help', href: '/help', icon: HelpCircle },
    { name: 'Privacy', href: '/privacy', icon: Shield },
    { name: 'Terms', href: '/terms', icon: Scale },
    { name: 'Security', href: '/security', icon: Lock }
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