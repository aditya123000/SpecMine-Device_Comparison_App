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

test("library routes reject unauthenticated requests before accessing user data", async (t) => {
  let queryCount = 0;
  t.mock.method(getPool(), "query", async () => {
    queryCount += 1;
    throw new Error("database must not be queried");
  });

  await withServer(createApp(), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/library/favorites`);
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.code, "UNAUTHORIZED");
    assert.equal(queryCount, 0);
  }, t);
});

test("favorites and saved comparison queries stay scoped to the authenticated user", async (t) => {
  const seenQueries = [];
  t.mock.method(getPool(), "query", async (sql, params) => {
    seenQueries.push({ sql, params });
    if (sql.includes("FROM user_sessions")) {
      return { rows: [{ id: "user-42", name: "Test User", email: "test@example.com" }] };
    }
    return { rows: [], rowCount: 0 };
  });

  await withServer(createApp(), async (baseUrl) => {
    const headers = { Authorization: "Bearer test-session-token" };
    const favoritesResponse = await fetch(`${baseUrl}/api/library/favorites`, { headers });
    assert.equal(favoritesResponse.status, 200);

    const comparisonId = "e66408e1-3f94-4c52-8a55-ce2c54f8a401";
    const deleteResponse = await fetch(`${baseUrl}/api/library/comparisons/${comparisonId}`, {
      method: "DELETE",
      headers,
    });
    assert.equal(deleteResponse.status, 204);

    const favoritesQuery = seenQueries.find(({ sql }) => sql.includes("FROM user_favorites f"));
    const deleteQuery = seenQueries.find(({ sql }) => sql.includes("DELETE FROM saved_comparisons"));
    assert.match(favoritesQuery.sql, /WHERE f\.user_id = \$1/);
    assert.deepEqual(favoritesQuery.params, ["user-42"]);
    assert.match(deleteQuery.sql, /WHERE user_id = \$1 AND id = \$2/);
    assert.deepEqual(deleteQuery.params, ["user-42", comparisonId]);
  }, t);
});
