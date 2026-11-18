import express from "express";
import { getDeviceBrands, getDeviceById, getDevices } from "../controllers/deviceController.js";

const router = express.Router();

router.get("/", getDevices);
router.get("/brands", getDeviceBrands);
router.get("/:id", getDeviceById);

export default router;
