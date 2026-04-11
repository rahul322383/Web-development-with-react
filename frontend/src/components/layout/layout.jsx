// // // // import { Outlet } from "react-router-dom";
// // // // import { Sidebar } from "../layout/Sidebar";
// // // // import { useState } from "react";
// // // // import { Header } from "../layout/Header";
// // // // import {Footer } from "../layout/Footer";

// // // // const MainLayout = () => {
// // // //   const [isOpen, setIsOpen] = useState(false);

// // // //   return (
// // // //     <div className="flex">
// // // //       <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

// // // //       <main className="flex-1 lg:ml-64">
// // // //         {/* <Header /> */}
// // // //         <Outlet />
// // // //         <Footer />
// // // //       </main>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default MainLayout;

// // // // Layout.jsx or App.jsx
// // // import React, { useState } from 'react';
// // // import { Sidebar } from "../layout/Sidebar";
// // // import { Menu } from 'lucide-react';

// // // const Layout = ({ children }) => {
// // //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

// // //   return (
// // //     <div className="min-h-screen bg-slate-50">
// // //       {/* Mobile menu button - only visible on mobile */}
// // //       <button
// // //         onClick={() => setIsSidebarOpen(true)}
// // //         className="fixed top-4 left-4 z-20 lg:hidden p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
// // //       >
// // //         <Menu className="h-5 w-5 text-slate-600" />
// // //       </button>

// // //       <Sidebar 
// // //         isOpen={isSidebarOpen} 
// // //         onClose={() => setIsSidebarOpen(false)} 
// // //       />

// // //       {/* Main content with margin for desktop */}
// // //       <main className="lg:ml-64 min-h-screen">
// // //         <div className="container mx-auto px-4 py-8">
// // //           {children}
// // //         </div>
// // //       </main>
// // //     </div>
// // //   );
// // // };

// // // export default Layout;

// // import React, { useState, useEffect } from 'react';
// // import { Sidebar } from "../layout/Sidebar";
// // import { Menu } from 'lucide-react';
// // import { useLocation } from "react-router-dom";
// // import { Footer } from "../layout/Footer";
// // import { Outlet } from "react-router-dom";
// // import  {Header}  from "../layout/Header";

// // const Layout = ({ children }) => {
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const location = useLocation();

// //   // ✅ Close sidebar on route change
// //   useEffect(() => {
// //     setIsSidebarOpen(false);
// //   }, [location]);

// //   // ✅ Prevent background scroll when sidebar open
// //   useEffect(() => {
// //     document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
// //   }, [isSidebarOpen]);

// //   return (
// //     <div className="min-h-screen bg-slate-50">
      
// //       {/* Mobile menu button */}
// //       <button
// //         aria-label="Open menu"
// //         onClick={() => setIsSidebarOpen(true)}
// //         className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition"
// //       >
// //         <Menu className="h-5 w-5 text-slate-600" />
// //       </button>

// //       {/* Sidebar */}
// //       <Sidebar 
// //         isOpen={isSidebarOpen} 
// //         onClose={() => setIsSidebarOpen(false)} 
// //       />

// //       {/* Main content */}
// //       <main className="lg:ml-64 min-h-screen">
// //         <div className="container mx-auto px-4 py-8">
// //           <Header />
// //            <Outlet />
// //            <Footer />
// //           {children}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Layout;

// import React, { useState, useEffect } from "react";
// import { Sidebar } from "../layout/Sidebar";
// import { Menu } from "lucide-react";
// import { useLocation } from "react-router-dom";
// import { Outlet } from "react-router-dom";
// import { Header } from "../layout/Header";
// import { Footer } from "../layout/Footer";

// const Layout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const location = useLocation();

//   // close sidebar on route change
//   useEffect(() => {
//     setIsSidebarOpen(false);
//   }, [location]);

//   // lock body scroll when sidebar open
//   useEffect(() => {
//     document.documentElement.style.overflow = isSidebarOpen ? "hidden" : "auto";
//   }, [isSidebarOpen]);

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

//       {/* MOBILE MENU BUTTON */}
//       <button
//         aria-label="Open menu"
//         onClick={() => setIsSidebarOpen(true)}
//         className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl 
//                    bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl 
//                    shadow-md border border-white/10"
//       >
//         <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
//       </button>

//       {/* SIDEBAR */}
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//       />

//       {/* MAIN APP AREA */}
//       <div className="lg:pl-64 flex flex-col min-h-screen">

//         {/* HEADER (sticky SaaS style) */}
//         <div className="sticky top-0 z-40">
//           <Header />
//         </div>

//         {/* PAGE CONTENT */}
//         <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8 pb-10">
//           <div className="max-w-7xl mx-auto animate-fadeIn">
//             <Outlet />
//           </div>
//         </main>

//         {/* FOOTER */}
//         <Footer />
//       </div>

//       {/* MOBILE OVERLAY (optional enhancement UX layer) */}
//       {isSidebarOpen && (
//         <div
//           onClick={() => setIsSidebarOpen(false)}
//           className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
//         />
//       )}
//     </div>
//   );
// };

// export default Layout;

// // import { Outlet } from "react-router-dom";
// // import { Sidebar } from "../layout/Sidebar";
// // import { useState } from "react";
// // import { Header } from "../layout/Header";
// // import {Footer } from "../layout/Footer";

// // const MainLayout = () => {
// //   const [isOpen, setIsOpen] = useState(false);

// //   return (
// //     <div className="flex">
// //       <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

// //       <main className="flex-1 lg:ml-64">
// //         {/* <Header /> */}
// //         <Outlet />
// //         <Footer />
// //       </main>
// //     </div>
// //   );
// // };

// // export default MainLayout;

// // Layout.jsx or App.jsx
// import React, { useState } from 'react';
// import { Sidebar } from "../layout/Sidebar";
// import { Menu } from 'lucide-react';

// const Layout = ({ children }) => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Mobile menu button - only visible on mobile */}
//       <button
//         onClick={() => setIsSidebarOpen(true)}
//         className="fixed top-4 left-4 z-20 lg:hidden p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors"
//       >
//         <Menu className="h-5 w-5 text-slate-600" />
//       </button>

//       <Sidebar 
//         isOpen={isSidebarOpen} 
//         onClose={() => setIsSidebarOpen(false)} 
//       />

//       {/* Main content with margin for desktop */}
//       <main className="lg:ml-64 min-h-screen">
//         <div className="container mx-auto px-4 py-8">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;

import React, { useState, useEffect } from 'react';
import { Sidebar } from "../layout/Sidebar";
import { Menu } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { Footer } from "../layout/Footer";
import { Outlet } from "react-router-dom";
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // ✅ Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // ✅ Prevent background scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Mobile menu button */}
      <button
        aria-label="Open menu"
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8">
           <Outlet />
           <Footer />
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;