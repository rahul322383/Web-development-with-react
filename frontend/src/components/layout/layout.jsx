import { Outlet } from "react-router-dom";
import { Sidebar } from "../layout/Sidebar";
import { useState } from "react";
import { Header } from "../layout/Header";
import {Footer } from "../layout/Footer";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <main className="flex-1 lg:ml-64">
        {/* <Header /> */}
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;