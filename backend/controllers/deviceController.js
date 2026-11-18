import { getDeviceById as getDeviceByIdFromDb, getDeviceBrands as getDeviceBrandsFromDb, getDeviceCatalog } from "../repositories/deviceRepository.js";
import { sanitizeDeviceFilters } from "../repositories/deviceQuery.js";
import { validateDeviceId } from "../validators/requestValidators.js";
import { sendData } from "../utils/apiResponse.js";

//Get all devices
const getDevices = async (req, res, next) => {
  try {
    const filters = sanitizeDeviceFilters(req.query);
    const { devices, total } = await getDeviceCatalog(filters);
    return sendData(res, 200, devices, {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
    });
  } catch (error) {
    return next(error);
  }
};

//Get device by id
const getDeviceById = async (req, res, next) => {
  try {
    const id = validateDeviceId(req.params.id);
    const device = await getDeviceByIdFromDb(id);

    if (!device) {
      const error = new Error("Device not found");
      error.status = 404;
      error.code = "NOT_FOUND";
      return next(error);
    }

    return sendData(res, 200, device);
  } catch (error) {
    return next(error);
  }
};

const getDeviceBrands = async (req, res, next) => {
  try {
    const category = String(req.query.category ?? "").trim().slice(0, 60);
    return sendData(res, 200, await getDeviceBrandsFromDb(category));
  } catch (error) {
    return next(error);
  }
};

export { getDeviceBrands, getDevices, getDeviceById };
