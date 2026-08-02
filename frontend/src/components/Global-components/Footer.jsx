import React from "react";

const Footer = () => {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200/70 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-slate-700/70 dark:bg-slate-900/75 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} SpecMine. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 sm:justify-end">
          <span className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">Privacy</span>
          <span className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">Terms</span>
          <span className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">Contact</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
