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

  return (
    <CompareContext.Provider value={{ selectedDevices, toggleCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
