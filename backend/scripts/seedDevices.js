import dotenv from "dotenv";
import { createDevicesTable, replaceDevicesFromJson } from "../Config/db.js";

dotenv.config();

try {
  await createDevicesTable();
  const count = await replaceDevicesFromJson();
  console.log(`Replaced devices table with ${count} records from Data/db.json.`);
  process.exit(0);
} catch (error) {
  console.error("Failed to seed devices:", error.message);
  process.exit(1);
}
