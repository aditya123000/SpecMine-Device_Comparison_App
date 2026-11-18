import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import Spinner from "../../components/Global-components/Spinner";
import { getDeviceBrands, getDevicePage } from "../../Api/deviceApi";
import { configuredApiBaseUrl } from "../../Api/apiBase";
import DeviceCard from "./DeviceCard";
import DeviceSectionSidebar from "../../components/Global-components/DeviceSectionSidebar";
import { useCompare } from "../compare/context/useCompare";
import { getSectionMeta } from "./deviceSections";

const BATCH_SIZE = 24;

const getDeviceLoadErrorMessage = () => {
  if (import.meta.env.DEV) {
    return "Could not load devices from the backend. Make sure the local API server is running and the Vite proxy can reach it.";
  }

  if (!configuredApiBaseUrl) {
    return "Could not load devices from the same-origin /api endpoint. On Vercel, make sure the project includes the serverless API routes and that the deployment finished successfully.";
  }

  return `Could not load devices from the API. Check that the backend is live and CORS allows this site. Current API base URL: ${configuredApiBaseUrl}`;
};

const DevicesPage = ({ sectionKey = "phones" }) => {
  const [devices, setDevices] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [meta, setMeta] = useState({ page: 1, limit: BATCH_SIZE, total: 0, totalPages: 0 });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedDevices, toggleCompare } = useCompare();
  const searchTerm = searchParams.get("search")?.trim() || "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const filters = {
    availability: searchParams.get("availability") || "all",
    brand: searchParams.get("brand") || "all",
    maxPrice: searchParams.get("maxPrice") || "",
    minRam: searchParams.get("minRam") || "",
    sort: searchParams.get("sort") || "relevance",
  };
  const activeSection = getSectionMeta(sectionKey);
  const loadMoreSentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchBrands = async () => {
      try {
        setAvailableBrands(await getDeviceBrands(activeSection.key));
      } catch {
        if (!cancelled) setLoadError(getDeviceLoadErrorMessage());
      }
    };
    setAvailableBrands([]);
    fetchBrands();
    return () => { cancelled = true; };
  }, [activeSection.key]);

  useEffect(() => {
    let cancelled = false;
    const fetchPage = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        const result = await getDevicePage({
          page,
          limit: BATCH_SIZE,
          q: searchTerm,
          category: activeSection.key,
          brand: filters.brand === "all" ? "" : filters.brand,
          availability: filters.availability,
          maxPrice: filters.maxPrice,
          minRam: filters.minRam,
          sort: filters.sort,
        });
        if (cancelled) return;
        setDevices((current) => page === 1 ? result.data : [...current, ...result.data]);
        setMeta(result.meta);
        setLoadError("");
      } catch {
        if (!cancelled) setLoadError(getDeviceLoadErrorMessage());
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };
    fetchPage();
    return () => { cancelled = true; };
  }, [activeSection.key, page, searchTerm, filters.availability, filters.brand, filters.maxPrice, filters.minRam, filters.sort]);

  const hasMore = page < meta.totalPages;

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    const defaults = { availability: "all", brand: "all", sort: "relevance" };
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value === undefined || value === defaults[key]) next.delete(key);
      else next.set(key, String(value));
    }
    next.delete("page");
    setDevices([]);
    setMeta({ page: 1, limit: BATCH_SIZE, total: 0, totalPages: 0 });
    setLoading(true);
    setSearchParams(next, { replace: true });
  };

  const loadNextPage = useCallback(() => {
    if (!hasMore || loadingMore) return;
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page + 1));
    setSearchParams(next, { replace: true });
  }, [hasMore, loadingMore, page, searchParams, setSearchParams]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNextPage();
      },
      { rootMargin: "400px 0px" }
    );

    observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [hasMore, loadingMore, devices.length, page, loadNextPage]);

  const activeFilterCount = ["availability", "brand", "maxPrice", "minRam", "sort"].filter((key) => {
    const defaults = { availability: "all", brand: "all", sort: "relevance" };
    return Object.hasOwn(defaults, key) ? filters[key] !== defaults[key] : String(filters[key]).trim() !== "";
  }).length;

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Unable to load devices</p>
        <p className="mt-1 max-w-lg text-sm text-slate-500 dark:text-slate-400">{loadError}</p>
      </div>
    );
  }

  if (devices.length === 0 && meta.total > 0) {
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
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-24 xl:self-start">
        <DeviceSectionSidebar
          activeSectionKey={activeSection.key}
          title="SpecMine"
          subtitle="Browse device families"
        />
      </div>

      <div className="flex flex-col gap-7">
        <section className="space-y-5 rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/70">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-300">
              Device Index
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
              {activeSection.label}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {activeSection.description}
            </p>
            {searchTerm && (
              <p className="mt-3 text-sm text-sky-600 dark:text-sky-300">
                Search results for "{searchTerm}"
                <button
                  onClick={() => updateQuery({ search: "" })}
                  className="ml-3 text-slate-500 underline underline-offset-4 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              </p>
            )}
          </div>

          <div className="rounded-[24px] bg-sky-50/70 p-4 ring-1 ring-sky-100 dark:bg-slate-800/80 dark:ring-slate-700">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateQuery({ availability: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="all">All</option>
                  <option value="available">In stock</option>
                  <option value="unavailable">Out of stock</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => updateQuery({ brand: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="all">All brands</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                  Max price (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => updateQuery({ maxPrice: e.target.value })}
                  placeholder="e.g. 80000"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                  Min RAM
                </label>
                <select
                  value={filters.minRam}
                  onChange={(e) => updateQuery({ minRam: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">Any</option>
                  <option value="4">4 GB+</option>
                  <option value="6">6 GB+</option>
                  <option value="8">8 GB+</option>
                  <option value="12">12 GB+</option>
                  <option value="16">16 GB+</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-300">
                  Sort by
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="relevance">Name</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="ram_desc">RAM: high to low</option>
                  <option value="year_desc">Newest launch year</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Narrow the list quickly with a few practical filters.
              </p>
              <button
                type="button"
                onClick={() => updateQuery({ availability: "all", brand: "all", maxPrice: "", minRam: "", sort: "relevance" })}
                className="text-xs font-semibold text-sky-700 underline underline-offset-4 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
              >
                Clear filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </button>
            </div>
          </div>
        </section>

        {/* Floating Compare Button: only shows when 2 or more devices are selected, positioned safely above the footer with z-[80] */}
        {selectedDevices.length >= 2 && (
          <div className="fixed bottom-24 right-6 z-[80] flex items-center gap-3 rounded-full border border-slate-300 bg-white/95 px-5 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900/95 sm:bottom-28 sm:right-8">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Ready to compare <span className="font-bold text-sky-600 dark:text-sky-400">{selectedDevices.length}</span>/3
            </p>
            <button
              onClick={() => navigate("/compare")}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-400 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
            >
              Compare Now
              <FiArrowRight className="text-xs" />
            </button>
          </div>
        )}

        <section>
          {meta.total === 0 ? (
            <div className="rounded-[28px] border border-slate-300 bg-slate-100/70 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                No devices matched in {activeSection.label}.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your filters, category, or search term.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {devices.map((device) => {
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

              {/* Infinite scroll sentinel & status */}
              {hasMore && (
                <div ref={loadMoreSentinelRef} className="mt-8 flex flex-col items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={loadNextPage}
                    disabled={loadingMore}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-sky-300"
                  >
                    {loadingMore ? "Loading more devices…" : `Load More Devices (${Math.max(0, meta.total - devices.length)} remaining)`}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DevicesPage;
