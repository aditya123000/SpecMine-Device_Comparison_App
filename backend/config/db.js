import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultSeedFilePath = path.resolve(__dirname, "db.json");
const defaultDbConfig = {
  host: "localhost",
  port: 5432,
  database: "compare_devices",
  user: "postgres",
};

let pool;
let poolSslOverride;

const parseSslPreference = () => {
  const rawValue = String(process.env.PG_SSL ?? "").trim().toLowerCase();

  if (!rawValue || rawValue === "auto" || rawValue === "prefer") {
    return null;
  }

  if (["true", "1", "yes", "require"].includes(rawValue)) {
    return true;
  }

  if (["false", "0", "no", "disable"].includes(rawValue)) {
    return false;
  }

  return null;
};

const getSslConfig = (sslOverride = poolSslOverride) => {
  const sslPreference = sslOverride ?? parseSslPreference();

  if (!sslPreference) {
    return false;
  }

  return { rejectUnauthorized: false };
};

const getConnectionConfig = (sslOverride = poolSslOverride) => {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    return {
      connectionString,
      ssl: getSslConfig(sslOverride),
    };
  }

  return {
    host: process.env.PGHOST ?? defaultDbConfig.host,
    port: Number.parseInt(process.env.PGPORT ?? String(defaultDbConfig.port), 10),
    database: process.env.PGDATABASE ?? defaultDbConfig.database,
    user: process.env.PGUSER ?? defaultDbConfig.user,
    password: process.env.PGPASSWORD ?? "",
    ssl: getSslConfig(sslOverride),
  };
};

const resetPool = async () => {
  if (!pool) {
    return;
  }

  const currentPool = pool;
  pool = null;
  await currentPool.end().catch(() => {});
};

const getPool = (sslOverride = poolSslOverride) => {
  if (pool && sslOverride === poolSslOverride) {
    return pool;
  }

  if (pool && sslOverride !== poolSslOverride) {
    pool.end().catch(() => {});
    pool = null;
  }

  poolSslOverride = sslOverride;
  pool = new Pool(getConnectionConfig(sslOverride));

  return pool;
};

const getSslFallbackOverride = (error) => {
  const message = String(error?.message ?? "").toLowerCase();

  if (message.includes("does not support ssl connections")) {
    return false;
  }

  if (
    message.includes("ssl off") ||
    message.includes("ssl is required") ||
    message.includes("must be enabled") ||
    message.includes("requires ssl")
  ) {
    return true;
  }

  return null;
};

const withSslFallback = async (operation) => {
  try {
    return await operation(getPool());
  } catch (error) {
    const fallbackOverride = getSslFallbackOverride(error);

    if (fallbackOverride === null || fallbackOverride === poolSslOverride) {
      throw error;
    }

    await resetPool();
    console.warn(
      `Retrying PostgreSQL connection with SSL ${fallbackOverride ? "enabled" : "disabled"} after connection mismatch.`
    );

    return operation(getPool(fallbackOverride));
  }
};

const query = (text, params = []) =>
  withSslFallback((activePool) => activePool.query(text, params));

const createDevicesTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT,
      price NUMERIC,
      payload JSONB NOT NULL,
      available BOOLEAN,
      display VARCHAR,
      "refreshRate" VARCHAR,
      processor VARCHAR,
      ram TEXT,
      storage TEXT,
      camera TEXT,
      battery TEXT,
      charging TEXT,
      os TEXT,
      image TEXT,
      "mobileWeight" TEXT,
      "frontCamera" TEXT,
      "backCamera" TEXT,
      "launchedYear" TEXT
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices (brand);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_devices_category ON devices (category);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_devices_catalog_search
    ON devices (brand, model, id);
  `);
};

const createUsersTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add updated_at column if it doesn't exist (for existing tables)
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  `);
};

const createProductTables = async () => {
  await query("CREATE TABLE IF NOT EXISTS user_sessions (id UUID PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  await query("CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions (user_id, expires_at) WHERE revoked_at IS NULL");
  await query("CREATE TABLE IF NOT EXISTS user_favorites (user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (user_id, device_id))");
  await query("CREATE TABLE IF NOT EXISTS saved_comparisons (id UUID PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, device_ids JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
};

const seedDevicesFromJson = async (seedFilePath = defaultSeedFilePath) => {
  const raw = await fs.readFile(seedFilePath, "utf-8");
  const data = JSON.parse(raw);
  const devices = Array.isArray(data.devices) ? data.devices : [];

  for (const device of devices) {
    await query(
      `
        INSERT INTO devices (id, brand, model, category, price, payload)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (id) DO UPDATE
        SET
          brand = EXCLUDED.brand,
          model = EXCLUDED.model,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          payload = EXCLUDED.payload;
      `,
      [
        String(device.id),
        device.brand ?? "Unknown",
        device.model ?? "Unknown",
        device.category ?? null,
        device.price ?? null,
        JSON.stringify(device),
      ]
    );
  }

  return devices.length;
};

const replaceDevicesFromJson = async (seedFilePath = defaultSeedFilePath) => {
  const raw = await fs.readFile(seedFilePath, "utf-8");
  const data = JSON.parse(raw);
  const devices = Array.isArray(data.devices) ? data.devices : [];
  const client = await withSslFallback((activePool) => activePool.connect());

  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE devices");

    for (const device of devices) {
      await client.query(
        `
          INSERT INTO devices (id, brand, model, category, price, payload)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        `,
        [
          String(device.id),
          device.brand ?? "Unknown",
          device.model ?? "Unknown",
          device.category ?? null,
          device.price ?? null,
          JSON.stringify(device),
        ]
      );
    }

    await client.query("COMMIT");
    return devices.length;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const initializeDatabase = async () => {
  await createDevicesTable();
  await createUsersTable();
  await createProductTables();

  const shouldAutoSeed = String(process.env.AUTO_SEED_DB ?? "false").toLowerCase() === "true";

  if (!shouldAutoSeed) {
    return;
  }

  if (String(process.env.NODE_ENV).toLowerCase() === "production") {
    throw new Error("AUTO_SEED_DB is not allowed in production. Run a reviewed import operation instead.");
  }

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM devices");

  if (rows[0]?.count === 0) {
    await seedDevicesFromJson();
  }
};

export {
  createDevicesTable,
  createUsersTable,
  createProductTables,
  getPool,
  initializeDatabase,
  query,
  replaceDevicesFromJson,
  seedDevicesFromJson,
};
