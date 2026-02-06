import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeviceById } from "../services/deviceServices";
import { useCompare } from ".././Compare/context/CompareContext";
import Spinner from "../../components/Global-components/Spinner";
import { Navigate } from "react-router-dom";
import DeviceImage from "@/components/DeviceImage";

const DeviceDetailsPage = () => {
  console.log("🔥 DeviceDetailsPage rendered");
  const { id } = useParams();
  console.log("🧩 route param id:", id);
  const navigate = useNavigate();
  const { addToCompare } = useCompare();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("✅ useEffect ran, id =", id);
    const loadDevice = async () => {
      setLoading(true);
      const data = await getDeviceById(id);
      setDevice(data);
      setLoading(false);
    };

    loadDevice();
  }, [id]);

  if (loading) {
    return <Spinner loading={loading} />;
  }

  if (!device) {
    return <Navigate to="/not-found" replace />;
  }



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <DeviceImage src={device.image} alt={`${device.brand} ${device.model}`} variant="details" className="mx-auto"/>

          <h1 className="text-2xl font-bold text-slate-100">
            {device.brand} {device.model}
          </h1>
          <p className="text-xl text-emerald-400 mt-1">
            ₹{device.price.toLocaleString("en-IN")}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              device.available
                ? "bg-green-500/10 text-green-400"
                : "bg-red-500/10 text-red-400"
            }`}
        >
          {device.available ? "Available" : "Out of stock"}
        </span>
      </div>

      {/* Specs */}
      <div className="border border-slate-700 rounded-lg divide-y divide-slate-700">
        {Object.entries(device).map(([key, value]) => {
          if (["id", "brand", "model", "price", "available"].includes(key))
            return null;

          return (
            <div
              key={key}
              className="flex justify-between px-4 py-3 text-slate-300"
            >
              <span className="capitalize text-slate-400">
                {key.replace(/([A-Z])/g, " $1")}
              </span>
              <span>{value}</span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => addToCompare(device)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white"
        >
          Add to Compare
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-slate-600 rounded text-slate-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default DeviceDetailsPage;
