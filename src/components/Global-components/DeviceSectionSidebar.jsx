import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiChevronRight,
  FiCpu,
  FiHeadphones,
  FiHelpCircle,
  FiMonitor,
  FiSettings,
  FiSmartphone,
  FiTablet,
  FiTv,
} from "react-icons/fi";
import { DEVICE_SECTIONS } from "../../Pages/Devices/deviceSections";

const iconBySection = {
  phones: FiSmartphone,
  laptops: FiMonitor,
  tablets: FiTablet,
  earbuds: FiHeadphones,
  headphones: FiHeadphones,
  tvs: FiTv,
};

const baseLinkClass =
  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition";

const getSectionLinkClass = ({ isActive }) =>
  isActive
    ? `${baseLinkClass} bg-sky-500/10 text-sky-700 shadow-sm ring-1 ring-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200`
    : `${baseLinkClass} text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100`;

const secondaryActions = [
  { label: "Settings", icon: FiSettings },
  { label: "Support", icon: FiHelpCircle },
];

const DeviceSectionSidebar = ({ activeSectionKey = "phones", title = "SpecMine", subtitle = "Device Navigator" }) => {
  return (
    <aside className="h-full rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/85">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <nav className="mt-6 space-y-2">
        {DEVICE_SECTIONS.map((section) => {
          const Icon = iconBySection[section.key] || FiCpu;

          return (
            <NavLink key={section.key} to={section.path} end={section.path === "/devices"} className={getSectionLinkClass}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700">
                <Icon className="text-lg" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold">{section.label}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {section.key === activeSectionKey ? "Selected category" : "Browse section"}
                </p>
              </div>
              <FiChevronRight className="text-base text-slate-400 transition group-hover:text-slate-700 dark:group-hover:text-slate-200" />
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="space-y-2">
          {secondaryActions.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Icon className="text-lg" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DeviceSectionSidebar;
