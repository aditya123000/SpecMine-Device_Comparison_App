export function normalizeDevice(device) {
  if (!device || typeof device !== "object") {
    return null;
  }

  return {
    ...device,
    brand: device.brand ?? "Unknown Brand",
    specifications: {
      ram: device.specifications?.ram ?? null,
      storage: device.specifications?.storage ?? null,
      battery: device.specifications?.battery ?? null,
      display: device.specifications?.display ?? null,
    },
    camera: device.camera ?? {},
    connectivity: device.connectivity ?? {},
  };
}
