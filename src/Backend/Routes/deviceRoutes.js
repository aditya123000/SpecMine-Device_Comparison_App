import express from "express";
import { getDeviceById, getDevices } from "../Controllers/deviceController.js";

const router = express.Router();

router.get("/", getDevices);
router.get("/:id", getDeviceById);

export default router;
