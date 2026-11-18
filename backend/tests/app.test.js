import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../app.js";

test("unknown API routes return the standard not-found response", async (t) => {
  const server = createApp().listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await once(server, "listening");

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/no-such-route`);
  const body = await response.json();
  assert.equal(response.status, 404);
  assert.equal(body.code, "NOT_FOUND");
  assert.equal(typeof body.requestId, "string");
  assert.equal(response.headers.get("x-request-id"), body.requestId);
});
