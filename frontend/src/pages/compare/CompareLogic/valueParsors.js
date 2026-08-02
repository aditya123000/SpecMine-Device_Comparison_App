const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/,/g, "").trim();
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

const parseStorageToGb = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;

  const num = toNumber(value);
  if (num === null) return null;

  if (/tb/i.test(value)) return num * 1024;
  return num;
};

const parseProcessorScore = (value) => {
  if (typeof value !== "string") return null;

  const lower = value.toLowerCase();
  const allNumbers = lower.match(/\d+/g)?.map(Number) || [];
  const maxNumber = allNumbers.length ? Math.max(...allNumbers) : 0;

  if (/a\d+/i.test(value)) {
    const appleGen = Number((value.match(/a(\d+)/i) || [])[1] || 0);
    return 50000 + appleGen * 100 + maxNumber;
  }

  if (lower.includes("snapdragon")) {
    const classNum = Number((lower.match(/snapdragon\s*(\d+)/) || [])[1] || 0);
    const genNum = Number((lower.match(/gen\s*(\d+)/) || [])[1] || 0);
    return 40000 + classNum * 100 + genNum * 10 + maxNumber;
  }

  if (lower.includes("dimensity")) {
    return 30000 + maxNumber;
  }

  if (lower.includes("exynos")) {
    return 28000 + maxNumber;
  }

  if (lower.includes("tensor")) {
    const tensorGen = Number((lower.match(/\bg\s*(\d+)/) || [])[1] || 0);
    return 29000 + tensorGen * 100 + maxNumber;
  }

  return maxNumber || null;
};

const parseOsVersion = (value) => {
  if (typeof value !== "string") return null;
  return toNumber(value);
};

export const extractNumber = (value) => toNumber(value);

export const parseComparableValue = (spec, value) => {
  if (value === null || value === undefined || value === "—") return null;

  switch (spec) {
    case "Price":
    case "Battery":
    case "RefreshRate":
    case "Camera":
    case "Charging":
    case "Display":
    case "RAM":
      return toNumber(value);
    case "Storage":
      return parseStorageToGb(value);
    case "OS":
      return parseOsVersion(value);
    case "Processor":
      return parseProcessorScore(value);
    case "Availability":
      return typeof value === "boolean" ? value : String(value).toLowerCase() === "true";
    default:
      return null;
  }
};
