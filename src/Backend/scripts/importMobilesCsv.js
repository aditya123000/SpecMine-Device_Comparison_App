import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultCsvPath = path.resolve(
  __dirname,
  "../../../tmp_csv_import/Mobiles Dataset (2025).csv"
);
const outputJsonPath = path.resolve(__dirname, "../Data/db.json");

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
};

const parseCsv = (content) => {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n").filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {});
  });
};

const extractNumericPrice = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
};

const extractStorage = (modelName) => {
  const match = String(modelName || "").match(/(\d+(?:\.\d+)?)\s?(GB|TB)\b/i);
  return match ? `${match[1]} ${match[2].toUpperCase()}` : "";
};

const stripStorageFromModelName = (modelName) =>
  String(modelName || "")
    .replace(/\s+\d+(?:\.\d+)?\s?(GB|TB)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const inferPhoneOs = (brand) => {
  const normalizedBrand = String(brand || "").trim().toLowerCase();

  if (normalizedBrand === "apple") {
    return "iOS";
  }

  return normalizedBrand ? "Android" : "Not specified";
};

const sanitizeValue = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || "";
};

const mapMobileRecord = (row, index) => {
  const price = extractNumericPrice(row["Launched Price (India)"]);
  const frontCamera = sanitizeValue(row["Front Camera"]);
  const backCamera = sanitizeValue(row["Back Camera"]);
  const storage = extractStorage(row["Model Name"]);

  return {
    id: `phone-${index + 1}`,
    category: "phones",
    brand: sanitizeValue(row["Company Name"]) || "Unknown",
    model: stripStorageFromModelName(sanitizeValue(row["Model Name"])) || `Mobile ${index + 1}`,
    price,
    available: price !== null,
    display: sanitizeValue(row["Screen Size"]),
    refreshRate: "Not specified",
    processor: sanitizeValue(row["Processor"]),
    ram: sanitizeValue(row["RAM"]),
    storage: storage || "Not specified",
    camera: backCamera,
    battery: sanitizeValue(row["Battery Capacity"]),
    charging: "Not specified",
    os: inferPhoneOs(row["Company Name"]),
    image: "https://img.icons8.com/fluency/480/iphone-x.png",
    mobileWeight: sanitizeValue(row["Mobile Weight"]),
    frontCamera,
    backCamera,
    launchedYear: sanitizeValue(row["Launched Year"]),
  };
};

const isNonPhoneDevice = (device) => String(device?.category || "").toLowerCase() !== "phones";

const importMobilesCsv = async (csvPath = defaultCsvPath) => {
  const [csvContent, existingJson] = await Promise.all([
    fs.readFile(csvPath, "utf-8"),
    fs.readFile(outputJsonPath, "utf-8"),
  ]);

  const rows = parseCsv(csvContent);
  const importedPhones = rows
    .map(mapMobileRecord)
    .filter((device) => device.brand && device.model && device.price !== null);

  const existingData = JSON.parse(existingJson);
  const existingDevices = Array.isArray(existingData.devices) ? existingData.devices : [];
  const nonPhoneDevices = existingDevices.filter(isNonPhoneDevice);
  const nextData = { devices: [...importedPhones, ...nonPhoneDevices] };

  await fs.writeFile(outputJsonPath, `${JSON.stringify(nextData, null, 2)}\n`, "utf-8");

  console.log(
    `Imported ${importedPhones.length} phone records from ${path.basename(csvPath)} and preserved ${nonPhoneDevices.length} non-phone devices.`
  );
};

const csvPath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultCsvPath;

importMobilesCsv(csvPath).catch((error) => {
  console.error("Failed to import mobiles CSV:", error.message);
  process.exit(1);
});
