import express from "express";
import { register, login, forgotPassword, resetPassword, getMe, setPassword, updateProfile, changePassword, googleAuth } from "../controller/authController.js";
import { protect, requireActive } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, requireActive, getMe);
router.put("/profile", protect, requireActive, updateProfile);
router.put("/password", protect, requireActive, changePassword);
router.post("/set-password/:token", setPassword);
router.post("/google", googleAuth);

export default router;
