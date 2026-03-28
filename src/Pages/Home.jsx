import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FiActivity,FiArrowRight,FiBarChart2,FiCheckCircle,FiCpu,FiLogOut,FiShield,FiSmartphone,FiZap} from "react-icons/fi";
import SearchBar from "../components/Global-components/SearchBar";
import FeatureCard from "../components/Global-components/FeatureCard";
import { getDevices } from "../Api/deviceApi";
import { useAuth } from "../context/useAuth";

const AUTH_TOAST_STORAGE_KEY = "auth_toast";

const DEVICE_TYPES = [
  "smartphones",
  "laptops",
  "tablets",
  "earbuds",
  "headphones",
  "smart TVs",
  "smartwatches",
  "gaming consoles",
  "monitors",
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState([]);
  const [activeDeviceTypeIndex, setActiveDeviceTypeIndex] = useState(0);
  const [authToast, setAuthToast] = useState(null);

  const highlights = [
    { label: "Devices Indexed", value: "500+" },
    { label: "Spec Signals", value: "120+" },
    { label: "Fast Compare", value: "< 2s" },
  ];

  const handleSearchSubmit = (query) => {
    if (!query) {
      navigate("/devices");
      return;
    }
    navigate(`/devices?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getDevices();
        setDevices(res);
      } catch (error) {
        console.error("Failed to fetch devices", error.message);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveDeviceTypeIndex((prev) => (prev + 1) % DEVICE_TYPES.length);
    }, 1700);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedToast = window.sessionStorage.getItem(AUTH_TOAST_STORAGE_KEY);
    let remainingDuration = 0;
    let parsedToast = null;

    if (storedToast) {
      try {
        parsedToast = JSON.parse(storedToast);
        remainingDuration = Math.max(0, (parsedToast?.expiresAt ?? 0) - Date.now());
      } catch {
        remainingDuration = 0;
      }
    }

    if (remainingDuration <= 0) {
      setAuthToast(null);
      window.sessionStorage.removeItem(AUTH_TOAST_STORAGE_KEY);
      return;
    }

    setAuthToast({
      type: parsedToast?.type === "logout" ? "logout" : "login",
      message:
        parsedToast?.message ||
        (parsedToast?.type === "logout"
          ? "Logged out successfully."
          : `Logged in as ${user?.name || user?.email || "your account"}.`),
    });

    const timeoutId = window.setTimeout(() => {
      setAuthToast(null);
      window.sessionStorage.removeItem(AUTH_TOAST_STORAGE_KEY);
    }, remainingDuration);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthenticated, user]);

  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return devices
      .filter((device) => {
        const combined = `${device.brand || ""} ${device.model || ""}`.toLowerCase();
        return combined.includes(query);
      })
      .map((device) => ({
        id: device.id,
        label: `${device.brand} ${device.model}`,
        value: `${device.brand} ${device.model}`,
      }));
  }, [devices, searchQuery]);

  return (
    <div className="flex flex-col gap-14 md:gap-16">
      {authToast ? (
        <div className="pointer-events-none fixed left-1/2 top-5 z-50 w-auto min-w-[200px] max-w-sm -translate-x-1/2 px-4 shadow-sm">
          <div
            className={`flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-sm font-medium shadow-xl backdrop-blur-sm animate-fade-in ${
              authToast.type === "logout"
                ? "border border-amber-200 bg-amber-50/95 text-amber-700 shadow-amber-500/10 dark:border-amber-500/30 dark:bg-slate-900/95 dark:text-amber-300"
                : "border border-emerald-200 bg-emerald-50/95 text-emerald-700 shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-slate-900/95 dark:text-emerald-300"
            }`}
          >
            {authToast.type === "logout" ? (
              <FiLogOut className="text-base text-amber-600 dark:text-amber-400" />
            ) : (
              <FiCheckCircle className="text-base text-emerald-600 dark:text-emerald-400" />
            )}
            <span>{authToast.message}</span>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-visible rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-100 p-6 dark:border-slate-700/70 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 md:p-10">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-sky-600 dark:text-sky-300">
              <FiZap />
              Smarter device decisions
            </span>

            <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
              <span className="block">
                Compare{" "}
                <span
                  key={DEVICE_TYPES[activeDeviceTypeIndex]}
                  className="inline-block text-sky-600 animate-word-cycle dark:text-sky-300"
                >
                  {DEVICE_TYPES[activeDeviceTypeIndex]}
                </span>
              </span>
              <span className="block text-slate-800 dark:text-white">with clarity, speed, and confidence</span>
            </h1>

            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Search models instantly, review detailed specs side-by-side, and pick the right device based on what actually matters.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-400/60 hover:text-sky-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:text-sky-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                >
                  Register
                </Link>
              </div>
            ) : null}

            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              onSuggestionSelect={handleSearchSubmit}
              suggestions={searchSuggestions}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/devices"
                className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-300"
              >
                Explore Devices
                <FiArrowRight />
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-sky-400/60 hover:text-sky-700 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:text-sky-200"
              >
                Start Comparing
                <FiBarChart2 />
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 transition hover:border-sky-400/50 dark:border-slate-700 dark:bg-slate-800/70"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<FiSmartphone className="text-lg" />}
          title="Search Devices"
          description="Find phones by brand, model, and key hardware details in seconds."
        />
        <FeatureCard
          icon={<FiCpu className="text-lg" />}
          title="Deep Spec Detail"
          description="Inspect processor, camera, battery, and display specs with a clean layout."
        />
        <FeatureCard
          icon={<FiActivity className="text-lg" />}
          title="Fast Comparison"
          description="Place devices side-by-side and spot practical differences instantly."
        />
        <FeatureCard
          icon={<FiShield className="text-lg" />}
          title="Confident Picks"
          description="Use clear data points to choose the right device for your budget and needs."
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 dark:border-slate-700 dark:bg-slate-800/50 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">How it works</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Three quick steps from search to final decision.</p>
          </div>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-400/20 dark:text-sky-200"
          >
            Open Compare
            <FiArrowRight />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm text-sky-600 dark:text-sky-300">01</p>
            <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Search</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Type brand or model to discover available devices.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm text-sky-600 dark:text-sky-300">02</p>
            <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Compare</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Pick multiple devices and evaluate specs side-by-side.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm text-sky-600 dark:text-sky-300">03</p>
            <h3 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">Decide</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Choose confidently with a clearer view of performance and value.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
