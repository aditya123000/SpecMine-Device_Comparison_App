export const normalizeSpecValue = (spec, value) => {
  if (value === "—" || value === undefined || value === null || value === "") {
    return { type: "text", value: "—" };
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

    return {
      type: "price",
      value: Number.isFinite(numericPrice) ? numericPrice : 0,
    };
  }

  return { type: "text", value };
};
