import { getDeviceById, getDevicesByIds } from "../repositories/deviceRepository.js";
import {
  addFavorite,
  getFavorites,
  getSavedComparisons,
  removeFavorite,
  removeSavedComparison,
  saveComparison,
} from "../repositories/libraryRepository.js";
import {
  getComparableCategory,
  validateComparisonPayload,
  validateDeviceId,
  validateUuid,
} from "../validators/requestValidators.js";
import { sendData } from "../utils/apiResponse.js";

const createHttpError = (status, message, code) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const listFavorites = async (req, res, next) => {
  try {
    sendData(res, 200, await getFavorites(req.user.id));
  } catch (error) {
    next(error);
  }
};

const createFavorite = async (req, res, next) => {
  try {
    const deviceId = validateDeviceId(req.params.deviceId);
    if (!(await getDeviceById(deviceId))) {
      throw createHttpError(404, "Device not found", "NOT_FOUND");
    }
    await addFavorite(req.user.id, deviceId);
    sendData(res, 201, { message: "Saved to your library" });
  } catch (error) {
    next(error);
  }
};

const deleteFavorite = async (req, res, next) => {
  try {
    const deviceId = validateDeviceId(req.params.deviceId);
    await removeFavorite(req.user.id, deviceId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const listComparisons = async (req, res, next) => {
  try {
    sendData(res, 200, await getSavedComparisons(req.user.id));
  } catch (error) {
    next(error);
  }
};

const createComparison = async (req, res, next) => {
  try {
    const { name, deviceIds } = validateComparisonPayload(req.body);
    const devices = await getDevicesByIds(deviceIds);

    if (devices.length !== deviceIds.length) {
      throw createHttpError(404, "One or more devices were not found", "NOT_FOUND");
    }

    const categories = new Set(devices.map(getComparableCategory));
    if (categories.size !== 1) {
      throw createHttpError(400, "All devices in a comparison must be in the same category", "VALIDATION_ERROR");
    }

    sendData(res, 201, await saveComparison(req.user.id, name, deviceIds));
  } catch (error) {
    next(error);
  }
};

const deleteComparison = async (req, res, next) => {
  try {
    const comparisonId = validateUuid(req.params.comparisonId, "Comparison ID");
    await removeSavedComparison(req.user.id, comparisonId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export {
  createComparison,
  createFavorite,
  deleteComparison,
  deleteFavorite,
  listComparisons,
  listFavorites,
};
