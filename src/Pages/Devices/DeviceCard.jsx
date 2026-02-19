import React from "react";
import { useNavigate } from "react-router-dom";
import DeviceImage from "../../components/DeviceImage";

const DeviceCard = ({ device, isSelected, onToggleCompare }) => {
  const navigate = useNavigate();
  const { id, brand, model, price, available } = device;

  if (!device || Object.keys(device).length === 0) {
    return null;
  }

  return (
    <article
      onClick={() => navigate(`/devices/${id}`)}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-400/40 dark:border-slate-700/80 dark:bg-slate-800/40"
    >
      <DeviceImage
        src={device.image}
        alt={`${device.brand} ${device.model}`}
        variant="card"
        className="h-28"
      />

      <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
        {brand} {model}
      </h3>

      <div className="mt-2 flex items-center justify-between">
        {price !== undefined ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">Rs {price}</p>
        ) : (
          <span />
        )}
        {available !== undefined && (
          <p
            className={`text-xs font-medium ${
              available ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {available ? "Available" : "Out of stock"}
          </p>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompare(device);
        }}
        className={`mt-4 w-full rounded-md py-2 text-sm font-medium transition ${
          isSelected
            ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 dark:text-rose-300"
            : "bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-300"
        }`}
      >
        {isSelected ? "Remove from Compare" : "Add to Compare"}
      </button>
    </article>
  );
};

export default DeviceCard;
