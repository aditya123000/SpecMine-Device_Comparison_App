import { getApiUrl } from "./apiBase.js";

const getDevicePage = async (params = {}) => {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const suffix = searchParams.size ? `?${searchParams}` : "";
  const response = await fetch(getApiUrl(`/api/devices${suffix}`));

  if (!response.ok) {
    throw new Error("Failed to fetch devices");
  }

  const payload = await response.json();
  const devices = Array.isArray(payload) ? payload : payload.data;

  if (!Array.isArray(devices)) {
    return { data: [], meta: payload?.meta ?? { page: 1, totalPages: 1 } };
  }

  return {
    data: devices.filter((device) => device && typeof device === "object"),
    meta: payload?.meta ?? { page: 1, totalPages: 1 },
  };
};

const getDeviceBrands = async (category = "") => {
  const searchParams = new URLSearchParams();
  if (category) searchParams.set("category", category);
  const suffix = searchParams.size ? `?${searchParams}` : "";
  const response = await fetch(getApiUrl(`/api/devices/brands${suffix}`));

  if (!response.ok) {
    throw new Error("Failed to fetch device brands");
  }

  const payload = await response.json();
  const brands = Array.isArray(payload) ? payload : payload.data;
  return Array.isArray(brands) ? brands.filter((brand) => typeof brand === "string") : [];
};

export { getDeviceBrands, getDevicePage };
