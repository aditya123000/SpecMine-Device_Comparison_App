import test from "node:test";
import assert from "node:assert/strict";
import errorHandler from "../middleware/errorHandler.js";

const invokeHandler = (error) => {
  const result = { headers: {} };
  const response = {
    status(code) {
      result.statusCode = code;
      return this;
    },
    json(body) {
      result.body = body;
      return result;
    },
  };
  const originalError = console.error;
  console.error = () => {};
  try {
    errorHandler(error, { requestId: "request-test" }, response, () => {});
  } finally {
    console.error = originalError;
  }
  return result;
};

test("error handler returns a stable validation error shape", () => {
  const result = invokeHandler(Object.assign(new Error("Invalid value"), { status: 400, code: "VALIDATION_ERROR" }));
  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.body, {
    message: "Invalid value",
    code: "VALIDATION_ERROR",
    requestId: "request-test",
  });
});

test("database uniqueness violations become generic conflict responses", () => {
  const result = invokeHandler(Object.assign(new Error("users_email_key duplicate detail"), { code: "23505" }));
  assert.equal(result.statusCode, 409);
  assert.equal(result.body.message, "A record with that value already exists");
  assert.equal(result.body.code, "CONFLICT");
});

test("unexpected errors do not expose internal messages", () => {
  const result = invokeHandler(new Error("connection string secret"));
  assert.equal(result.statusCode, 500);
  assert.equal(result.body.message, "Internal server error");
  assert.equal(result.body.code, "INTERNAL_ERROR");
});
