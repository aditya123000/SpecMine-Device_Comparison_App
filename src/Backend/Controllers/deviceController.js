import { normalizeDevice } from "../Utils/normalizeDevice.js";
import {
  getAllDevices,
  getDeviceById as getDeviceByIdFromDb,
} from "../Repositories/deviceRepository.js";

//Get all devices
const getDevices = async (req, res, next) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10);
    const devices = await getAllDevices(Number.isNaN(limit) ? undefined : limit);
    const normalizedDevices = devices
      .map(normalizeDevice)
      .filter((device) => device !== null);
    return res.status(200).json(normalizedDevices);
  } catch (error) {
    return next(error);
  }
};

//Get device by id
const getDeviceById = async (req, res, next) => {
  try {
    const device = await getDeviceByIdFromDb(req.params.id);

    if (!device) {
      const error = new Error(`Device with id ${req.params.id} not found`);
      error.status = 404;
      return next(error);
    }

    return res.status(200).json(normalizeDevice(device));
  } catch (error) {
    return next(error);
  }
};

export { getDevices, getDeviceById };
