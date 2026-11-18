export const parseSharedComparisonIds = (rawIds) => {
  if (typeof rawIds !== "string") return null;
  const ids = [...new Set(rawIds.split(",").map((id) => id.trim()))];
  if (ids.length < 2 || ids.length > 3) return null;
  if (ids.some((id) => !/^[a-zA-Z0-9_-]{1,80}$/.test(id))) return null;
  return ids;
};
