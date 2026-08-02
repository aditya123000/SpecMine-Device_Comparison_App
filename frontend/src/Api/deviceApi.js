import { getApiUrl } from "./apiBase.js";

export const getDevices = async () => {
  const response = await fetch(getApiUrl("/api/devices"));

  if (!response.ok) {
    throw new Error("Failed to fetch devices");
  }

  const devices = await response.json();

  if (!Array.isArray(devices)) {
    return [];
  }

  return devices.filter((device) => device && typeof device === "object");
};
