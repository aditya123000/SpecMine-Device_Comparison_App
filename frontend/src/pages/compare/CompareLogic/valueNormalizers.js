const PLACEHOLDER = "—";

const isMissingValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string") return false;

  return ["—", "â€”", "", "n/a", "na", "not specified", "null", "undefined"].includes(
    value.trim().toLowerCase()
  );
};

export const normalizeSpecValue = (spec, value) => {
  if (isMissingValue(value)) {
    return { type: "text", value: PLACEHOLDER };
  }

  if (spec.toLowerCase() === "availability" || spec.toLowerCase() === "available") {
    return {
      type: "availability",
      value: Boolean(value),
    };
  }

  if (spec.toLowerCase() === "price") {
    const numericPrice =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^0-9.]/g, ""));

    if (!Number.isFinite(numericPrice)) {
      return { type: "text", value: PLACEHOLDER };
    }

    return {
      type: "price",
      value: numericPrice,
    };
  }

  return { type: "text", value };
};
