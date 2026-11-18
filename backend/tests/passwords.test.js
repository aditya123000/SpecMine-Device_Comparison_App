import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../utils/passwords.js";

test("password hashes are salted and verify only the matching password", async () => {
  const firstHash = await hashPassword("correct horse battery staple");
  const secondHash = await hashPassword("correct horse battery staple");

  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword("correct horse battery staple", firstHash), true);
  assert.equal(await verifyPassword("wrong password", firstHash), false);
});

test("password verification rejects malformed and unsupported hashes", async () => {
  assert.equal(await verifyPassword("password", "not-a-hash"), false);
  assert.equal(await verifyPassword("password", "scrypt:salt:00"), false);
});
