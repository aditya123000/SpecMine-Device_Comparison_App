import { query } from "../Config/db.js";

const mapUserRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
};

const createUser = async ({ name, email, passwordHash }) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const { rows } = await query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, password_hash, created_at;
    `,
    [name.trim(), normalizedEmail, passwordHash]
  );

  return mapUserRow(rows[0]);
};

const findUserByEmail = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const { rows } = await query(
    `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
      LIMIT 1;
    `,
    [normalizedEmail]
  );

  return mapUserRow(rows[0]);
};

const findUserById = async (id) => {
  const { rows } = await query(
    `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `,
    [id]
  );

  return mapUserRow(rows[0]);
};

export { createUser, findUserByEmail, findUserById };
