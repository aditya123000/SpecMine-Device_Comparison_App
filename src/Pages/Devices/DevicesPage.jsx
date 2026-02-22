import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "../../components/Global-components/Spinner";
import { getDevices } from "../../Api/deviceApi";
import DeviceCard from "./DeviceCard";
import { useCompare } from "../Compare/context/CompareContext";
import {
  DEVICE_SECTIONS,
  filterDevicesBySection,
  getSectionMeta,
} from "./deviceSections";

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const getSectionLinkClass = ({ isActive }) =>
  isActive
    ? "rounded-full border border-sky-400/70 bg-sky-400/15 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-200"
    : "rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-sky-400/40 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-sky-200";

const DevicesPage = ({ sectionKey = "phones" }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedDevices, toggleCompare } = useCompare();
  const searchTerm = searchParams.get("search")?.trim() || "";
  const activeSection = getSectionMeta(sectionKey);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getDevices();
        setDevices(res);
      } catch (error) {
        console.error("Failed to fetch Devices", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const sectionDevices = useMemo(
    () => filterDevicesBySection(devices, sectionKey),
    [devices, sectionKey]
  );

  const filteredDevices = useMemo(() => {
    if (!searchTerm) return sectionDevices;

    const normalizedSearch = normalizeText(searchTerm);
    return sectionDevices.filter((device) => {
      const searchableText = normalizeText(`${device.brand || ""} ${device.model || ""}`);
      return searchableText.includes(normalizedSearch);
    });
  }, [sectionDevices, searchTerm]);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200">No devices to display</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Please check back later or try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="space-y-4 border-b border-slate-300 pb-5 dark:border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 md:text-3xl">
              Devices - {activeSection.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {activeSection.description}
            </p>
            {searchTerm && (
              <p className="mt-2 text-sm text-sky-600 dark:text-sky-300">
                Search results for "{searchTerm}"
                <button
                  onClick={() => setSearchParams({})}
                  className="ml-3 text-slate-500 underline underline-offset-4 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              </p>
            )}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredDevices.length}</span>
            {searchTerm ? `of ${sectionDevices.length} shown` : `${activeSection.label.toLowerCase()} listed`}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEVICE_SECTIONS.map((section) => (
            <NavLink
              key={section.key}
              to={section.path}
              end={section.path === "/devices"}
              className={getSectionLinkClass}
            >
              {section.label}
            </NavLink>
          ))}
        </div>
      </section>

      {selectedDevices.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-slate-300 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-slate-600 dark:bg-slate-900/95">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Selected <span className="text-slate-900 dark:text-slate-100">{selectedDevices.length}</span>/3
          </p>
          <button
            onClick={() => navigate("/compare")}
            disabled={selectedDevices.length < 2}
            className="rounded-full bg-sky-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition enabled:hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Compare
          </button>
        </div>
      )}

      <section>
        {filteredDevices.length === 0 ? (
          <div className="rounded-xl border border-slate-300 bg-slate-100/70 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-base font-medium text-slate-700 dark:text-slate-200">
              No devices matched in {activeSection.label}.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try another category or search by a different brand/model.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredDevices.map((device) => {
              const isSelected = selectedDevices.some((d) => d.id === device.id);
              return (
                <DeviceCard
                  key={device.id}
                  device={device}
                  isSelected={isSelected}
                  onToggleCompare={toggleCompare}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DevicesPage;
