// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Menu, X, LogOut, Settings, HelpCircle, ChevronDown,
//   Sparkles, Home, Info, PlayCircle, Bell, Moon, Sun,
//   LayoutDashboard, User, CheckCheck, Trash2, Loader2,
//   CheckCircle, Clock, AlertCircle, MessageSquare, Calendar,
//   Receipt, Users, CreditCard, BookOpen, Briefcase
// } from "lucide-react";
// import { toast } from "sonner";
// import { useTheme } from "../../context/ThemeContext";
// import { useAuth } from "../../context/AuthContext";
// import notificationApi from "../../api/notificationApi";
// import { formatDistanceToNow } from "date-fns";
// import { useSocket } from '../../context/SocketContext';

// const notificationTypeConfig = {
//   leave_approved: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/20' },
//   leave_rejected: { icon: X, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20' },
//   leave_requested: { icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
//   expense_approved: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/20' },
//   expense_rejected: { icon: X, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20' },
//   expense_submitted: { icon: Receipt, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' },
//   payroll_processed: { icon: CreditCard, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
//   team_message: { icon: MessageSquare, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/20' },
//   user_joined: { icon: Users, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-950/20' },
//   system_alert: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/20' },
//   default: { icon: Bell, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800/50' }
// };

// const getNotificationConfig = (type) => notificationTypeConfig[type] || notificationTypeConfig.default;
// const getInitials = (user) => {
//   if (!user) return 'U';
//   if (user.fullName) return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   if (user.email) return user.email[0].toUpperCase();
//   return 'U';
// };
// const getUserDisplayName = (user) => {
//   if (!user) return 'User';
//   if (user.fullName) return user.fullName.split(' ')[0];
//   if (user.email) return user.email.split('@')[0];
//   return 'User';
// };
// const getRoleColor = (role) => {
//   const colors = { Admin: 'from-red-500 to-pink-500', Manager: 'from-blue-500 to-cyan-500', HR: 'from-purple-500 to-indigo-500', Employee: 'from-green-500 to-emerald-500' };
//   return colors[role] || 'from-gray-500 to-slate-500';
// };
// const hasRole = (user, ...roles) => roles.includes(user?.primaryRole);
// const hasDepartment = (meta, dept) => meta?.department === dept;

// export const Header = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
//   const [notificationError, setNotificationError] = useState(null);
//   const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0, hasMore: true });

//   const location = useLocation();
//   const navigate = useNavigate();
//   const notificationRef = useRef(null);
//   const profileRef = useRef(null);
//   const { theme, toggleTheme } = useTheme();
//   const { user, meta, isAuthenticated, isLoading, logout } = useAuth();
//   const isDarkMode = theme === "dark";
//   const { unreadCount, setUnreadCount, socket } = useSocket();

//   const fetchNotifications = useCallback(async (reset = true) => {
//     if (!isAuthenticated || isLoadingNotifications) return;
//     setIsLoadingNotifications(true);
//     setNotificationError(null);
//     try {
//       const currentOffset = reset ? 0 : pagination.offset;
//       const response = await notificationApi.getNotifications(pagination.limit, currentOffset);
//       const data = response.notifications || response.data || [];
//       setNotifications(prev => reset ? data : [...prev, ...data]);
//       setPagination(prev => ({
//         limit: prev.limit,
//         offset: reset ? prev.limit : prev.offset + prev.limit,
//         total: response.total || data.length,
//         hasMore: data.length === prev.limit
//       }));
//       if (response.unreadCount !== undefined) setUnreadCount(response.unreadCount);
//     } catch (error) {
//       setNotificationError('Failed to load notifications');
//       console.error(error);
//     } finally {
//       setIsLoadingNotifications(false);
//     }
//   }, [isAuthenticated, isLoadingNotifications, pagination.limit, pagination.offset, setUnreadCount]);

//   useEffect(() => {
//     if (socket && isAuthenticated) {
//       const handleNewNotification = (notif) => {
//         setNotifications(prev => [notif, ...prev]);
//         setUnreadCount(prev => prev + 1);
//       };
//       socket.on('notification:new', handleNewNotification);
//       return () => socket.off('notification:new', handleNewNotification);
//     }
//   }, [socket, isAuthenticated, setUnreadCount]);

//   useEffect(() => {
//     if (isNotificationOpen && isAuthenticated && !isLoadingNotifications && notifications.length === 0 && !notificationError) {
//       fetchNotifications(true);
//     }
//   }, [isNotificationOpen, isAuthenticated]);

//   const markAsRead = async (id) => {
//     try {
//       await notificationApi.markAsRead(id);
//       setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
//       setUnreadCount(prev => Math.max(0, prev - 1));
//     } catch (err) { console.error(err); }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await notificationApi.markAllAsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
//       setUnreadCount(0);
//       toast.success('All notifications marked as read');
//     } catch (err) { toast.error('Failed'); }
//   };

//   const deleteNotification = async (id, e) => {
//     e.stopPropagation();
//     try {
//       const notif = notifications.find(n => n.id === id);
//       await notificationApi.deleteNotification(id);
//       setNotifications(prev => prev.filter(n => n.id !== id));
//       if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
//       toast.success('Deleted');
//     } catch (err) { toast.error('Failed'); }
//   };

//   const clearAllNotifications = async () => {
//     try {
//       await notificationApi.clearAllNotifications();
//       setNotifications([]);
//       setUnreadCount(0);
//       toast.success('Cleared');
//     } catch (err) { toast.error('Failed'); }
//   };

//   const handleNotificationClick = async (notif) => {
//     if (!notif.read) await markAsRead(notif.id);
//     if (notif.link) navigate(notif.link);
//     setIsNotificationOpen(false);
//   };

//   const loadMoreNotifications = () => {
//     if (pagination.hasMore && !isLoadingNotifications) fetchNotifications(false);
//   };

//   useEffect(() => {
//     const outsideClick = (e) => {
//       if (notificationRef.current && !notificationRef.current.contains(e.target)) setIsNotificationOpen(false);
//       if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileMenuOpen(false);
//     };
//     document.addEventListener('mousedown', outsideClick);
//     return () => document.removeEventListener('mousedown', outsideClick);
//   }, []);

//   useEffect(() => {
//     let timeout;
//     const handleScroll = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => setIsScrolled(window.scrollY > 10), 40);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timeout); };
//   }, []);

//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//     setIsProfileMenuOpen(false);
//     setIsNotificationOpen(false);
//   }, [location]);

//   const handleLogout = async () => {
//     await logout();
//     toast.success("Logged out");
//   };

//   const navItems = isAuthenticated ? [
//     { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     ...(hasRole(user, 'Admin', 'Manager') ? [{ name: "Users", href: "/users", icon: Users }] : []),
//     ...(hasRole(user, 'Admin') || hasDepartment(meta, 'HR') ? [{ name: "Recruitment", href: "/recruitment", icon: Briefcase }] : []),
//   ] : [
//     { name: "Home", href: "/", icon: Home },
//     { name: "Features", href: "/features", icon: Sparkles },
//     { name: "Pricing", href: "/pricing", icon: CreditCard },
//     { name: "Demo", href: "/demo", icon: PlayCircle },
//     { name: "About", href: "/about", icon: Info },
//     { name: "Docs", href: "/docs", icon: BookOpen },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <>
//       <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-lg border-b border-slate-200/20 dark:border-slate-700/30" : "bg-white dark:bg-slate-950"}`}>
//         <div className="px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
//               <motion.div whileHover={{ rotate: 10, scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
//                 <span className="text-white font-bold text-base">HR</span>
//               </motion.div>
//               <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HRMS</span>
//             </Link>

//             <nav className="hidden lg:flex items-center gap-1 ml-8">
//               {navItems.map(item => {
//                 const Icon = item.icon;
//                 return (
//                   <Link key={item.name} to={item.href} className="relative px-3 py-2 text-sm font-medium group">
//                     <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
//                       <Icon className="w-4 h-4" />
//                       <span>{item.name}</span>
//                     </div>
//                     {isActive(item.href) && (
//                       <motion.div layoutId="nav-indicator" className="absolute left-0 right-0 -bottom-1 h-[2px] bg-indigo-500 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
//                     )}
//                   </Link>
//                 );
//               })}
//             </nav>

//             <div className="flex items-center gap-2">
//               <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Toggle theme">
//                 <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
//                   {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
//                 </motion.div>
//               </motion.button>

//               {isAuthenticated && (
//                 <div className="relative" ref={notificationRef}>
//                   <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => setIsNotificationOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all" aria-label="Notifications">
//                     <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
//                     <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-900 ${unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
//                       {unreadCount > 99 ? '99+' : unreadCount}
//                     </span>
//                   </motion.button>

//                   <AnimatePresence>
//                     {isNotificationOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 z-50">
//                         <div className="p-4 border-b border-slate-100 dark:border-slate-800">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
//                               {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full">{unreadCount} new</span>}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               {unreadCount > 0 && <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Mark all as read"><CheckCheck className="w-4 h-4 text-slate-500" /></button>}
//                               {notifications.length > 0 && <button onClick={clearAllNotifications} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Clear all"><Trash2 className="w-4 h-4 text-slate-500" /></button>}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="max-h-[400px] overflow-y-auto">
//                           {isLoadingNotifications ? (
//                             <div className="p-4 space-y-3">
//                               {[1, 2, 3].map(i => (
//                                 <div key={i} className="animate-pulse flex gap-3 p-3">
//                                   <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
//                                   <div className="flex-1 space-y-2">
//                                     <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
//                                     <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
//                                     <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : notificationError ? (
//                             <div className="p-8 text-center">
//                               <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
//                               <p className="text-slate-600 dark:text-slate-400">{notificationError}</p>
//                               <button onClick={() => fetchNotifications(true)} className="mt-3 text-sm text-indigo-600">Retry</button>
//                             </div>
//                           ) : notifications.length === 0 ? (
//                             <div className="p-8 text-center">
//                               <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
//                               <p className="text-slate-600 dark:text-slate-400">No notifications</p>
//                             </div>
//                           ) : (
//                             <>
//                               {notifications.map(notif => {
//                                 const config = getNotificationConfig(notif.type);
//                                 const Icon = config.icon;
//                                 return (
//                                   <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//                                     className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group ${!notif.read ? config.bgColor : ''}`}
//                                     onClick={() => handleNotificationClick(notif)}
//                                   >
//                                     <div className="flex gap-3">
//                                       <div className={`shrink-0 ${config.color}`}><Icon className="w-5 h-5" /></div>
//                                       <div className="flex-1 min-w-0">
//                                         <div className="flex items-start justify-between">
//                                           <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p>
//                                           <div className="flex items-center gap-1">
//                                             {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
//                                             <button onClick={(e) => deleteNotification(notif.id, e)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-3 h-3" /></button>
//                                           </div>
//                                         </div>
//                                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
//                                         <p className="text-xs text-slate-400 mt-1">
//                                           {formatDistanceToNow(new Date(notif.createdAt || new Date()), { addSuffix: true })}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </motion.div>
//                                 );
//                               })}
//                               {pagination.hasMore && (
//                                 <div className="p-3 border-t border-slate-100 dark:border-slate-800">
//                                   <button onClick={loadMoreNotifications} disabled={isLoadingNotifications}
//                                     className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium disabled:opacity-50">
//                                     {isLoadingNotifications ? 'Loading...' : 'Load more'}
//                                   </button>
//                                 </div>
//                               )}
//                             </>
//                           )}
//                         </div>

//                         {notifications.length > 0 && (
//                           <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
//                             <Link to="/notifications" onClick={() => setIsNotificationOpen(false)}
//                               className="block text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
//                               View all notifications
//                             </Link>
//                           </div>
//                         )}
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               )}

//               {isLoading ? (
//                 <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
//               ) : isAuthenticated ? (
//                 <div className="relative" ref={profileRef}>
//                   <button onClick={() => setIsProfileMenuOpen(prev => !prev)}
//                     className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
//                     <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium ring-1 ring-white/30">
//                       {getInitials(user)}
//                     </div>
//                     <span className="hidden sm:inline text-sm font-medium">{getUserDisplayName(user)}</span>
//                     <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
//                   </button>

//                   <AnimatePresence>
//                     {isProfileMenuOpen && (
//                       <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                         className="absolute right-0 mt-3 w-72 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 z-50">
//                         <div className="p-4 border-b border-slate-100 dark:border-slate-800">
//                           <div className="flex items-center gap-3">
//                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-4 ring-indigo-100 dark:ring-indigo-900/30">
//                               {getInitials(user)}
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.fullName || getUserDisplayName(user)}</p>
//                               <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
//                               <div className="flex items-center gap-2 mt-1">
//                                 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(user?.primaryRole || meta?.role)}`}>
//                                   {user?.primaryRole || meta?.role || 'Employee'}
//                                 </span>
//                                 {meta?.department && (
//                                   <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
//                                     {meta.department}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                           {meta?.isActive && (
//                             <div className="flex items-center gap-1 mt-3 text-xs">
//                               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
//                               <span className="text-green-600 dark:text-green-400">Active</span>
//                             </div>
//                           )}
//                         </div>
//                         <div className="p-2">
//                           <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><LayoutDashboard className="w-4 h-4" /><span className="flex-1">Dashboard</span></Link>
//                           <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><User className="w-4 h-4" /><span className="flex-1">Profile</span></Link>
//                           <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><Settings className="w-4 h-4" /><span className="flex-1">Settings</span></Link>
//                           <Link to="/help" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"><HelpCircle className="w-4 h-4" /><span className="flex-1">Help & Support</span></Link>
//                           <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
//                           <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut className="w-4 h-4" /><span className="flex-1 text-left">Logout</span></button>
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               ) : (
//                 <div className="hidden sm:flex items-center gap-2">
//                   <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">Login</Link>
//                   <Link to="/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25">Sign Up</Link>
//                 </div>
//               )}
//               <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open menu">
//                 <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
//             <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
//               <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><span className="text-white font-bold text-sm">HR</span></div>
//                   <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HRMS</span>
//                 </div>
//                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
//               </div>
//               <div className="flex-1 overflow-y-auto p-4">
//                 <div className="space-y-1">
//                   {navItems.map(item => {
//                     const Icon = item.icon;
//                     return (
//                       <Link key={item.name} to={item.href} onClick={() => setIsMobileMenuOpen(false)}
//                         className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive(item.href) ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
//                         <Icon className="w-5 h-5" /><span className="font-medium">{item.name}</span>
//                       </Link>
//                     );
//                   })}
//                 </div>
//                 {!isAuthenticated && (
//                   <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
//                     <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30">Login</Link>
//                     <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg">Sign Up</Link>
//                   </div>
//                 )}
//               </div>
//               {isAuthenticated && (
//                 <div className="p-4 border-t border-slate-100 dark:border-slate-800">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">{getInitials(user)}</div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-slate-900 dark:text-white truncate">{getUserDisplayName(user)}</p>
//                       <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
//                     </div>
//                   </div>
//                   <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
//                     className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/30">
//                     <LogOut className="w-4 h-4" />Logout
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, Settings, HelpCircle, ChevronDown,
  Sparkles, Home, Info, PlayCircle, Bell, Moon, Sun,
  LayoutDashboard, User, CheckCheck, Trash2, Loader2,
  CheckCircle, Clock, AlertCircle, MessageSquare, Calendar,
  Receipt, Users, CreditCard, BookOpen, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import notificationApi from "../../api/notificationApi";
import { formatDistanceToNow } from "date-fns";
import { useSocket } from '../../context/SocketContext';
import { AUTH_NAVIGATION, PUBLIC_NAVIGATION } from "../../config/navigation";

// ─── Notification type config ─────────────────────────────────────────────────
const notificationTypeConfig = {
  leave_approved: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/20' },
  leave_rejected: { icon: X, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20' },
  leave_requested: { icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/20' },
  expense_approved: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-950/20' },
  expense_rejected: { icon: X, color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-950/20' },
  expense_submitted: { icon: Receipt, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' },
  payroll_processed: { icon: CreditCard, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-950/20' },
  team_message: { icon: MessageSquare, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-950/20' },
  user_joined: { icon: Users, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-950/20' },
  system_alert: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50 dark:bg-orange-950/20' },
  default: { icon: Bell, color: 'text-gray-500', bgColor: 'bg-gray-50 dark:bg-gray-800/50' }
};

const getNotificationConfig = (type) => notificationTypeConfig[type] || notificationTypeConfig.default;

// ─── User helpers ─────────────────────────────────────────────────────────────
const getInitials = (user) => {
  if (!user) return 'U';
  if (user.fullName) return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (user.email) return user.email[0].toUpperCase();
  return 'U';
};
const getUserDisplayName = (user) => {
  if (!user) return 'User';
  if (user.fullName) return user.fullName.split(' ')[0];
  if (user.email) return user.email.split('@')[0];
  return 'User';
};
const getRoleColor = (role) => {
  const colors = { Admin: 'from-red-500 to-pink-500', Manager: 'from-blue-500 to-cyan-500', HR: 'from-purple-500 to-indigo-500', Employee: 'from-green-500 to-emerald-500' };
  return colors[role] || 'from-gray-500 to-slate-500';
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0, hasMore: true });

  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { user, meta, isAuthenticated, isLoading, logout } = useAuth();
  const isDarkMode = theme === "dark";
  const { unreadCount, setUnreadCount, socket } = useSocket();

  // ── Navigation items derived from central config ──────────────────────────
  const headerNavItems = isAuthenticated
    ? AUTH_NAVIGATION.filter(item => {
      if (!item.showInHeader) return false;
      if (item.name === 'Users Management') {
        return user?.primaryRole === 'Admin' || user?.primaryRole === 'Manager';
      }
      if (item.name === 'Recruitment') {
        return (
          user?.primaryRole === 'Admin' ||
          user?.primaryRole === 'HR' ||
          meta?.department === 'HR'
        );
      }
      return (
        item.roles?.includes(user?.primaryRole) ||
        (item.department && item.department.includes(meta?.department))
      );
    })
    : PUBLIC_NAVIGATION;

  // ── Event handlers (unchanged) ────────────────────────────────────────────
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!isAuthenticated || isLoadingNotifications) return;
    setIsLoadingNotifications(true);
    setNotificationError(null);
    try {
      const currentOffset = reset ? 0 : pagination.offset;
      const response = await notificationApi.getNotifications(pagination.limit, currentOffset);
      const data = response.notifications || response.data || [];
      setNotifications(prev => reset ? data : [...prev, ...data]);
      setPagination(prev => ({
        limit: prev.limit,
        offset: reset ? prev.limit : prev.offset + prev.limit,
        total: response.total || data.length,
        hasMore: data.length === prev.limit
      }));
      if (response.unreadCount !== undefined) setUnreadCount(response.unreadCount);
    } catch (error) {
      setNotificationError('Failed to load notifications');
      console.error(error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAuthenticated, isLoadingNotifications, pagination.limit, pagination.offset, setUnreadCount]);

  useEffect(() => {
    if (socket && isAuthenticated) {
      const handleNewNotification = (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      };
      socket.on('notification:new', handleNewNotification);
      return () => socket.off('notification:new', handleNewNotification);
    }
  }, [socket, isAuthenticated, setUnreadCount]);

  useEffect(() => {
    if (isNotificationOpen && isAuthenticated && !isLoadingNotifications && notifications.length === 0 && !notificationError) {
      fetchNotifications(true);
    }
  }, [isNotificationOpen, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) { toast.error('Failed'); }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const notif = notifications.find(n => n.id === id);
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Deleted');
    } catch (err) { toast.error('Failed'); }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationApi.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Cleared');
    } catch (err) { toast.error('Failed'); }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) await markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
    setIsNotificationOpen(false);
  };

  const loadMoreNotifications = () => {
    if (pagination.hasMore && !isLoadingNotifications) fetchNotifications(false);
  };

  useEffect(() => {
    const outsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setIsNotificationOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', outsideClick);
    return () => document.removeEventListener('mousedown', outsideClick);
  }, []);

  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolled(window.scrollY > 10), 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-lg border-b border-slate-200/20 dark:border-slate-700/30" : "bg-white dark:bg-slate-950"}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
              <motion.div whileHover={{ rotate: 10, scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base">HR</span>
              </motion.div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HRMS</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {headerNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href} className="relative px-3 py-2 text-sm font-medium group">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isActive(item.href) && (
                      <motion.div layoutId="nav-indicator" className="absolute left-0 right-0 -bottom-1 h-[2px] bg-indigo-500 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Toggle theme">
                <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
                </motion.div>
              </motion.button>

              {/* Notification bell */}
              {isAuthenticated && (
                <div className="relative" ref={notificationRef}>
                  <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => setIsNotificationOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all" aria-label="Notifications">
                    <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-slate-900 ${unreadCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                              {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full">{unreadCount} new</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {unreadCount > 0 && <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Mark all as read"><CheckCheck className="w-4 h-4 text-slate-500" /></button>}
                              {notifications.length > 0 && <button onClick={clearAllNotifications} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Clear all"><Trash2 className="w-4 h-4 text-slate-500" /></button>}
                            </div>
                          </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                          {isLoadingNotifications ? (
                            <div className="p-4 space-y-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex gap-3 p-3">
                                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : notificationError ? (
                            <div className="p-8 text-center">
                              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                              <p className="text-slate-600 dark:text-slate-400">{notificationError}</p>
                              <button onClick={() => fetchNotifications(true)} className="mt-3 text-sm text-indigo-600">Retry</button>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                              <p className="text-slate-600 dark:text-slate-400">No notifications</p>
                            </div>
                          ) : (
                            <>
                              {notifications.map(notif => {
                                const config = getNotificationConfig(notif.type);
                                const Icon = config.icon;
                                return (
                                  <motion.div key={notif.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group ${!notif.read ? config.bgColor : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                  >
                                    <div className="flex gap-3">
                                      <div className={`shrink-0 ${config.color}`}><Icon className="w-5 h-5" /></div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                          <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.title}</p>
                                          <div className="flex items-center gap-1">
                                            {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                                            <button onClick={(e) => deleteNotification(notif.id, e)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-3 h-3" /></button>
                                          </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                          {formatDistanceToNow(new Date(notif.createdAt || new Date()), { addSuffix: true })}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                              {pagination.hasMore && (
                                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                                  <button onClick={loadMoreNotifications} disabled={isLoadingNotifications}
                                    className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium disabled:opacity-50">
                                    {isLoadingNotifications ? 'Loading...' : 'Load more'}
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <Link to="/notifications" onClick={() => setIsNotificationOpen(false)}
                              className="block text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                              View all notifications
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* User avatar / login buttons */}
              {isLoading ? (
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setIsProfileMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium ring-1 ring-white/30">
                      {getInitials(user)}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{getUserDisplayName(user)}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg ring-4 ring-indigo-100 dark:ring-indigo-900/30">
                              {getInitials(user)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.fullName || getUserDisplayName(user)}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(user?.primaryRole || meta?.role)}`}>
                                  {user?.primaryRole || meta?.role || 'Employee'}
                                </span>
                                {meta?.department && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {meta.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {meta?.isActive && (
                            <div className="flex items-center gap-1 mt-3 text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-green-600 dark:text-green-400">Active</span>
                            </div>
                          )}
                        </div>
                          <div className="p-2 max-h-[420px] overflow-y-auto">
                            {AUTH_NAVIGATION.filter(item => {
                              if (!item.showInSidebar) return false;

                              if (item.name === 'Users Management') {
                                return (
                                  user?.primaryRole === 'Admin' ||
                                  user?.primaryRole === 'Manager'
                                );
                              }

                              if (item.name === 'Recruitment') {
                                return (
                                  user?.primaryRole === 'Admin' ||
                                  user?.primaryRole === 'HR' ||
                                  meta?.department === 'HR'
                                );
                              }

                              return (
                                item.roles?.includes(user?.primaryRole) ||
                                (item.department &&
                                  item.department.includes(meta?.department))
                              );
                            }).map((item) => {
                              const Icon = item.icon;

                              return (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => setIsProfileMenuOpen(false)}
                                  className={`flex items-center gap-3 p-3 rounded-xl transition-all
          ${isActive(item.href)
                                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }
        `}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="flex-1 text-sm font-medium">
                                    {item.name}
                                  </span>
                                </Link>
                              );
                            })}

                            <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                            <button
                              onClick={() => {
                                setIsProfileMenuOpen(false);
                                handleLogout();
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl
    text-red-600 dark:text-red-400
    hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <LogOut className="w-4 h-4" />
                              <span className="flex-1 text-left font-medium">
                                Logout
                              </span>
                            </button>
                          </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">Login</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25">Sign Up</Link>
                </div>
              )}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open menu">
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><span className="text-white font-bold text-sm">HR</span></div>
                  <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HRMS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {headerNavItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} to={item.href} onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive(item.href) ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <Icon className="w-5 h-5" /><span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                {!isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30">Login</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg">Sign Up</Link>
                  </div>
                )}
              </div>
              {isAuthenticated && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">{getInitials(user)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{getUserDisplayName(user)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/30">
                    <LogOut className="w-4 h-4" />Logout
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};