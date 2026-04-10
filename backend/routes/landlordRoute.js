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
  recordPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  createCharge,
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceRequest,
  updateMaintenanceRequest,
  updateMaintenanceStatus,
  addMaintenanceNote,
  toggleMaintenanceStar,
  updateMaintenanceProContact,
  deleteMaintenanceRequest,
  uploadMaintenancePhotos,
  uploadHousePhoto,
  getCashflow,
  getOrgSettings,
  updateOrgSettings,
  createLease,
  getAllActiveLeases,
  getHouseLease,
  updateLease,
  linkTenantToLease,
  createAndLinkTenant,
  inviteTenant,
  getDocuments,
  createDocument,
  deleteDocument,
  uploadDocumentFile,
  getAllReminders,
  createAnyReminder,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../controller/landlordController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, requireActive, requireRole("landlord"));

router.get("/cashflow", getCashflow);
router.get("/org", getOrgSettings);
router.put("/org", updateOrgSettings);

router.post("/houses", uploadHousePhoto, createHouse);
router.get("/houses", getHouses);
router.get("/houses/:id", getHouse);
router.put("/houses/:id", updateHouse);
router.put("/houses/:id/photo", updateHousePhoto);
router.delete("/houses/:id", deleteHouse);
router.get("/houses/:id/tenants", getHouseTenants);
router.get("/leases", getAllActiveLeases);
router.post("/houses/:id/leases", createLease);
router.get("/houses/:id/lease", getHouseLease);
router.put("/leases/:leaseId", updateLease);
router.put("/leases/:leaseId/tenant", linkTenantToLease);
router.post("/leases/:leaseId/tenant", createAndLinkTenant);

router.get("/payments",      getPayments);
router.post("/payments",     recordPayment);
router.get("/payments/:id",  getPayment);
router.put("/payments/:id",  updatePayment);
router.delete("/payments/:id", deletePayment);
router.post("/charges",      createCharge);

router.post("/tenants", addTenant);
router.get("/tenants", getTenants);
router.get("/tenants/:id", getTenant);
router.put("/tenants/:id", updateTenant);
router.post("/tenants/:id/invite", inviteTenant);
router.put("/tenants/:id/balance", updateTenantBalance);
router.delete("/tenants/:id", removeTenant);

router.get("/houses/:id/documents", getDocuments);
router.post("/houses/:id/documents", uploadDocumentFile, createDocument);
router.delete("/documents/:docId", deleteDocument);

router.post("/maintenance", uploadMaintenancePhotos, createMaintenanceRequest);
router.get("/maintenance", getMaintenanceRequests);
router.get("/maintenance/:id", getMaintenanceRequest);
router.put("/maintenance/:id", uploadMaintenancePhotos, updateMaintenanceRequest);
router.put("/maintenance/:id/status", updateMaintenanceStatus);
router.post("/maintenance/:id/note", addMaintenanceNote);
router.put("/maintenance/:id/star", toggleMaintenanceStar);
router.put("/maintenance/:id/pro", updateMaintenanceProContact);
router.delete("/maintenance/:id", deleteMaintenanceRequest);

router.get("/reminders", getAllReminders);
router.post("/reminders", createAnyReminder);
router.get("/houses/:id/reminders", getReminders);
router.post("/houses/:id/reminders", createReminder);
router.put("/reminders/:reminderId", updateReminder);
router.delete("/reminders/:reminderId", deleteReminder);

export default router;
