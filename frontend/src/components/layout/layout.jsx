
// import React, { useState, useEffect } from 'react';
// import { Sidebar } from "./Sidebar";
// import { Menu } from 'lucide-react';
// import { useLocation, Outlet } from "react-router-dom";
// import { Footer } from "./Footer";
// import { Header } from "./Header";
// import { useTheme } from "../../context/ThemeContext";

// const Layout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
//     () => localStorage.getItem('sidebar-collapsed') === 'true'
//   );
//   const location = useLocation();
//   const { theme } = useTheme();

//   useEffect(() => {
//     setIsSidebarOpen(false);
//   }, [location]);

//   useEffect(() => {
//     document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
//   }, [isSidebarOpen]);

//   return (
//     <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-slate-50'}`}>
//       <button
//         aria-label="Open menu"
//         onClick={() => setIsSidebarOpen(true)}
//         className={`fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg shadow-md ${theme === 'dark'
//             ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
//             : 'bg-white hover:bg-slate-50 text-slate-600'
//           }`}
//       >
//         <Menu className="h-5 w-5" />
//       </button>

//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         onCollapseChange={setIsSidebarCollapsed}
//       />

//       <main
//         className={`min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
//           }`}
//       >
//         <div className="container mx-auto px-4 py-8">
//           <Header />
//           <Outlet />
//           <Footer />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;

import React, { useState, useEffect } from 'react';
import { Sidebar } from "./Sidebar";
import { Menu } from 'lucide-react';
import { useLocation, Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext"; // 👈 for pendingCount

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const location = useLocation();
  const { theme } = useTheme();
  const { meta } = useAuth(); // adjust if pending count comes from a different source

  // Example: read pending leaves count from meta (adjust key to match your API)
  const pendingCount = meta?.pendingLeaves ?? 0;

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
        className={`fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg shadow-md ${theme === 'dark'
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-white hover:bg-slate-50 text-slate-600'
          }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onCollapseChange={setIsSidebarCollapsed}
        pendingCount={pendingCount}
      />

      {/* ml-0 ensures full width on mobile, then responsive left margin on lg+ */}
      <main
        className={`
          min-h-screen transition-all duration-300
          ml-0
          ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
        `}
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