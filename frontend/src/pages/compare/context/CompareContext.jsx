import { useState, useCallback } from "react";
import { CompareContext } from "./CompareContextObject";
import { getDeviceSectionKey, getSectionMeta } from "../../devices/deviceSections";

export const CompareProvider = ({ children }) => {
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [compareError, setCompareError] = useState(null);

  const showError = useCallback((msg) => {
    setCompareError(msg);
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setCompareError((current) => (current === msg ? null : current));
      }, 4000);
    }
  }, []);

  const toggleCompare = (device) => {
    if (!device || typeof device !== "object") return;

    const isSelected = selectedDevices.some((d) => d.id === device.id);

    if (isSelected) {
      setSelectedDevices((prev) => prev.filter((d) => d.id !== device.id));
      setCompareError(null);
    } else {
      if (selectedDevices.length >= 3) {
        showError("You can compare a maximum of 3 devices at a time.");
        return;
      }

      if (selectedDevices.length > 0) {
        const currentSection = getDeviceSectionKey(selectedDevices[0]);
        const newSection = getDeviceSectionKey(device);

        if (currentSection !== newSection) {
          const currentLabel = getSectionMeta(currentSection).label;
          const newLabel = getSectionMeta(newSection).label;
          showError(
            `Cannot compare ${newLabel} with ${currentLabel}. Please select devices from the same category.`
          );
          return;
        }
      }

      setSelectedDevices((prev) => [...prev, device]);
      setCompareError(null);
    }
  };

  const setComparedDevices = (devices) => {
    const valid = (devices || []).filter((d) => d && typeof d === "object");
    if (!valid.length) {
      setSelectedDevices([]);
      return;
    }

    const firstSection = getDeviceSectionKey(valid[0]);
    const sameSectionDevices = valid.filter(
      (d) => getDeviceSectionKey(d) === firstSection
    );

    if (sameSectionDevices.length < valid.length) {
      showError(
        `Only devices in the ${getSectionMeta(firstSection).label} category were added to comparison.`
      );
    }

    setSelectedDevices(sameSectionDevices.slice(0, 3));
  };

  const replaceComparedDeviceAt = (index, device) => {
    if (!device || typeof device !== "object") return;

    setSelectedDevices((prev) => {
      const otherDevices = prev.filter((_, i) => i !== index && Boolean(_));
      if (otherDevices.length > 0) {
        const currentSection = getDeviceSectionKey(otherDevices[0]);
        const newSection = getDeviceSectionKey(device);

        if (currentSection !== newSection) {
          const currentLabel = getSectionMeta(currentSection).label;
          const newLabel = getSectionMeta(newSection).label;
          showError(
            `Cannot compare ${newLabel} with ${currentLabel}. Please select devices in the same category.`
          );
          return prev;
        }
      }

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
    setCompareError(null);
  };

  const clearCompare = () => {
    setSelectedDevices([]);
    setCompareError(null);
  };

  return (
    <CompareContext.Provider
      value={{
        selectedDevices,
        compareError,
        clearCompareError: () => setCompareError(null),
        toggleCompare,
        setComparedDevices,
        replaceComparedDeviceAt,
        removeComparedDeviceAt,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
