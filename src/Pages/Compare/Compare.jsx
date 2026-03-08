import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CompareTable from "../Compare/CompareComponents/CompareTable";
import { useCompare } from "../Compare/context/useCompare";
import { getDevices } from "../../Api/deviceApi";
import SearchBar from "../../components/Global-components/SearchBar";

const Compare = () => {
  const { selectedDevices, toggleCompare } = useCompare();
  const navigate = useNavigate();
  const [allDevices, setAllDevices] = useState([]);
  const [query, setQuery] = useState("");

  const canCompare = selectedDevices.length >= 2;
  const singleSelectedDevice = selectedDevices.length === 1 ? selectedDevices[0] : null;

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const data = await getDevices();
        setAllDevices(data);
      } catch (error) {
        console.error("Failed to fetch devices", error.message);
      }
    };
    loadDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    const selectedIds = new Set(selectedDevices.map((d) => d.id));
    const available = allDevices.filter((device) => !selectedIds.has(device.id));
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return available.slice(0, 8);
    }

    return available
      .filter((device) => {
        const searchText = `${device.brand || ""} ${device.model || ""}`.toLowerCase();
        return searchText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [allDevices, query, selectedDevices]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return filteredDevices.map((device) => ({
      id: device.id,
      label: `${device.brand || ""} ${device.model || ""}`.trim(),
      value: `${device.brand || ""} ${device.model || ""}`.trim(),
    }));
  }, [filteredDevices, query]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Compare Devices</h1>
        <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
          Select up to 3 devices and compare their specifications side by side.
        </p>
      </section>

      {!canCompare && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-200">
              {selectedDevices.length === 0
                ? "No devices selected"
                : "Select one more device to compare"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Search and add devices directly from here, or browse the full list on the Devices page.
            </p>
          </div>

          {singleSelectedDevice && (
            <button
              type="button"
              onClick={() => navigate(`/devices/${singleSelectedDevice.id}`)}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-left transition hover:border-sky-400/40 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected device</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-200">
                {singleSelectedDevice.brand} {singleSelectedDevice.model}
              </p>
            </button>
          )}

          <div className="mt-5">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSuggestionSelect={setQuery}
              suggestions={suggestions}
              placeholder="Search by brand or model"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {device.brand} {device.model}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rs {device.price?.toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    onClick={() => toggleCompare(device)}
                    disabled={selectedDevices.length >= 3}
                    className="rounded-md bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-500/25 dark:text-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">No matching devices found.</p>
            )}
          </div>

          <Link
            to="/devices"
            className="mt-5 inline-flex text-sm font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
          >
            Open Devices page
          </Link>
        </section>
      )}

      {canCompare && <CompareTable />}
    </div>
  );
};

export default Compare;
