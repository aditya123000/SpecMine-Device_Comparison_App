import React from "react";
import CompareCell from "./CompareCell";
import { getBestIndices } from "../CompareLogic/getBestIndices";
import { getSpecValue } from "../CompareLogic/specExtractors";

const CompareRow = ({ spec, devices, gridTemplate }) => {
  const values = devices.map((device) =>
    getSpecValue(device, spec)
  );
  const rawValues = devices.map((d) => d);

  const bestIndices = getBestIndices(spec, values);

  return (
    <div className="grid border-b border-slate-300 dark:border-slate-700" style={gridTemplate}>
      <div className="sticky left-0 z-10 bg-slate-50 p-4 font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-200">
        {spec}
      </div>

      {devices.map((device,index) => (
        <CompareCell
          key={device.id}
          device={device}
          spec={spec}
          isBest={bestIndices.includes(index)}
        />
      ))}
    </div>
  );
};

export default CompareRow;
