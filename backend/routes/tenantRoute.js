import express from "express";
import { getMyDetails, getRentStatus, getRentHistory, getPaymentSchedule, getMyMaintenanceRequests, createTenantMaintenanceRequest, getLandlordDetails, getMyDocuments, getMyReminders } from "../controller/tenantController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("tenant"));

router.get("/me", getMyDetails);
router.get("/rent-status", getRentStatus);
router.get("/rent-history", getRentHistory);
router.get("/schedule", getPaymentSchedule);
router.get("/maintenance", getMyMaintenanceRequests);
router.post("/maintenance", createTenantMaintenanceRequest);
router.get("/landlord", getLandlordDetails);
router.get("/documents", getMyDocuments);
router.get("/reminders", getMyReminders);

export default router;
