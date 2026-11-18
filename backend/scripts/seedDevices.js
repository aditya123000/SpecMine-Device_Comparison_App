import dotenv from "dotenv";
import { createDevicesTable, replaceDevicesFromJson } from "../config/db.js";

dotenv.config();

try {
  if (process.env.SEED_REPLACE_CONFIRM !== "replace-device-catalog") {
    throw new Error(
      "Refusing to replace the device catalog. Set SEED_REPLACE_CONFIRM=replace-device-catalog only for an approved replacement."
    );
  }

  await createDevicesTable();
  const count = await replaceDevicesFromJson();
  console.log(`Replaced devices table with ${count} records from data/db.json.`);
  process.exit(0);
} catch (error) {
  console.error("Failed to seed devices:", error.message);
  process.exit(1);
}
