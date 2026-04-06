import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultSeedFilePath = path.resolve(__dirname, "../Data/db.json");
const defaultDbConfig = {
  host: "localhost",
  port: 5432,
  database: "compare_devices",
  user: "postgres",
};

let pool;

const getSslConfig = () => {
  const useSsl = String(process.env.PG_SSL ?? "").toLowerCase() === "true";

  if (!useSsl) {
    return false;
  }

  return { rejectUnauthorized: false };
};

const getConnectionConfig = () => {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    return {
      connectionString,
      ssl: getSslConfig(),
    };
  }

  return {
    host: process.env.PGHOST ?? defaultDbConfig.host,
    port: Number.parseInt(process.env.PGPORT ?? String(defaultDbConfig.port), 10),
    database: process.env.PGDATABASE ?? defaultDbConfig.database,
    user: process.env.PGUSER ?? defaultDbConfig.user,
    password: process.env.PGPASSWORD ?? "",
    ssl: getSslConfig(),
  };
};

const getPool = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool(getConnectionConfig());

  return pool;
};

const query = (text, params = []) => getPool().query(text, params);

const createDevicesTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT,
      price NUMERIC,
      payload JSONB NOT NULL
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_devices_brand ON devices (brand);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_devices_category ON devices (category);
  `);
};

const createUsersTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  `);
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

const initializeDatabase = async () => {
  await createDevicesTable();
  await createUsersTable();

  const shouldAutoSeed = String(process.env.AUTO_SEED_DB ?? "true").toLowerCase() !== "false";

  if (!shouldAutoSeed) {
    return;
  }

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM devices");

  if (rows[0]?.count === 0) {
    await seedDevicesFromJson();
  }
};

export { createDevicesTable, createUsersTable, getPool, initializeDatabase, query, seedDevicesFromJson };
