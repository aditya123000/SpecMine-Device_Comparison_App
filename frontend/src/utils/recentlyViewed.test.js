import test from "node:test";
import assert from "node:assert/strict";
import { getRecentlyViewedIds, recordRecentlyViewed } from "./recentlyViewed.js";

const createStorage = (initial = null, shouldThrow = false) => {
  let value = initial;
  return {
    getItem: () => {
      if (shouldThrow) throw new Error("Storage unavailable");
      return value;
    },
    setItem: (_key, nextValue) => {
      if (shouldThrow) throw new Error("Storage unavailable");
      value = nextValue;
    },
  };
};

test("recent history stores newest unique IDs and caps the list", () => {
  globalThis.window = { localStorage: createStorage() };
  for (let id = 1; id <= 10; id += 1) recordRecentlyViewed(id);
  recordRecentlyViewed(7);
  assert.deepEqual(getRecentlyViewedIds(), [7, 10, 9, 8, 6, 5, 4, 3]);
  delete globalThis.window;
});

test("recent history ignores invalid or unsupported stored formats", () => {
  globalThis.window = { localStorage: createStorage(JSON.stringify({ version: 2, ids: [1] })) };
  assert.deepEqual(getRecentlyViewedIds(), []);
  globalThis.window.localStorage = createStorage("not json");
  assert.deepEqual(getRecentlyViewedIds(), []);
  delete globalThis.window;
});

test("recent history gracefully handles unavailable browser storage", () => {
  globalThis.window = { localStorage: createStorage(null, true) };
  assert.deepEqual(getRecentlyViewedIds(), []);
  assert.doesNotThrow(() => recordRecentlyViewed("device-1"));
  delete globalThis.window;
});
