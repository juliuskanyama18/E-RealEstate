import express from "express";
import { register, login, forgotPassword, resetPassword, getMe, setPassword } from "../controller/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);
router.post("/set-password/:token", setPassword);

export default router;
