import React from "react";
import { useCompare } from "../context/CompareContext";
import { useCompareSpecs } from "../CompareLogic/useCompareSpecs";
import CompareHeader from "./CompareHeader";
import CompareRow from "./CompareRow";

const CompareTable = () => {
  const { selectedDevices } = useCompare();
  const specs = useCompareSpecs(selectedDevices);

  if (!selectedDevices.length) {
    return (
      <div className="py-12 text-center text-slate-600 dark:text-slate-400">
        Select devices to compare
      </div>
    );
  }

  const gridTemplate = {
    gridTemplateColumns: `200px repeat(${selectedDevices.length}, minmax(0, 1fr))`,
  };

  return (
    <section className="overflow-x-auto">
      <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
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
