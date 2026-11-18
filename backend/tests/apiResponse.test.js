import test from "node:test";
import assert from "node:assert/strict";
import { sendData } from "../utils/apiResponse.js";

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
};

test("sendData wraps the response body consistently and includes optional metadata", () => {
  const response = createResponse();
  sendData(response, 206, [{ id: "1" }], { page: 2 });
  assert.equal(response.statusCode, 206);
  assert.deepEqual(response.body, { data: [{ id: "1" }], meta: { page: 2 } });
});

test("sendData omits metadata when it is not supplied", () => {
  const response = createResponse();
  sendData(response, 200, { id: "1" });
  assert.deepEqual(response.body, { data: { id: "1" } });
});
