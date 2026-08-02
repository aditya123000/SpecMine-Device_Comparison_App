import { useState } from "react";
import { CompareContext } from "./CompareContextObject";

export const CompareProvider = ({ children }) => {
  const [selectedDevices, setSelectedDevices] = useState([]);

  const toggleCompare = (device) => {
    const isSelected = selectedDevices.some(
      (d) => d.id === device.id
    );

    if (isSelected) {
      setSelectedDevices((prev) =>
        prev.filter((d) => d.id !== device.id)
      );
    } else {
      if (selectedDevices.length === 3) return;
      setSelectedDevices((prev) => [...prev, device]);
    }
  };

  const setComparedDevices = (devices) => {
    setSelectedDevices((devices || []).filter(Boolean).slice(0, 3));
  };

  const replaceComparedDeviceAt = (index, device) => {
    setSelectedDevices((prev) => {
      const next = [...prev];
      const existingIndex = next.findIndex((item) => item.id === device.id);

      if (existingIndex !== -1) {
        next.splice(existingIndex, 1);
      }

      next[index] = device;
      return next.filter(Boolean).slice(0, 3);
    });
  };

  const removeComparedDeviceAt = (index) => {
    setSelectedDevices((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <CompareContext.Provider
      value={{
        selectedDevices,
        toggleCompare,
        setComparedDevices,
        replaceComparedDeviceAt,
        removeComparedDeviceAt,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
