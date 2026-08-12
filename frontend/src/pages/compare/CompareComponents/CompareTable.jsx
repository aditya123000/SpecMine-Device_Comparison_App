import React from "react";
import { useCompare } from "../context/useCompare";
import { useCompareSpecs } from "../CompareLogic/useCompareSpecs";
import CompareHeader from "./CompareHeader";
import CompareRow from "./CompareRow";

const CompareTable = () => {
  const { selectedDevices } = useCompare();
  const specs = useCompareSpecs(selectedDevices);

  if (!selectedDevices.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 py-12 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No devices selected for comparison
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select at least two devices using the selector below to view full specifications side-by-side.
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
        <CompareHeader
          devices={selectedDevices}
          gridTemplate={gridTemplate}
        />

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
