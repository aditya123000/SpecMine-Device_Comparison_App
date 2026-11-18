import crypto from "crypto";
import { query } from "../config/db.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const createSession = async (userId) => {
  const token = crypto.randomBytes(48).toString("base64url");
  const { rows } = await query("INSERT INTO user_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days') RETURNING expires_at", [crypto.randomUUID(), userId, hashToken(token)]);
  return { token, expiresAt: rows[0].expires_at };
};
const findActiveSessionUser = async (token) => {
  const { rows } = await query("SELECT u.id, u.name, u.email, u.created_at FROM user_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > NOW() AND s.revoked_at IS NULL LIMIT 1", [hashToken(token)]);
  const user = rows[0];
  return user ? { id: String(user.id), name: user.name, email: user.email, createdAt: user.created_at } : null;
};
const revokeSession = (token) => query("UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL", [hashToken(token)]);
export { createSession, findActiveSessionUser, revokeSession };
