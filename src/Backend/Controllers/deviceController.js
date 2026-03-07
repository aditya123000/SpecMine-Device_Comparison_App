import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, "../Data/db.json");

const readDevices = async () => {
  const raw = await fs.readFile(dbFilePath, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data.devices) ? data.devices : [];
};

//Get all devices
const getDevices = async (req, res, next) => {
  try {
    const devices = await readDevices();
    const limit = Number.parseInt(req.query.limit, 10);

    if (!Number.isNaN(limit) && limit > 0) {
      return res.status(200).json(devices.slice(0, limit));
    }

    return res.status(200).json(devices);
  } catch (error) {
    return next(error);
  }
};

//Get device by id
const getDeviceById = async (req, res, next) => {
  try {
    const devices = await readDevices();
    const device = devices.find((item) => String(item.id) === String(req.params.id));

    if (!device) {
      const error = new Error(`Device with id ${req.params.id} not found`);
      error.status = 404;
      return next(error);
    }

    return res.status(200).json(device);
  } catch (error) {
    return next(error);
  }
};

export { getDevices, getDeviceById };
