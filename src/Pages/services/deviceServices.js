import { getApiUrl } from "../../Api/apiBase.js";

export const getAllDevices = async () => {
  const res = await fetch(getApiUrl("/api/devices"));
  if (!res.ok) return [];
  return res.json();
};

export const getDeviceById = async (id) => {
  const res = await fetch(getApiUrl(`/api/devices/${id}`));
  if (!res.ok) return null;
  return res.json();
};
