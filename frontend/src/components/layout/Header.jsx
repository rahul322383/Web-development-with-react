

// Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Home,
  Info,
  PlayCircle,
  Bell,
  Moon,
  Sun,
  LayoutDashboard,
  User,
} from "lucide-react";

import useAuthStore from "../../store/authStore";
import { authApi } from "../../api/authApi";
import { toast } from "sonner";
import { useTheme } from "../../context/ThemeContext";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = !!user;

  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  // scroll effect (smooth + optimized)
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 10);
      }, 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      logout(); // Force logout even if API fails
      toast.error("Logout failed, but you have been signed out");
      navigate("/");
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Features", href: "/features", icon: Sparkles },
    { name: "Demo", href: "/demo", icon: PlayCircle },
    { name: "About", href: "/about", icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-lg border-b border-slate-200/20 dark:border-slate-700/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">H</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                HRMS
              </span>
            </Link>

            {/* DESKTOP NAV - hidden on mobile, shown on lg screens */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative px-4 py-2 text-sm font-medium group"
                  >
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute left-0 right-0 -bottom-1 h-[2px] bg-indigo-500 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              {/* THEME TOGGLE */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-black/50 transition-all"
                aria-label="Toggle theme"
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-700" />
                  )}
                </motion.div>
              </motion.button>

              {/* NOTIFICATION - only for authenticated users */}
              {isAuthenticated && (
                <button className="p-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 relative hover:bg-white/80 dark:hover:bg-black/50 transition-all">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-900" />
                </button>
              )}

              {/* PROFILE / AUTH BUTTONS */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name?.split(" ")[0] || "User"}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 z-50"
                        >
                          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user?.name || user?.email?.split("@")[0] || "User"}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <div className="p-2">
                            <Link
                              to="/dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              to="/settings"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                            <Link
                              to="/profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center gap-2 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </Link>
                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-full bg-white/50 dark:bg-black/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-black/50 transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">H</span>
                  </div>
                  <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    HRMS
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Drawer Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                          active
                            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Auth section for mobile */}
                {!isAuthenticated && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* User info for authenticated users in mobile drawer */}
              {isAuthenticated && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {user?.name || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
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