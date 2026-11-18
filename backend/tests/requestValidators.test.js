import test from "node:test";
import assert from "node:assert/strict";
import {
  getComparableCategory,
  validateComparisonPayload,
  validateDeviceId,
  validateLoginPayload,
  validatePasswordChangePayload,
  validateProfilePayload,
  validateRegisterPayload,
  validateUuid,
} from "../validators/requestValidators.js";

test("registration normalizes email and validates bounded fields", () => {
  assert.deepEqual(
    validateRegisterPayload({ name: "  Ada Lovelace ", email: "ADA@example.com", password: "longpass1" }),
    { name: "Ada Lovelace", email: "ada@example.com", password: "longpass1" }
  );
  assert.throws(() => validateRegisterPayload({ name: "A", email: "invalid", password: "longpass1" }), {
    status: 400,
    code: "VALIDATION_ERROR",
  });
  assert.throws(() => validateRegisterPayload({ name: "A", email: "a@example.com", password: "short" }), /at least 8/);
  assert.throws(() => validateRegisterPayload({ name: "A", email: "a@example.com", password: "x".repeat(129) }), /at most 128/);
});

test("login accepts existing six-character passwords but rejects malformed payloads", () => {
  assert.deepEqual(validateLoginPayload({ email: "user@example.com", password: "123456" }), {
    email: "user@example.com",
    password: "123456",
  });
  assert.throws(() => validateLoginPayload(null), /JSON object/);
});

test("profile updates require at least one bounded valid field", () => {
  assert.deepEqual(validateProfilePayload({ name: "  Grace  " }), { name: "Grace", email: undefined });
  assert.throws(() => validateProfilePayload({}), /Provide a name or email/);
  assert.throws(() => validateProfilePayload({ name: "   " }), /Name is required/);
  assert.throws(() => validateProfilePayload({ email: "bad" }), /valid email/);
});

test("password changes enforce a new eight-character password and size limit", () => {
  assert.deepEqual(validatePasswordChangePayload({ currentPassword: "oldpass", newPassword: "newpass1" }), {
    currentPassword: "oldpass",
    newPassword: "newpass1",
  });
  assert.throws(() => validatePasswordChangePayload({ currentPassword: "samepass", newPassword: "samepass" }), /different/);
  assert.throws(() => validatePasswordChangePayload({ currentPassword: "oldpass", newPassword: "short" }), /at least 8/);
});

test("saved comparisons require two or three distinct bounded device IDs", () => {
  assert.deepEqual(validateComparisonPayload({ deviceIds: ["1", "phone-2"] }), {
    name: "Untitled comparison",
    deviceIds: ["1", "phone-2"],
  });
  assert.throws(() => validateComparisonPayload({ deviceIds: ["1", "1"] }), /unique/);
  assert.throws(() => validateComparisonPayload({ deviceIds: ["1", "2", "3", "4"] }), /two or three/);
  assert.throws(() => validateComparisonPayload({ name: "  ", deviceIds: ["1", "2"] }), /cannot be empty/);
});

test("device IDs and comparison UUIDs are validated", () => {
  assert.equal(validateDeviceId("phone-1"), "phone-1");
  assert.throws(() => validateDeviceId(" "), /Invalid device ID/);
  assert.equal(validateUuid("123e4567-e89b-42d3-a456-426614174000"), "123e4567-e89b-42d3-a456-426614174000");
  assert.throws(() => validateUuid("not-a-uuid", "Comparison ID"), /Invalid comparison id/);
});

test("comparison category aliases match the frontend categories", () => {
  assert.equal(getComparableCategory({ category: "smartphones" }), "phones");
  assert.equal(getComparableCategory({ category: "notebook" }), "laptops");
  assert.equal(getComparableCategory({ category: null }), "phones");
});
