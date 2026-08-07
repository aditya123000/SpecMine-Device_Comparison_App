const getNestedValue = (source, paths) => {
  for (const path of paths) {
    const value = path.reduce((current, key) => current?.[key], source);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const fallbackValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export function normalizeDevice(device) {
  if (!device || typeof device !== "object") {
    return null;
  }

  const specifications = device.specifications && typeof device.specifications === "object"
    ? device.specifications
    : {};
  const camera = device.camera && typeof device.camera === "object"
    ? device.camera
    : {};
  const connectivity = device.connectivity && typeof device.connectivity === "object"
    ? device.connectivity
    : {};

  const normalized = {
    ...device,
    brand: device.brand ?? "Unknown Brand",
    display: fallbackValue(
      device.display,
      getNestedValue(device, [["specifications", "display"]])
    ),
    refreshRate: fallbackValue(
      device.refreshRate,
      getNestedValue(device, [["specifications", "refreshRate"], ["displayDetails", "refreshRate"]])
    ),
    processor: fallbackValue(
      device.processor,
      getNestedValue(device, [["specifications", "processor"], ["chipset", "processor"]])
    ),
    ram: fallbackValue(
      device.ram,
      getNestedValue(device, [["specifications", "ram"]])
    ),
    storage: fallbackValue(
      device.storage,
      getNestedValue(device, [["specifications", "storage"]])
    ),
    battery: fallbackValue(
      device.battery,
      getNestedValue(device, [["specifications", "battery"], ["power", "battery"]])
    ),
    charging: fallbackValue(
      device.charging,
      getNestedValue(device, [["specifications", "charging"], ["power", "charging"]])
    ),
    os: fallbackValue(
      device.os,
      getNestedValue(device, [["specifications", "os"], ["software", "os"]])
    ),
    mobileWeight: fallbackValue(
      device.mobileWeight,
      device.weight,
      getNestedValue(device, [["specifications", "mobileWeight"], ["specifications", "weight"]])
    ),
    frontCamera: fallbackValue(
      device.frontCamera,
      getNestedValue(device, [["camera", "front"], ["camera", "frontCamera"], ["cameras", "front"]])
    ),
    backCamera: fallbackValue(
      device.backCamera,
      getNestedValue(device, [["camera", "back"], ["camera", "backCamera"], ["cameras", "rear"]])
    ),
    camera: fallbackValue(
      typeof device.camera === "string" ? device.camera : undefined,
      getNestedValue(device, [["camera", "summary"], ["camera", "rear"], ["camera", "back"]]),
      device.backCamera
    ),
    launchedYear: fallbackValue(
      device.launchedYear,
      device.launchYear,
      getNestedValue(device, [["specifications", "launchedYear"], ["specifications", "launchYear"]])
    ),
    available: fallbackValue(
      device.available,
      getNestedValue(device, [["availability", "available"], ["stock", "available"]])
    ),
    specifications: {
      ...specifications,
      display: fallbackValue(specifications.display, device.display),
      ram: fallbackValue(specifications.ram, device.ram),
      storage: fallbackValue(specifications.storage, device.storage),
      battery: fallbackValue(specifications.battery, device.battery),
      refreshRate: fallbackValue(specifications.refreshRate, device.refreshRate),
      processor: fallbackValue(specifications.processor, device.processor),
      charging: fallbackValue(specifications.charging, device.charging),
      os: fallbackValue(specifications.os, device.os),
      mobileWeight: fallbackValue(specifications.mobileWeight, specifications.weight, device.mobileWeight),
      launchedYear: fallbackValue(specifications.launchedYear, specifications.launchYear, device.launchedYear),
    },
    cameraDetails: camera,
    connectivity,
  };

  return normalized;
}
