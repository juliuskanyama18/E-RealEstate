import express from "express";
import { register, login, forgotPassword, resetPassword, getMe, setPassword, updateProfile, changePassword, googleAuth } from "../controller/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/set-password/:token", setPassword);
router.post("/google", googleAuth);

export default router;
