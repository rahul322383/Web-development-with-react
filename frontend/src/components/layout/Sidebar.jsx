

// import React from 'react';
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
//   UserPlus
// } from 'lucide-react';
// import useAuthStore from '../../store/authStore';
// import { authApi } from '../../api/authApi';
// import { toast } from 'sonner';

// export const Sidebar = ({ isOpen, onClose }) => {
//   const location = useLocation();
//   const logout = useAuthStore((state) => state.logout);
//   const user = useAuthStore((state) => state.user);
//   const navigate = useNavigate();
//   const isAuthenticated = !!user;

//   // Navigation for authenticated users
//   const authenticatedNavigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//     { name: 'Users', href: '/users', icon: Users },
//     { name: 'Leave', href: '/leave', icon: Calendar },
//     { name: 'Expenses', href: '/expenses', icon: Receipt },
//     { name: 'Payroll', href: '/payroll', icon: DollarSign },
//     { name: 'Notifications', href: '/notifications', icon: Bell }
//   ];

//   // Navigation for non-authenticated users
//   const publicNavigation = [
//     { name: 'Home', href: '/', icon: Home },
//     { name: 'Features', href: '/features', icon: Sparkles },
//     { name: 'Pricing', href: '/pricing', icon: CreditCard },
//     { name: 'Demo', href: '/demo', icon: PlayCircle },
//     { name: 'About', href: '/about', icon: Info },
//     { name: 'Blog', href: '/blog', icon: BookOpen },
//     { name: 'Careers', href: '/careers', icon: Briefcase }
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
//       await authApi.logout();
//       logout();
//       toast.success('Logged out successfully');
//       navigate('/', { replace: true });
//     } catch (error) {
//       logout();
//       toast.error('Logout failed, but you have been signed out locally');
//       navigate('/', { replace: true });
//     }
//   };

//   const navigation = isAuthenticated ? authenticatedNavigation : publicNavigation;

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
//           onClick={onClose}
//           data-testid="sidebar-overlay"
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white
//           transition-transform duration-300 ease-in-out
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//         `}
//         data-testid="sidebar"
//       >
//         <div className="flex h-full flex-col">
//           {/* Logo */}
//           <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
           
//             <button
//               onClick={onClose}
//               className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
//               data-testid="sidebar-close-button"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
//             {navigation.map((item) => {
//               const isActive = location.pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   onClick={onClose}
//                   data-testid={`nav-${item.name.toLowerCase()}`}
//                   className={`
//                     group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium
//                     transition-all duration-200
//                     ${
//                       isActive
//                         ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-600 dark:text-indigo-400'
//                         : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
//                     }
//                   `}
//                 >
//                   <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
//                     isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
//                   }`} />
//                   <span>{item.name}</span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* User section for authenticated users */}
//           {isAuthenticated ? (
//             <div className="border-t border-slate-200 dark:border-slate-800 p-4">
//               <div className="flex items-center space-x-3 mb-3">
//                 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
//                   <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
//                     {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
//                   </span>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-slate-900 dark:text-white truncate" data-testid="sidebar-user-name">
//                     {user?.name || 'User'}
//                   </p>
//                   <p className="text-xs text-slate-500 dark:text-slate-400 truncate" data-testid="sidebar-user-role">
//                     {user?.role || 'Employee'}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 data-testid="sidebar-logout-button"
//                 className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors group"
//               >
//                 <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                 <span>Logout</span>
//               </button>
//             </div>
//           ) : (
//             /* Footer links for non-authenticated users */
//             <div className="border-t border-slate-200 dark:border-slate-800 p-4">
//               {/* Legal & Help Links */}
//               <div className="grid grid-cols-2 gap-2 mb-4">
//                 {footerLinks.map((link) => (
//                   <Link
//                     key={link.name}
//                     to={link.href}
//                     onClick={onClose}
//                     className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
//                   >
//                     <link.icon className="h-3 w-3" />
//                     <span>{link.name}</span>
//                   </Link>
//                 ))}
//               </div>

//               {/* Auth Buttons */}
//               <div className="space-y-2">
//                 <Link
//                   to="/login"
//                   onClick={onClose}
//                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors group"
//                 >
//                   <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                   <span>Login</span>
//                 </Link>
//                 <Link
//                   to="/register"
//                   onClick={onClose}
//                   className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all group"
//                 >
//                   <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
//                   <span>Sign Up</span>
//                 </Link>
//               </div>

//               {/* Copyright */}
             
//             </div>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };

// src/components/Sidebar.jsx

import React from 'react';
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
  UserPlus
} from 'lucide-react';
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import { toast } from 'sonner';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth(); // Get auth state from context

  // Navigation for authenticated users
  const authenticatedNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Leave', href: '/leave', icon: Calendar },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Payroll', href: '/payroll', icon: DollarSign },
    { name: 'Notifications', href: '/notifications', icon: Bell }
  ];

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
      await logout(); // Use the logout function from AuthContext
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Logout failed, but you have been signed out locally');
      navigate('/', { replace: true });
    }
  };

  const navigation = isAuthenticated ? authenticatedNavigation : publicNavigation;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-200 bg-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        data-testid="sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            {/* Your logo here */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              data-testid="sidebar-close-button"
            >
              <X className="h-5 w-5" />
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
                  onClick={onClose}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={`
                    group flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : ''
                  }`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section for authenticated users */}
          {isAuthenticated ? (
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate" data-testid="sidebar-user-name">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate" data-testid="sidebar-user-role">
                    {user?.role || 'Employee'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                data-testid="sidebar-logout-button"
                className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Footer links for non-authenticated users */
            <div className="border-t border-slate-200 p-4">
              {/* Legal & Help Links */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={onClose}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
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
                  onClick={onClose}
                  className="w-full flex items-center justify-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors group"
                >
                  <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={onClose}
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