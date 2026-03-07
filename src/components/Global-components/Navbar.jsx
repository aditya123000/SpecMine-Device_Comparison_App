import React from "react";
import { NavLink } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/useTheme";


const linkClass=({isActive}) =>
  isActive
    ? "text-sky-600 dark:text-sky-400 font-semibold"
    : "text-slate-700 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left side: Logo + Brand */}
        <div className="flex items-center gap-3">
          <img
            className="size-11"
            src="/src/assets/logo.png"
            alt="SpecMine logo"
          />
          <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            SpecMine
          </h1>
        </div>

        {/* Right side: Nav links */}
        <ul className="flex items-center gap-6 font-semibold">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/devices" end className={linkClass}>Devices</NavLink>
          <NavLink to="/compare" end className={linkClass}>Compare</NavLink>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="group relative inline-flex h-9 w-[78px] items-center rounded-full border border-slate-400 bg-gradient-to-r from-amber-200 to-sky-200 p-1 shadow-md ring-1 ring-slate-300/70 transition hover:shadow-lg dark:border-slate-600 dark:from-slate-800 dark:to-slate-700 dark:ring-slate-700/70"
          >
            <span className="absolute left-2 text-amber-600 transition-opacity group-hover:opacity-100 dark:text-amber-400">
              <FiSun className="text-sm" />
            </span>
            <span className="absolute right-2 text-slate-600 transition-opacity group-hover:opacity-100 dark:text-sky-300">
              <FiMoon className="text-sm" />
            </span>
            <span
              className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.25)] transition-transform duration-300 dark:bg-slate-900 dark:text-slate-100 ${
                theme === "dark" ? "translate-x-9" : "translate-x-0"
              }`}
            >
              {theme === "dark" ? <FiMoon className="text-xs" /> : <FiSun className="text-xs" />}
            </span>
          </button>
        </ul>

      </div>
    </nav>
  );
};

export default Navbar;
