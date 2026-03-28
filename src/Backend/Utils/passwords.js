import crypto from "crypto";

const HASH_PREFIX = "scrypt";
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result.toString("hex"));
    });
  });

  return `${HASH_PREFIX}:${salt}:${derivedKey}`;
};

const verifyPassword = async (password, storedHash) => {
  const [prefix, salt, originalKey] = String(storedHash ?? "").split(":");

  if (prefix !== HASH_PREFIX || !salt || !originalKey) {
    return false;
  }

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });

  const originalBuffer = Buffer.from(originalKey, "hex");

  if (originalBuffer.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, derivedKey);
};

export { hashPassword, verifyPassword };
