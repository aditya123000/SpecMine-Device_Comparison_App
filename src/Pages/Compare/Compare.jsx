import React from "react";
import CompareTable from "../Compare/CompareComponents/CompareTable";
import { useCompare } from "../Compare/context/CompareContext";

const Compare = () => {

  const { selectedDevices } = useCompare();
  const hasSelectedDevices = selectedDevices.length > 0;
  const canCompare = selectedDevices.length >= 2;

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <section>
        <h1 className="text-3xl font-bold text-slate-50">
          Compare Devices
        </h1>
        <p className="mt-2 text-slate-400 max-w-xl">
          Select devices to compare their specifications side by side.
        </p>
      </section>

      {/* Empty State */}
      {!hasSelectedDevices&&(
        <section className="flex flex-col items-center justify-center text-center gap-4 border border-dashed border-slate-700 rounded-lg p-12">
          <p className="text-slate-300 text-lg">
            No devices selected
          </p>
          <p className="text-slate-400 text-sm max-w-md">
            Go to the Devices page and choose phones you want to compare.
          </p>
        </section>
      )}

      {/* Compare Table */}
      {canCompare && <CompareTable />}
    </div>
  );
};

export default Compare;
