import React from "react";
import { useCompare } from "../context/CompareContext";
import RemoveDeviceButton from "./RemoveDeviceButton";

const CompareHeader = ({ devices, gridTemplate }) => {
  const { toggleCompare } = useCompare();

  return (
    <div
      className="grid border-b border-slate-700 bg-slate-800 sticky top-0 z-20"
      style={gridTemplate}
    >
      <div className="p-4 text-slate-400 text-sm uppercase sticky left-0 bg-slate-800 z-30">
        Specifications
      </div>

      {devices.map((device) => (
        <div
          key={device.id}
          className="relative p-4 text-center font-semibold border-l border-slate-700"
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
