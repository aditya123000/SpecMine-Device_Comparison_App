import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../../context/useTheme";
import { useAuth } from "../../context/useAuth";
import logo from "../../assets/logo.png";

const AUTH_TOAST_STORAGE_KEY = "auth_toast";

const linkClass=({isActive}) =>
  isActive
    ? "text-sky-600 dark:text-sky-400 font-semibold"
    : "text-slate-700 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        AUTH_TOAST_STORAGE_KEY,
        JSON.stringify({
          type: "logout",
          message: `Logged out${user?.name ? `, ${user.name}` : ""}.`,
          expiresAt: Date.now() + 2500,
        }),
      );
    }

    logout();
    navigate("/");
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-[70] border-b border-slate-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65 dark:border-slate-700/70 dark:bg-slate-900/75 dark:supports-[backdrop-filter]:bg-slate-900/65">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left side: Logo + Brand */}
        <div className="flex items-center gap-3">
          <img className="size-11" src={logo} alt="SpecMine logo" />
          <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            SpecMine
          </h1>
        </div>

        {/* Right side: Nav links */}
        <ul className="flex items-center gap-6 font-semibold">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/devices" end className={linkClass}>Devices</NavLink>
          <NavLink to="/compare" end className={linkClass}>Compare</NavLink>
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 dark:text-slate-300 md:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:text-slate-200 dark:hover:text-sky-300"
              >
                Logout
                <FiLogOut className="text-sm" />
              </button>
            </>
          ) : null}
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
