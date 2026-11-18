import test from "node:test";
import assert from "node:assert/strict";
import { getConnectionConfig, getSslConfig, getSslFallbackOverride } from "../config/db.js";

test("explicitly enabled PostgreSQL TLS verifies certificates", () => {
  assert.deepEqual(getSslConfig(true), { rejectUnauthorized: true });
});

test("PostgreSQL TLS accepts a configured CA certificate", () => {
  const previousCa = process.env.PG_SSL_CA;
  process.env.PG_SSL_CA = "test-ca-certificate";

  try {
    assert.deepEqual(getSslConfig(true), {
      rejectUnauthorized: true,
      ca: "test-ca-certificate",
    });
  } finally {
    if (previousCa === undefined) delete process.env.PG_SSL_CA;
    else process.env.PG_SSL_CA = previousCa;
  }
});

test("explicit TLS requirement never falls back to an unencrypted connection", () => {
  const previousSsl = process.env.PG_SSL;
  process.env.PG_SSL = "true";

  try {
    assert.equal(
      getSslFallbackOverride(new Error("server does not support SSL connections")),
      null
    );
  } finally {
    if (previousSsl === undefined) delete process.env.PG_SSL;
    else process.env.PG_SSL = previousSsl;
  }
});

test("explicitly disabled PostgreSQL TLS remains disabled", () => {
  assert.equal(getSslConfig(false), false);
  assert.equal(getConnectionConfig(false).ssl, false);
});
