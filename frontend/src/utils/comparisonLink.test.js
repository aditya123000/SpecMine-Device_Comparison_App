import test from "node:test";
import assert from "node:assert/strict";
import { parseSharedComparisonIds } from "./comparisonLink.js";

test("shared comparison IDs accept two or three bounded IDs", () => {
  assert.deepEqual(parseSharedComparisonIds("phone-1, tv_2,3"), ["phone-1", "tv_2", "3"]);
});

test("shared comparison IDs reject missing, duplicate, oversized, or unsafe IDs", () => {
  for (const value of [null, "", "one", "one,two,three,four", "one,one", "one,device/id", `one,${"x".repeat(81)}`]) {
    assert.equal(parseSharedComparisonIds(value), null, `expected ${String(value)} to be rejected`);
  }
});
