import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4 sm:flex-row sm:gap-0 sm:justify-between sm:items-center text-sm text-slate-400">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} SpecMine. All rights reserved.
        </p>
        <div className="flex justify-center sm:justify-end gap-6">
          <span className="hover:text-slate-200 cursor-pointer">
            Privacy
          </span>
          <span className="hover:text-slate-200 cursor-pointer">
            Terms
          </span>
          <span className="hover:text-slate-200 cursor-pointer">
            Contact
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
