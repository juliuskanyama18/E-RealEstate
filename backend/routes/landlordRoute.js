import express from "express";
import {
  createHouse,
  getHouses,
  getHouse,
  updateHouse,
  updateHousePhoto,
  deleteHouse,
  getHouseTenants,
  addTenant,
  getTenants,
  getTenant,
  updateTenant,
  updateTenantBalance,
  removeTenant,
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequest,
  updateMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  toggleMaintenanceStar,
  updateMaintenanceProContact,
  uploadMaintenancePhotos,
} from "../controller/landlordController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("landlord"));

router.post("/houses", createHouse);
router.get("/houses", getHouses);
router.get("/houses/:id", getHouse);
router.put("/houses/:id", updateHouse);
router.put("/houses/:id/photo", updateHousePhoto);
router.delete("/houses/:id", deleteHouse);
router.get("/houses/:id/tenants", getHouseTenants);

router.post("/tenants", addTenant);
router.get("/tenants", getTenants);
router.get("/tenants/:id", getTenant);
router.put("/tenants/:id", updateTenant);
router.put("/tenants/:id/balance", updateTenantBalance);
router.delete("/tenants/:id", removeTenant);

router.post("/maintenance", uploadMaintenancePhotos, createMaintenanceRequest);
router.get("/maintenance", getMaintenanceRequests);
router.get("/maintenance/:id", getMaintenanceRequest);
router.put("/maintenance/:id", uploadMaintenancePhotos, updateMaintenanceRequest);
router.put("/maintenance/:id/status", updateMaintenanceStatus);
router.post("/maintenance/:id/note", addMaintenanceNote);
router.put("/maintenance/:id/star", toggleMaintenanceStar);
router.put("/maintenance/:id/pro", updateMaintenanceProContact);

export default router;
