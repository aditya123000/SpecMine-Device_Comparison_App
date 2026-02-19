import React from "react";
import { getSpecValue } from "../CompareLogic/specExtractors";
import { normalizeSpecValue } from "../CompareLogic/valueNormalizers";

const CompareCell = ({ device, spec, isBest }) => {
  const rawValue = getSpecValue(device, spec);
  const formatted = normalizeSpecValue(spec, rawValue);

  const baseClass ="p-4 text-center border-l border-slate-300 transition dark:border-slate-700";

  const emphasisClass = spec==="Availability"
    ? "text-slate-700 dark:text-slate-300"
    : isBest
    ? "bg-emerald-500/10 text-emerald-600 font-semibold dark:text-emerald-300"
    : "text-slate-600 dark:text-slate-400";

  if (formatted.type === "availability") {
    return (
      <div className={`${baseClass} ${emphasisClass}`}>
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
          ${
            formatted.value
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {formatted.value ? "Available" : "Out of stock"}
        </span>
      </div>
    );
  }

  if (formatted.type === "price") {
    return (
      <div className={`${baseClass} ${emphasisClass}`}>
        ₹{formatted.value.toLocaleString("en-IN")}
      </div>
    );
  }

  return (
    <div className={`${baseClass} ${emphasisClass}`}>
      {formatted.value}
    </div>
  );
};

export default CompareCell;
