import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import CompareTable from "../Compare/CompareComponents/CompareTable";
import { useCompare } from "../Compare/context/useCompare";
import { getDevices } from "../../Api/deviceApi";
import SearchBar from "../../components/Global-components/SearchBar";
import DeviceImage from "../../components/DeviceImage";

const buildPopularComparisons = (devices) => {
  const pairs = [];

  for (let index = 0; index < devices.length - 1 && pairs.length < 6; index += 2) {
    pairs.push([devices[index], devices[index + 1]]);
  }

  return pairs;
};

const getDeviceLabel = (device) => `${device?.brand || ""} ${device?.model || ""}`.trim();

const Compare = () => {
  const {
    selectedDevices,
    setComparedDevices,
    replaceComparedDeviceAt,
    removeComparedDeviceAt,
  } = useCompare();
  const [allDevices, setAllDevices] = useState([]);
  const [query, setQuery] = useState("");
  const [activeSlot, setActiveSlot] = useState(0);

  const canCompare = selectedDevices.length >= 2;
  const compareSlots = Array.from({ length: 3 }, (_, index) => selectedDevices[index] || null);
  const selectedIds = useMemo(
    () => new Set(selectedDevices.map((device) => device.id)),
    [selectedDevices]
  );

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
    const normalizedQuery = query.trim().toLowerCase();
    const activeDevice = compareSlots[activeSlot];
    const available = allDevices.filter((device) => {
      if (activeDevice?.id === device.id) {
        return true;
      }

      return !selectedIds.has(device.id);
    });

    if (!normalizedQuery) {
      return available.slice(0, 8);
    }

    return available
      .filter((device) => {
        const searchText = `${device.brand || ""} ${device.model || ""}`.toLowerCase();
        return searchText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [activeSlot, allDevices, compareSlots, query, selectedIds]);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return filteredDevices.map((device) => ({
      id: device.id,
      label: getDeviceLabel(device),
      value: getDeviceLabel(device),
    }));
  }, [filteredDevices, query]);

  const suggestedDevices = useMemo(
    () => allDevices.filter((device) => !selectedIds.has(device.id)).slice(0, 3),
    [allDevices, selectedIds]
  );

  const popularComparisons = useMemo(
    () => buildPopularComparisons(allDevices.filter((device) => device.image)),
    [allDevices]
  );

  const handleDevicePick = (device) => {
    replaceComparedDeviceAt(activeSlot, device);
    setQuery("");

    const nextEmptySlot = compareSlots.findIndex((slot, index) => !slot && index !== activeSlot);
    if (nextEmptySlot !== -1) {
      setActiveSlot(nextEmptySlot);
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_-45px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-800/50">
        <div className="border-b border-slate-200/80 px-6 py-6 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Compare Mobiles</h1>
        </div>

        <div className="space-y-10 px-6 py-7 md:px-7">
          <section>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-10 w-1 rounded-full bg-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Select Mobiles to Compare
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Pick up to three devices and compare their specs side by side.
                </p>
              </div>
            </div>

            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                {compareSlots.map((device, index) => (
                  <React.Fragment key={index}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveSlot(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveSlot(index);
                        }
                      }}
                      className={`flex min-h-20 items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                        activeSlot === index
                          ? "border-sky-400/60 bg-white shadow-sm dark:border-sky-400/40 dark:bg-slate-800"
                          : "border-slate-200 bg-white/90 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                          {`Phone ${index + 1}`}
                        </p>
                        <p className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                          {device ? getDeviceLabel(device) : "Select a product"}
                        </p>
                        {device && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Rs {device.price?.toLocaleString("en-IN") || "N/A"}
                          </p>
                        )}
                      </div>

                      {device ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeComparedDeviceAt(index);
                          }}
                          className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                          <FaPlus className="text-sm" />
                        </span>
                      )}
                    </div>

                    {index < compareSlots.length - 1 && (
                      <div className="hidden items-center justify-center md:flex">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                          VS
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  onSuggestionSelect={(value) => {
                    setQuery(value);
                    const matchedDevice = filteredDevices.find(
                      (device) => getDeviceLabel(device).toLowerCase() === value.toLowerCase()
                    );

                    if (matchedDevice) {
                      handleDevicePick(matchedDevice);
                    }
                  }}
                  suggestions={suggestions}
                  placeholder={`Search a device for slot ${activeSlot + 1}`}
                />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => (
                      <button
                        key={device.id}
                        type="button"
                        onClick={() => handleDevicePick(device)}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-sky-400/50 hover:bg-sky-50/40 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-400/40 dark:hover:bg-slate-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {getDeviceLabel(device)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Rs {device.price?.toLocaleString("en-IN") || "N/A"}
                          </p>
                        </div>
                        <span className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          Add
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No matching devices found for this slot.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  disabled={!canCompare}
                  onClick={() => {
                    document.getElementById("compare-results")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full max-w-md rounded-2xl bg-slate-300 px-6 py-4 text-xl font-bold text-slate-700 transition enabled:bg-slate-800 enabled:text-white enabled:hover:bg-slate-900 dark:bg-slate-700 dark:text-slate-200 dark:enabled:bg-slate-100 dark:enabled:text-slate-950"
                >
                  Compare Now!
                </button>
                <Link
                  to="/devices"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                >
                  Browse all devices <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-4">
              <span className="h-10 w-1 rounded-full bg-orange-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                Compare Suggested Mobiles
              </h2>
            </div>

            <div className="grid overflow-hidden rounded-[22px] border border-slate-200 bg-white md:grid-cols-3 dark:border-slate-700 dark:bg-slate-900/20">
              {suggestedDevices.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => handleDevicePick(device)}
                  className="flex items-center gap-4 border-b border-slate-200 px-5 py-5 text-left transition hover:bg-slate-50 md:border-b-0 md:border-r last:border-b-0 last:border-r-0 dark:border-slate-700 dark:hover:bg-slate-800/50"
                >
                  <div className="h-24 w-20 shrink-0">
                    <DeviceImage
                      src={device.image}
                      alt={getDeviceLabel(device)}
                      variant="compare"
                      className="h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {getDeviceLabel(device)}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                        <FaPlus className="text-sm" />
                      </span>
                      <span className="text-base font-medium">Add to Compare</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mb-5 flex items-center gap-4">
          <span className="h-10 w-1 rounded-full bg-orange-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Popular Comparisons</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {popularComparisons.map(([leftDevice, rightDevice], index) => (
            <button
              key={`${leftDevice.id}-${rightDevice.id}-${index}`}
              type="button"
              onClick={() => setComparedDevices([leftDevice, rightDevice])}
              className="flex flex-col gap-5 rounded-[22px] border border-slate-200 bg-white px-5 py-5 text-left transition hover:border-sky-400/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/20 dark:hover:border-sky-400/30"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-16 shrink-0">
                  <DeviceImage
                    src={leftDevice.image}
                    alt={getDeviceLabel(leftDevice)}
                    variant="compare"
                    className="h-full"
                  />
                </div>
                <p className="text-xl font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {getDeviceLabel(leftDevice)}
                </p>
              </div>

              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white dark:bg-slate-100 dark:text-slate-950">
                VS
              </span>

              <div className="flex items-center gap-4 sm:justify-end">
                <div className="h-20 w-16 shrink-0">
                  <DeviceImage
                    src={rightDevice.image}
                    alt={getDeviceLabel(rightDevice)}
                    variant="compare"
                    className="h-full"
                  />
                </div>
                <p className="text-xl font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {getDeviceLabel(rightDevice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="compare-results" className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Comparison Results</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {canCompare
              ? "Your selected devices are ready for a full specification comparison."
              : "Select at least two devices above to unlock the detailed comparison table."}
          </p>
        </div>
        <CompareTable />
      </section>
    </div>
  );
};

export default Compare;
