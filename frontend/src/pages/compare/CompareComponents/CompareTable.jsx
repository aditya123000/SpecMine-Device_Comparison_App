import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useCompare } from "../context/useCompare";
import { useCompareSpecs } from "../CompareLogic/useCompareSpecs";
import { getDeviceSectionKey, getSectionMeta } from "../../devices/deviceSections";
import CompareHeader from "./CompareHeader";
import CompareRow from "./CompareRow";

const CompareTable = () => {
  const { selectedDevices } = useCompare();
  const specs = useCompareSpecs(selectedDevices);

  if (selectedDevices.length < 2) {
    const isSingle = selectedDevices.length === 1;
    const device = selectedDevices[0];
    const sectionKey = isSingle ? getDeviceSectionKey(device) : "phones";
    const sectionMeta = getSectionMeta(sectionKey);
    const categoryName = sectionMeta.label;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-300">
          <FiAlertCircle className="text-2xl" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
          {isSingle
            ? `1 ${categoryName.replace(/s$/i, "")} selected: ${(device?.brand ?? "Unknown")} ${device?.model}`
            : "No devices selected for comparison"}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {isSingle
            ? `Please add at least one more ${categoryName.toLowerCase().replace(/s$/i, "")} using the selector below to view side-by-side specification comparisons.`
            : "Select at least two devices of the same category (e.g. 2 phones or 2 laptops) to view side-by-side specification comparisons."}
        </p>
      </div>
    );
  }

  const gridTemplate = {
    gridTemplateColumns: `200px repeat(${selectedDevices.length}, minmax(0, 1fr))`,
  };

  return (
    <section className="overflow-x-auto">
      <div className="overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700">
        <CompareHeader devices={selectedDevices} gridTemplate={gridTemplate} />

        {specs.map((spec) => (
          <CompareRow
            key={spec}
            spec={spec}
            devices={selectedDevices}
            gridTemplate={gridTemplate}
          />
        ))}
      </div>
    </section>
  );
};

export default CompareTable;
