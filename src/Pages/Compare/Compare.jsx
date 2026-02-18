import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CompareTable from "../Compare/CompareComponents/CompareTable";
import { useCompare } from "../Compare/context/CompareContext";
import { getDevices } from "../../Api/deviceApi";

const Compare = () => {
  const { selectedDevices, toggleCompare } = useCompare();
  const [allDevices, setAllDevices] = useState([]);
  const [query, setQuery] = useState("");

  const canCompare = selectedDevices.length >= 2;

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

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold text-slate-50">Compare Devices</h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Select up to 3 devices and compare their specifications side by side.
        </p>
      </section>

      {!canCompare && (
        <section className="rounded-xl border border-slate-700 bg-slate-800/40 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-slate-200">
              {selectedDevices.length === 0
                ? "No devices selected"
                : "Select one more device to compare"}
            </p>
            <p className="text-sm text-slate-400">
              Search and add devices directly from here, or browse the full list on the Devices page.
            </p>
          </div>

          <div className="mt-5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by brand or model"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {device.brand} {device.model}
                    </p>
                    <p className="text-xs text-slate-400">Rs {device.price?.toLocaleString("en-IN")}</p>
                  </div>
                  <button
                    onClick={() => toggleCompare(device)}
                    disabled={selectedDevices.length >= 3}
                    className="rounded-md bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No matching devices found.</p>
            )}
          </div>

          <Link
            to="/devices"
            className="mt-5 inline-flex text-sm font-semibold text-sky-300 transition hover:text-sky-200"
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
