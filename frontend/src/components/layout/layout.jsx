import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from "./Sidebar";
import { Menu } from 'lucide-react';
import { useLocation, Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );

  const location = useLocation();
  const { theme } = useTheme();
  const { meta } = useAuth();

  const pendingCount = meta?.pendingLeaves ?? 0;
  const isDark = theme === 'dark';

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]); // pathname only — avoids re-running on search/hash changes

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; }; // cleanup on unmount
  }, [isSidebarOpen]);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-slate-50'}`}>
      {/* Mobile menu toggle */}
      <button
        aria-label="Open menu"
        onClick={openSidebar}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg shadow-md transition-colors ${isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-white hover:bg-slate-50 text-slate-600'
          }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onCollapseChange={setIsSidebarCollapsed}
        pendingCount={pendingCount}
      />

      <main
        className={`min-h-screen transition-all duration-300 ml-0 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
          }`}
      >
        <div className="container mx-auto px-4 py-8">
          <Header />
          <Outlet />
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default Layout;