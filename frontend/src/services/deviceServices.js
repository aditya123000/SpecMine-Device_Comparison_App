import { getApiUrl } from "../Api/apiBase.js";

const sanitizeDevices = (data) => {
  if (!Array.isArray(data)) return [];
  return data.filter((device) => device && typeof device === "object");
};

export const getAllDevices = async () => {
  const res = await fetch(getApiUrl("/api/devices"));
  if (!res.ok) return [];
  const payload = await res.json();
  return sanitizeDevices(Array.isArray(payload) ? payload : payload?.data);
};

export const getDeviceById = async (id) => {
  const res = await fetch(getApiUrl(`/api/devices/${id}`));
  if (!res.ok) return null;
  const payload = await res.json();
  const device = payload?.data ?? payload;
  return device && typeof device === "object" ? device : null;
};
