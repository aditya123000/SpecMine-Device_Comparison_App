const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

const extractNumber = (value) => {
  const match = String(value || "").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

export const getUniqueBrands = (devices) =>
  [...new Set(devices.map((device) => normalizeText(device.brand)).filter(Boolean))]
    .sort()
    .map((value) => value.replace(/\b\w/g, (char) => char.toUpperCase()));

export const applyDeviceFilters = (devices, filters) => {
  const maxPrice = extractNumber(filters.maxPrice);
  const minRam = extractNumber(filters.minRam);

  return devices.filter((device) => {
    const brandMatches =
      filters.brand === "all" || normalizeText(device.brand) === normalizeText(filters.brand);

    const availabilityMatches =
      filters.availability === "all" ||
      (filters.availability === "available" && device.available) ||
      (filters.availability === "unavailable" && !device.available);

    const priceMatches =
      maxPrice === null || (typeof device.price === "number" && device.price <= maxPrice);

    const ramValue = extractNumber(device.ram);
    const ramMatches = minRam === null || (ramValue !== null && ramValue >= minRam);

    return brandMatches && availabilityMatches && priceMatches && ramMatches;
  });
};
