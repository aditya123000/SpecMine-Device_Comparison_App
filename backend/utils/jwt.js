import crypto from "crypto";

const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 7;

const encodeBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf-8");
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET ?? "replace-this-jwt-secret-in-env";

  if (!secret || secret === "replace-this-jwt-secret-in-env") {
    console.warn("JWT_SECRET is using a fallback value. Set JWT_SECRET in src/Backend/.env for production use.");
  }

  return secret;
};

const signJwt = (payload, options = {}) => {
  const secret = getJwtSecret();
  const expiresIn = Number.isInteger(options.expiresIn) ? options.expiresIn : DEFAULT_EXPIRY_SECONDS;
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signature}`;
};

const verifyJwt = (token) => {
  const secret = getJwtSecret();
  const [encodedHeader, encodedPayload, signature] = String(token ?? "").split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload));

  if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
};

export { signJwt, verifyJwt };
