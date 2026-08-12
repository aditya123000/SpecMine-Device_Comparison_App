import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import Navbar from "../components/Global-components/Navbar";
import Footer from "../components/Global-components/Footer";
import ScrollToTop from "../components/Global-components/ScrollToTop";
import { useCompare } from "../pages/compare/context/useCompare";

const MainLayout = () => {
  const location = useLocation();
  const { compareError } = useCompare();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-900 dark:text-slate-50">
      <Navbar />

      {compareError && (
        <div className="fixed top-20 inset-x-0 z-[100] flex justify-center pointer-events-none px-4">
          <div className="animate-toast max-w-md w-full rounded-2xl border border-amber-400/60 bg-amber-50/95 p-4 text-amber-950 shadow-xl backdrop-blur dark:border-amber-500/30 dark:bg-slate-900/95 dark:text-amber-200 pointer-events-auto">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl text-amber-500 shrink-0" />
              <p className="text-sm font-medium leading-snug">{compareError}</p>
            </div>
          </div>
        </div>
      )}

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
