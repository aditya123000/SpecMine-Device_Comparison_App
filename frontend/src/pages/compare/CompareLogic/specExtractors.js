import { SPEC_KEY_MAP, SPEC_ORDER } from "./specConfig";

// Top-level device keys that identify / decorate the row rather than
// being a spec the user wants to see in the comparison table.
const NON_SPEC_KEYS = new Set([
  "id",
  "payload",
  "image", // shown in the header card
  "model", // shown in the header card
  "category", // section metadata
  "specifications",
  "cameraDetails",
  "connectivity",
]);

const MISSING_VALUE_LABEL = "—";

const NESTED_SPEC_PATHS = {
  display: [["specifications", "display"]],
  ram: [["specifications", "ram"]],
  storage: [["specifications", "storage"]],
  battery: [["specifications", "battery"]],
  camera: [["camera", "summary"]],
  frontCamera: [["camera", "front"], ["camera", "frontCamera"]],
  backCamera: [["camera", "back"], ["camera", "backCamera"]],
};

const isMissingValue = (value) => {
  if (value === undefined || value === null) return true;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "" ||
      normalized === "n/a" ||
      normalized === "na" ||
      normalized === "not specified" ||
      normalized === "null" ||
      normalized === "undefined"
    );
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isMissingValue);
  }

  if (typeof value === "object") {
    const entries = Object.values(value);
    return entries.length === 0 || entries.every(isMissingValue);
  }

  return false;
};

const readNestedValue = (device, path) =>
  path.reduce((current, key) => current?.[key], device);

const resolveValueByKey = (device, key) => {
  const directValue = device?.[key];
  if (!isMissingValue(directValue)) {
    return directValue;
  }

  const nestedPaths = NESTED_SPEC_PATHS[key] ?? [];
  for (const path of nestedPaths) {
    const nestedValue = readNestedValue(device, path);
    if (!isMissingValue(nestedValue)) {
      return nestedValue;
    }
  }

  return undefined;
};

// Build a human-readable label from a camelCase / snake_case device key.
// Used to label "extra" specs the canonical SPEC_KEY_MAP doesn't know
// about, and to reverse-lookup those specs in getSpecValue.
export const labelFromKey = (key) =>
  String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

/**
 * Build the list of comparison row labels for the given devices.
 *
 * 1. Always include every label in SPEC_ORDER so the layout stays stable.
 * 2. Append any non-empty device field not covered by SPEC_KEY_MAP.
 * 3. Never drop a row because one side is missing a value.
 */
export const extractSpecs = (devices) => {
  if (!devices || devices.length === 0) return [];

  const labels = [];
  const seen = new Set();

  for (const label of SPEC_ORDER) {
    if (!seen.has(label)) {
      labels.push(label);
      seen.add(label);
    }
  }

  const mappedDeviceKeys = new Set(Object.values(SPEC_KEY_MAP));
  const extraLabels = new Set();

  for (const device of devices) {
    if (!device || typeof device !== "object") continue;

    for (const key of Object.keys(device)) {
      if (NON_SPEC_KEYS.has(key)) continue;
      if (mappedDeviceKeys.has(key)) continue;
      if (isMissingValue(device[key])) continue;

      const label = labelFromKey(key);
      if (!seen.has(label) && !extraLabels.has(label)) {
        extraLabels.add(label);
      }
    }
  }

  const sortedExtras = [...extraLabels].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  for (const label of sortedExtras) {
    labels.push(label);
    seen.add(label);
  }

  return labels;
};

/**
 * Resolve a row label to its underlying value on a device and fall back to
 * the shared blank placeholder when that spec is missing.
 */
export const getSpecValue = (device, spec) => {
  const mappedKey = SPEC_KEY_MAP[spec];
  if (mappedKey) {
    const value = resolveValueByKey(device, mappedKey);
    return isMissingValue(value) ? MISSING_VALUE_LABEL : value;
  }

  if (device) {
    for (const key of Object.keys(device)) {
      if (NON_SPEC_KEYS.has(key)) continue;
      if (labelFromKey(key) === spec) {
        const value = device[key];
        return isMissingValue(value) ? MISSING_VALUE_LABEL : value;
      }
    }
  }

  return MISSING_VALUE_LABEL;
};
