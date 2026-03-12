import express from "express";
import {
  createHouse,
  getHouses,
  getHouse,
  updateHouse,
  deleteHouse,
  getHouseTenants,
  addTenant,
  getTenants,
  getTenant,
  updateTenant,
  updateTenantBalance,
  removeTenant,
} from "../controller/landlordController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("landlord"));

router.post("/houses", createHouse);
router.get("/houses", getHouses);
router.get("/houses/:id", getHouse);
router.put("/houses/:id", updateHouse);
router.delete("/houses/:id", deleteHouse);
router.get("/houses/:id/tenants", getHouseTenants);

router.post("/tenants", addTenant);
router.get("/tenants", getTenants);
router.get("/tenants/:id", getTenant);
router.put("/tenants/:id", updateTenant);
router.put("/tenants/:id/balance", updateTenantBalance);
router.delete("/tenants/:id", removeTenant);

export default router;
