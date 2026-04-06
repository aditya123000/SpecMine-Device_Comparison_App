import { getApiUrl } from "./apiBase.js";

export const getDevices = async () => {
  const response = await fetch(getApiUrl("/api/devices"));

  if (!response.ok) {
    throw new Error("Failed to fetch devices");
  }

  return response.json();
};
