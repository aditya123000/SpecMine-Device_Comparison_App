import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimit } from "../middleware/rateLimit.js";

const responseDouble = () => {
  const result = { headers: {}, statusCode: 200, body: undefined };
  return {
    result,
    setHeader(name, value) { result.headers[name] = value; return this; },
    status(code) { result.statusCode = code; return this; },
    json(body) { result.body = body; return this; },
  };
};

test("rate limit emits a consistent coded 429 after the configured request count", () => {
  const limit = createRateLimit({ windowMs: 60_000, max: 1, keyPrefix: `test-${Math.random()}` });
  const req = { ip: "127.0.0.1", requestId: "request-test" };
  const first = responseDouble();
  let nextCalls = 0;

  limit(req, first, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);

  const second = responseDouble();
  limit(req, second, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(second.result.statusCode, 429);
  assert.deepEqual(second.result.body, {
    message: "Too many requests. Please try again shortly.",
    code: "RATE_LIMITED",
    requestId: "request-test",
  });
  assert.equal(second.result.headers["Retry-After"] > 0, true);
});

test("rate limiter bounds the number of remembered client buckets", () => {
  const limit = createRateLimit({ windowMs: 60_000, max: 1, maxKeys: 2, keyPrefix: `bounded-${Math.random()}` });

  for (const ip of ["127.0.0.1", "127.0.0.2"]) {
    const response = responseDouble();
    let nextCalls = 0;
    limit({ ip }, response, () => { nextCalls += 1; });
    assert.equal(nextCalls, 1);
  }

  limit({ ip: "127.0.0.3" }, responseDouble(), () => {});
  const evictedClient = responseDouble();
  let nextCalls = 0;
  limit({ ip: "127.0.0.1" }, evictedClient, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
});
