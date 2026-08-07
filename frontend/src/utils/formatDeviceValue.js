const PLACEHOLDER = "N/A";

const isMissing = (value) =>
  value === null || value === undefined || value === "" || Number.isNaN(value);

const camelToLabel = (key) =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const formatDeviceValue = (value) => {
  if (isMissing(value)) return PLACEHOLDER;

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "number") return String(value);

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    const parts = value.map((item) => formatDeviceValue(item)).filter((part) => part && part !== PLACEHOLDER);
    return parts.length > 0 ? parts.join(", ") : PLACEHOLDER;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, nested]) => {
        const nestedFormatted = formatDeviceValue(nested);
        if (!nestedFormatted || nestedFormatted === PLACEHOLDER) return null;
        return `${camelToLabel(key)}: ${nestedFormatted}`;
      })
      .filter(Boolean);

    return entries.length > 0 ? entries.join(", ") : PLACEHOLDER;
  }

  return PLACEHOLDER;
};

export const formatSpecValue = (device, key) =>
  formatDeviceValue(device?.[key]);

export { PLACEHOLDER };
