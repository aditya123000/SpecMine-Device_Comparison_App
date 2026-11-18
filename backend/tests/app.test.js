import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "../app.js";
import { getPool } from "../config/db.js";

const withServer = async (app, callback, t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  await once(server, "listening");
  return callback(`http://127.0.0.1:${server.address().port}`);
};

test("unknown API routes return the standard not-found response", async (t) => {
  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/no-such-route`);
    const body = await response.json();
    assert.equal(response.status, 404);
    assert.equal(body.code, "NOT_FOUND");
    assert.equal(typeof body.requestId, "string");
    assert.equal(response.headers.get("x-request-id"), body.requestId);
  }, t);
});

test("health endpoint reports database connectivity without exposing errors", async (t) => {
  t.mock.method(getPool(), "query", async () => ({ rows: [{ "?column?": 1 }] }));

  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "specmine-api");
    assert.equal(typeof body.requestId, "string");
  }, t);
});

test("health endpoint returns a generic degraded response on database failure", async (t) => {
  t.mock.method(getPool(), "query", async () => { throw new Error("private database detail"); });

  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 503);
    assert.deepEqual(body, {
      status: "degraded",
      service: "specmine-api",
      requestId: body.requestId,
    });
    assert.equal(JSON.stringify(body).includes("private database detail"), false);
  }, t);
});
