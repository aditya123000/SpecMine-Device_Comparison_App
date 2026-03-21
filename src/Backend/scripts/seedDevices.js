import dotenv from "dotenv";
import { createDevicesTable, seedDevicesFromJson } from "../Config/db.js";

dotenv.config();

try {
  await createDevicesTable();
  const count = await seedDevicesFromJson();
  console.log(`Seeded ${count} devices into PostgreSQL.`);
  process.exit(0);
} catch (error) {
  console.error("Failed to seed devices:", error.message);
  process.exit(1);
}
