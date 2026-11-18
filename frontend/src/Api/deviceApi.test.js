import test from "node:test";
import assert from "node:assert/strict";
import { getDeviceBrands, getDevicePage } from "./deviceApi.js";

const withFetch = async (handler, run) => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

const jsonResponse = (body, ok = true) => ({ ok, json: async () => body });

test("getDevicePage serializes filters and unwraps the standard response envelope", async () => {
  await withFetch(async (url) => {
    const parsed = new URL(url, "http://localhost");
    assert.equal(parsed.pathname, "/api/devices");
    assert.equal(parsed.searchParams.get("q"), "Pixel & Pro");
    assert.equal(parsed.searchParams.get("page"), "2");
    return jsonResponse({ data: [{ id: 1 }, null, "invalid"], meta: { page: 2, totalPages: 4 } });
  }, async () => {
    assert.deepEqual(await getDevicePage({ page: 2, q: "Pixel & Pro", ignored: "" }), {
      data: [{ id: 1 }],
      meta: { page: 2, totalPages: 4 },
    });
  });
});

test("getDevicePage reports failed API responses", async () => {
  await withFetch(async () => jsonResponse({ message: "unavailable" }, false), async () => {
    await assert.rejects(getDevicePage(), /Failed to fetch devices/);
  });
});

test("getDeviceBrands encodes category and returns only brand strings", async () => {
  await withFetch(async (url) => {
    const parsed = new URL(url, "http://localhost");
    assert.equal(parsed.pathname, "/api/devices/brands");
    assert.equal(parsed.searchParams.get("category"), "smart TVs");
    return jsonResponse({ data: ["Acme", null, 4] });
  }, async () => {
    assert.deepEqual(await getDeviceBrands("smart TVs"), ["Acme"]);
  });
});
