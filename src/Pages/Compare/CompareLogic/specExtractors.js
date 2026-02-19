import { SPEC_KEY_MAP, SPEC_ORDER } from "./specConfig";

const hasComparableValue = (device, key) => {
  const value = device?.[key];
  return value !== undefined && value !== null && value !== "";
};

export const extractSpecs = (devices) => {
  if (!devices || devices.length === 0) return [];

  const orderedSpecs = SPEC_ORDER.filter((specLabel) => {
    const deviceKey = SPEC_KEY_MAP[specLabel];
    return devices.some((device) => hasComparableValue(device, deviceKey));
  });

  const additionalSpecs = Object.keys(SPEC_KEY_MAP).filter((specLabel) => {
    if (orderedSpecs.includes(specLabel)) return false;

    const deviceKey = SPEC_KEY_MAP[specLabel];
    return devices.some((device) => hasComparableValue(device, deviceKey));
  });

  return [...orderedSpecs, ...additionalSpecs];
};

export const getSpecValue = (device, spec) => {
  const mappedKey = SPEC_KEY_MAP[spec];
  if (mappedKey && device[mappedKey] !== undefined) {
    return device[mappedKey];
  }

  const key = Object.keys(device).find((k) => k.toLowerCase() === spec.toLowerCase());

  return key ? device[key] : "—";
};
