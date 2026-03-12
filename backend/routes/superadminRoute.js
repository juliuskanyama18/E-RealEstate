import express from "express";
import {
  getDashboardStats,
  getAllLandlords,
  getLandlord,
  toggleLandlordStatus,
  deleteLandlord,
} from "../controller/superadminController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("superadmin"));

router.get("/stats", getDashboardStats);
router.get("/landlords", getAllLandlords);
router.get("/landlords/:id", getLandlord);
router.put("/landlords/:id/toggle", toggleLandlordStatus);
router.delete("/landlords/:id", deleteLandlord);

export default router;
