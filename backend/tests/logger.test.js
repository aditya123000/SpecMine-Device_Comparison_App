import test from "node:test";
import assert from "node:assert/strict";
import logger from "../middleware/logger.js";

test("request logs record the path without query-string values", () => {
  let finishHandler;
  let output;
  const originalInfo = console.info;
  console.info = (line) => { output = JSON.parse(line); };

  try {
    logger(
      { requestId: "request-test", method: "GET", path: "/api/devices", originalUrl: "/api/devices?q=private-search" },
      { statusCode: 200, on: (_event, handler) => { finishHandler = handler; } },
      () => {}
    );
    finishHandler();
  } finally {
    console.info = originalInfo;
  }

  assert.equal(output.path, "/api/devices");
  assert.equal(JSON.stringify(output).includes("private-search"), false);
});
