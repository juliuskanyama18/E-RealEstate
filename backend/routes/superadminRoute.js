import express from "express";
import {
  getDashboardStats,
  getAllLandlords,
  getLandlord,
  toggleLandlordStatus,
  deleteLandlord,
  getAllTenants,
  getAllMaintenanceRequests,
  getAllRentRecords,
  // User management
  getAllUsers,
  suspendUser,
  activateUser,
  softDeleteUser,
  restoreUser,
  hardDeleteUser,
  forcePasswordReset,
} from "../controller/superadminController.js";
import { protect, requireActive, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All routes require: valid JWT + active account + superadmin role
router.use(protect, requireActive, requireRole("superadmin"));

/* ── Dashboard ── */
router.get("/stats", getDashboardStats);

/* ── Landlord management (legacy — kept for LandlordDetail page) ── */
router.get("/landlords",             getAllLandlords);
router.get("/landlords/:id",         getLandlord);
router.put("/landlords/:id/toggle",  toggleLandlordStatus);
router.delete("/landlords/:id",      deleteLandlord);

/* ── Platform-wide views ── */
router.get("/tenants",               getAllTenants);
router.get("/maintenance",           getAllMaintenanceRequests);
router.get("/rent-records",          getAllRentRecords);

/* ── User management ──────────────────────────────────────────────
   READ
   GET    /api/admin/users                   — all landlords + tenants

   SAFE ACCOUNT CONTROL
   PATCH  /api/admin/users/:id/suspend       — disable login, preserve data
   PATCH  /api/admin/users/:id/activate      — re-enable account

   SOFT DELETE (REVERSIBLE)
   PATCH  /api/admin/users/:id/soft-delete   — hide user, preserve data
   PATCH  /api/admin/users/:id/restore       — undo soft delete

   HARD DELETE (IRREVERSIBLE — requires confirm:"CONFIRM_DELETE" in body)
   DELETE /api/admin/users/:id               — permanently removes all data

   PASSWORD MANAGEMENT (admin never sees password)
   POST   /api/admin/users/:id/force-reset-password — sends secure reset link
   ─────────────────────────────────────────────────────────────────── */
router.get("/users",                             getAllUsers);
router.patch("/users/:id/suspend",               suspendUser);
router.patch("/users/:id/activate",              activateUser);
router.patch("/users/:id/soft-delete",           softDeleteUser);
router.patch("/users/:id/restore",               restoreUser);
router.delete("/users/:id",                      hardDeleteUser);
router.post("/users/:id/force-reset-password",   forcePasswordReset);

export default router;
