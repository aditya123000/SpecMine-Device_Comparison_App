import React from "react";
import { useCompare } from "../context/useCompare";
import RemoveDeviceButton from "./RemoveDeviceButton";

const CompareHeader = ({ devices, gridTemplate }) => {
  const { toggleCompare } = useCompare();

  return (
    <div
      className="sticky top-0 z-20 grid border-b border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
      style={gridTemplate}
    >
      <div className="sticky left-0 z-30 bg-slate-100 p-4 text-sm uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Specifications
      </div>

      {devices.map((device) => (
        <div
          key={device.id}
          className="relative border-l border-slate-300 p-4 text-center font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100"
        >
          <div className="absolute right-2 top-2">
            <RemoveDeviceButton
              onRemove={() => toggleCompare(device)}
              label={`Remove ${device.brand || ""} ${device.model || device.name || "device"} from comparison`}
            />
          </div>
          {device.model || device.name}
        </div>
      ))}
    </div>
  );
};

export default CompareHeader;
