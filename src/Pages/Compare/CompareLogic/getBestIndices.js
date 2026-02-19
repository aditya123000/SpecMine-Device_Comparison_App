import { COMPARE_RULES } from "./compareRules";
import { parseComparableValue } from "../CompareLogic/valueParsors";

export const getBestIndices = (spec, values) => {
  const rule = COMPARE_RULES[spec];

  if (!rule) return [];

  if (rule.type === "text") {
    return [];
  }

  if (rule.type === "status") {
    return values
      .map((value, index) => (parseComparableValue(spec, value) ? index : null))
      .filter((index) => index !== null);
  }

  if (rule.type === "number") {
    const numericValues = values.map((value) => parseComparableValue(spec, value));
    const validValues = numericValues.filter((value) => typeof value === "number" && Number.isFinite(value));

    if (validValues.length === 0) {
      return [];
    }

    const bestValue =
      rule.better === "higher"
        ? Math.max(...validValues)
        : Math.min(...validValues);

    return numericValues
      .map((value, index) => (value === bestValue ? index : null))
      .filter((index) => index !== null);
  }

  return [];
};
