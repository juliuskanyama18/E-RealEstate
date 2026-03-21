import express from "express";
import { getMyDetails, getRentStatus, getRentHistory, getMyMaintenanceRequests, createTenantMaintenanceRequest, getMyDocuments } from "../controller/tenantController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("tenant"));

router.get("/me", getMyDetails);
router.get("/rent-status", getRentStatus);
router.get("/rent-history", getRentHistory);
router.get("/maintenance", getMyMaintenanceRequests);
router.post("/maintenance", createTenantMaintenanceRequest);
router.get("/documents", getMyDocuments);

export default router;
