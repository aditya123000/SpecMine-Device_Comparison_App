import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import DeviceImage from "@/components/DeviceImage";
import Spinner from "../../components/Global-components/Spinner";
import { useCompare } from "../Compare/context/CompareContext";
import { getDeviceById } from "../services/deviceServices";

const EXCLUDED_SPEC_KEYS = ["id", "brand", "model", "price", "available", "image"];

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

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

  const basicDetails = useMemo(
    () => [
      { label: "Display", value: device?.display || "N/A" },
      { label: "Processor", value: device?.processor || "N/A" },
      { label: "Battery", value: device?.battery || "N/A" },
      { label: "RAM", value: device?.ram || "N/A" },
    ],
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
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-8 rounded-2xl border border-slate-700/80 bg-slate-800/40 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300">
              {device.brand}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                device.available
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {device.available ? "Available" : "Out of stock"}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-100 md:text-4xl">
              {device.brand} {device.model}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-sky-300">
              Rs {device.price?.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {basicDetails.map((item) => (
              <div key={item.label} className="border-l-2 border-slate-600 pl-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleCompare(device)}
              disabled={!canSelectMore}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                isSelectedForCompare
                  ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  : "bg-sky-500/15 text-sky-200 hover:bg-sky-500/25"
              } ${!canSelectMore ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isSelectedForCompare ? "Remove from Compare" : "Add to Compare"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <DeviceImage
            src={device.image}
            alt={`${device.brand} ${device.model}`}
            variant="details"
            className="drop-shadow-[0_12px_30px_rgba(14,165,233,0.2)]"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700/80 bg-slate-900/40 p-5 md:p-6">
        <h2 className="text-xl font-semibold text-slate-100">Technical Specifications</h2>
        <div className="mt-5 divide-y divide-slate-800">
          {specs.map(([key, value]) => (
            <div key={key} className="grid gap-2 py-3 md:grid-cols-[200px_1fr] md:gap-4">
              <p className="text-sm text-slate-400">{formatLabel(key)}</p>
              <p className="text-sm font-medium text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DeviceDetailsPage;
