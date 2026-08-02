import { useMemo } from "react";
import { extractSpecs } from "./specExtractors";

export const useCompareSpecs = (devices) => {
  return useMemo(() => {
    if (!devices || devices.length === 0) return [];
    return extractSpecs(devices);
  }, [devices]);
};
