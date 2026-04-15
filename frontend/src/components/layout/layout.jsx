

// components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Sidebar } from "./Sidebar";
import { Menu } from 'lucide-react';
import { useLocation, Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import {Header } from "./Header";
import { useTheme } from "../../context/ThemeContext";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-slate-50'}`}>
      <button
        aria-label="Open menu"
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg shadow-md transition ${
          theme === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-white hover:bg-slate-50 text-slate-600'
        }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="lg:ml-72 min-h-screen">
        <div className="container mx-auto px-4 py-8">
            <Header />
          <Outlet />
          <Footer />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;