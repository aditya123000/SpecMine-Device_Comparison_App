import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { getDeviceById } from "./deviceServices.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("device lookup returns null for a missing device", async () => {
  globalThis.fetch = async () => new Response(null, { status: 404 });
  assert.equal(await getDeviceById("missing"), null);
});

test("device lookup surfaces server failures instead of treating them as not found", async () => {
  globalThis.fetch = async () => new Response(null, { status: 500 });
  await assert.rejects(getDeviceById("device-1"), /status 500/);
});

test("device lookup preserves network failures for the page to handle", async () => {
  globalThis.fetch = async () => { throw new Error("network unavailable"); };
  await assert.rejects(getDeviceById("device-1"), /network unavailable/);
});
