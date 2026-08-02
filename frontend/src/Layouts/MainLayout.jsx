import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Global-components/Navbar";
import Footer from "../components/Global-components/Footer";
import ScrollToTop from "../components/Global-components/ScrollToTop";

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 pb-28 pt-24">
        <div key={location.pathname} className="animate-fade-in">
          <ScrollToTop />
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
