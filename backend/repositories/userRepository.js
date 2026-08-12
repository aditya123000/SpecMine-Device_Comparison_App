import { query } from "../config/db.js";

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

const updateUser = async (id, { name, email, passwordHash }) => {
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name.trim());
  }

  if (normalizedEmail) {
    // Check if email is already taken by another user
    const { rows } = await query(
      `SELECT id FROM users WHERE email = $1 AND id != $2 LIMIT 1;`,
      [normalizedEmail, id]
    );
    if (rows.length > 0) {
      const error = new Error("An account with this email already exists");
      error.status = 409;
      throw error;
    }
    updates.push(`email = $${paramIndex++}`);
    values.push(normalizedEmail);
  }

  if (passwordHash) {
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(passwordHash);
  }

  if (updates.length === 0) {
    return findUserById(id);
  }

  values.push(id);

  const { rows } = await query(
    `
      UPDATE users
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, name, email, password_hash, created_at;
    `,
    values
  );

  return mapUserRow(rows[0]);
};

export { createUser, findUserByEmail, findUserById, updateUser };
