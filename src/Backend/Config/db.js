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

const getPool = () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: process.env.PGHOST ?? defaultDbConfig.host,
    port: Number.parseInt(process.env.PGPORT ?? String(defaultDbConfig.port), 10),
    database: process.env.PGDATABASE ?? defaultDbConfig.database,
    user: process.env.PGUSER ?? defaultDbConfig.user,
    password: process.env.PGPASSWORD ?? "",
    ssl: getSslConfig(),
  });

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

  const shouldAutoSeed = String(process.env.AUTO_SEED_DB ?? "true").toLowerCase() !== "false";

  if (!shouldAutoSeed) {
    return;
  }

  const { rows } = await query("SELECT COUNT(*)::int AS count FROM devices");

  if (rows[0]?.count === 0) {
    await seedDevicesFromJson();
  }
};

export { createDevicesTable, getPool, initializeDatabase, query, seedDevicesFromJson };
