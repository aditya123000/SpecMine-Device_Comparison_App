const STORAGE_KEY = "specmine_recently_viewed_v1";
const MAX_RECENT_DEVICES = 8;

const isSafeId = (id) => (typeof id === "string" && id.length > 0 && id.length <= 80)
  || (typeof id === "number" && Number.isFinite(id));

export const getRecentlyViewedIds = () => {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (stored?.version !== 1 || !Array.isArray(stored.ids)) return [];
    return stored.ids.filter(isSafeId).slice(0, MAX_RECENT_DEVICES);
  } catch {
    return [];
  }
};

export const recordRecentlyViewed = (id) => {
  if (!isSafeId(id)) return;
  try {
    const ids = [id, ...getRecentlyViewedIds().filter((item) => String(item) !== String(id))]
      .slice(0, MAX_RECENT_DEVICES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ids }));
  } catch {
    // Browsing continues normally when storage is disabled or full.
  }
};
