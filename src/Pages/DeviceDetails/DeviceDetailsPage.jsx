import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  FiCamera,
  FiCheckCircle,
  FiCpu,
  FiGrid,
  FiMonitor,
  FiSmartphone,
} from "react-icons/fi";
import DeviceImage from "@/components/DeviceImage";
import Spinner from "../../components/Global-components/Spinner";
import DeviceSectionSidebar from "../../components/Global-components/DeviceSectionSidebar";
import { useCompare } from "../Compare/context/useCompare";
import { getDeviceSectionKey } from "../Devices/deviceSections";
import { getDeviceById } from "../services/deviceServices";

const EXCLUDED_SPEC_KEYS = ["id", "brand", "model", "price", "available", "image"];

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const SPEC_GROUPS = [
  {
    title: "General Info",
    icon: FiGrid,
    fields: [
      ["Launch Year", "launchedYear"],
      ["OS", "os"],
      ["Availability", "available"],
      ["Price", "price"],
      ["Weight", "mobileWeight"],
    ],
  },
  {
    title: "Display",
    icon: FiMonitor,
    fields: [
      ["Screen", "display"],
      ["Refresh Rate", "refreshRate"],
      ["Storage", "storage"],
      ["RAM", "ram"],
    ],
  },
  {
    title: "Chipset",
    icon: FiCpu,
    fields: [
      ["Processor", "processor"],
      ["Battery", "battery"],
      ["Charging", "charging"],
    ],
  },
  {
    title: "Camera",
    icon: FiCamera,
    fields: [
      ["Main Camera", "backCamera"],
      ["Front Camera", "frontCamera"],
      ["Camera Summary", "camera"],
    ],
  },
];

const DeviceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedDevices, toggleCompare } = useCompare();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDevice = async () => {
      setLoading(true);
      const data = await getDeviceById(id);
      setDevice(data);
      setLoading(false);
    };

    loadDevice();
  }, [id]);

  const isSelectedForCompare = selectedDevices.some((item) => item.id === device?.id);
  const canSelectMore = selectedDevices.length < 3 || isSelectedForCompare;
  const activeSectionKey = useMemo(() => getDeviceSectionKey(device), [device]);

  const heroHighlights = useMemo(
    () => [
      { label: device?.processor || "Processor N/A", icon: FiCpu },
      { label: device?.display || "Display N/A", icon: FiSmartphone },
      { label: device?.backCamera || device?.camera || "Camera N/A", icon: FiCamera },
    ],
    [device]
  );

  const specGroups = useMemo(
    () =>
      SPEC_GROUPS.map((group) => ({
        ...group,
        items: group.fields
          .map(([label, key]) => ({
            label,
            value:
              key === "available"
                ? device?.available
                  ? "Available"
                  : "Out of stock"
                : key === "price"
                ? device?.price
                  ? `Rs ${device.price.toLocaleString("en-IN")}`
                  : "N/A"
                : device?.[key] || "N/A",
          }))
          .filter((item) => item.value && item.value !== "N/A"),
      })).filter((group) => group.items.length > 0),
    [device]
  );

  const specs = useMemo(() => {
    if (!device) return [];
    return Object.entries(device).filter(([key]) => !EXCLUDED_SPEC_KEYS.includes(key));
  }, [device]);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (!device) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-24 xl:self-start">
        <DeviceSectionSidebar
          activeSectionKey={activeSectionKey}
          title="BenchMark Pro"
          subtitle="Technical Architect"
        />
      </div>

      <div className="space-y-8">
        <section className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_25px_80px_-50px_rgba(15,23,42,0.4)] dark:border-slate-700 dark:bg-slate-900/75">
          <div className="grid gap-8 px-7 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold uppercase tracking-[0.32em] text-sky-600 dark:text-sky-300">
                  {device.brand}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    device.available
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                  }`}
                >
                  <FiCheckCircle className="text-sm" />
                  {device.available ? "Available" : "Out of stock"}
                </span>
              </div>

              <div>
                <h1 className="max-w-xl text-5xl font-black tracking-tight text-slate-900 dark:text-slate-50 md:text-6xl">
                  {device.model}
                </h1>
                <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Rs {device.price?.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {heroHighlights.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-3 rounded-full bg-sky-50 px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-sky-100 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                  >
                    <Icon className="text-base text-sky-600 dark:text-sky-300" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => toggleCompare(device)}
                  disabled={!canSelectMore}
                  className={`rounded-2xl px-6 py-4 text-base font-bold shadow-lg shadow-sky-500/10 transition ${
                    isSelectedForCompare
                      ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-300"
                      : "bg-sky-600 text-white hover:bg-sky-700"
                  } ${!canSelectMore ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {isSelectedForCompare ? "Remove from Compare" : "Add to Compare"}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_52%),linear-gradient(145deg,_rgba(15,23,42,0.05),_rgba(15,23,42,0.02))] p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.5)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_52%),linear-gradient(145deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.95))]">
              <DeviceImage
                src={device.image}
                alt={`${device.brand} ${device.model}`}
                variant="details"
                className="drop-shadow-[0_22px_40px_rgba(15,23,42,0.3)]"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[34px] bg-sky-50/70 px-7 py-8 ring-1 ring-sky-100 dark:bg-slate-900/70 dark:ring-slate-800 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                Technical Specifications
              </h2>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                Exhaustive data mining of hardware capabilities.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-sky-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 dark:bg-slate-800 dark:text-sky-300">
              REV 2.4
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
            {specGroups.map((group) => {
              const Icon = group.icon;

              return (
                <article
                  key={group.title}
                  className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-800/80"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-slate-700 dark:text-sky-300">
                      <Icon className="text-xl" />
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                      {group.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <div key={item.label} className="grid gap-1">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[34px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_-45px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900/70 md:p-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            Full Product Data
          </h2>
          <div className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
            {specs.map(([key, value]) => (
              <div key={key} className="grid gap-2 py-4 md:grid-cols-[220px_1fr] md:gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {formatLabel(key)}
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DeviceDetailsPage;
