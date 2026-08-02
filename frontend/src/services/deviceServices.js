import { getApiUrl } from "../Api/apiBase.js";

const sanitizeDevices = (data) => {
  if (!Array.isArray(data)) return [];
  return data.filter((device) => device && typeof device === "object");
};

export const getAllDevices = async () => {
  const res = await fetch(getApiUrl("/api/devices"));
  if (!res.ok) return [];
  return sanitizeDevices(await res.json());
};

export const getDeviceById = async (id) => {
  const res = await fetch(getApiUrl(`/api/devices/${id}`));
  if (!res.ok) return null;
  const device = await res.json();
  return device && typeof device === "object" ? device : null;
};
