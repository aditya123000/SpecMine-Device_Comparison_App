import express from "express";
import { getCurrentUser, loginUser, registerUser } from "../Controllers/authController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

export default router;
