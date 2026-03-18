import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import House from "../models/House.js";
import RentRecord from "../models/RentRecord.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import { sendEmail } from "../config/nodemailer.js";
import { getAdminPasswordResetTemplate } from "../utils/emailTemplates.js";

/* ── Safe field projection — NEVER exposes password or tokens ── */
const USER_SAFE_FIELDS =
  "-password -resetToken -resetTokenExpire";

/* ── Dashboard Stats ── */
export const getDashboardStats = async (req, res) => {
  try {
    const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    const [
      totalLandlords,
      activeLandlords,
      totalTenants,
      overdueTenantsCount,
      totalHouses,
      occupiedHouses,
      rentAgg,
      totalMaintenance,
      openMaintenance,
      collectedAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "landlord" }),
      User.countDocuments({ role: "landlord", isActive: true }),
      User.countDocuments({ role: "tenant" }),
      User.countDocuments({ role: "tenant", balance: { $lt: 0 } }),
      House.countDocuments(),
      House.countDocuments({ isOccupied: true }),
      User.aggregate([
        { $match: { role: "tenant", rentAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$rentAmount" } } },
      ]),
      MaintenanceRequest.countDocuments(),
      MaintenanceRequest.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      RentRecord.aggregate([
        { $match: { month: thisMonth, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalMonthlyRent    = rentAgg[0]?.total || 0;
    const collectedThisMonth  = collectedAgg[0]?.total || 0;
    const collectedCount      = collectedAgg[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalLandlords,
        activeLandlords,
        suspendedLandlords:  totalLandlords - activeLandlords,
        totalTenants,
        overdueTenantsCount,
        totalHouses,
        occupiedHouses,
        totalMonthlyRent,
        totalMaintenance,
        openMaintenance,
        collectedThisMonth,
        collectedCount,
        thisMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── All Landlords (with counts) ── */
export const getAllLandlords = async (req, res) => {
  try {
    const landlords    = await User.find({ role: "landlord" })
      .select("name email phone isActive createdAt")
      .sort({ createdAt: -1 });

    const landlordIds  = landlords.map((l) => l._id);

    const [houseCounts, tenantCounts] = await Promise.all([
      House.aggregate([
        { $match: { landlord: { $in: landlordIds } } },
        { $group: { _id: "$landlord", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { role: "tenant", landlord: { $in: landlordIds } } },
        { $group: { _id: "$landlord", count: { $sum: 1 } } },
      ]),
    ]);

    const houseMap  = Object.fromEntries(houseCounts.map((h) => [h._id.toString(), h.count]));
    const tenantMap = Object.fromEntries(tenantCounts.map((t) => [t._id.toString(), t.count]));

    const result = landlords.map((l) => ({
      ...l.toObject(),
      houseCount:  houseMap[l._id.toString()]  || 0,
      tenantCount: tenantMap[l._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── Single Landlord Detail ── */
export const getLandlord = async (req, res) => {
  try {
    const landlord = await User.findOne({ _id: req.params.id, role: "landlord" })
      .select("-password -resetToken -resetTokenExpire");
    if (!landlord) {
      return res.status(404).json({ success: false, message: "Landlord not found" });
    }

    const [houses, tenants] = await Promise.all([
      House.find({ landlord: req.params.id }),
      User.find({ landlord: req.params.id, role: "tenant" })
        .select("-password -resetToken -resetTokenExpire")
        .populate("house", "name address"),
    ]);

    res.json({ success: true, data: { landlord, houses, tenants } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── Toggle Landlord Status ── */
export const toggleLandlordStatus = async (req, res) => {
  try {
    const landlord = await User.findOne({ _id: req.params.id, role: "landlord" });
    if (!landlord) {
      return res.status(404).json({ success: false, message: "Landlord not found" });
    }

    const newStatus    = !landlord.isActive;
    landlord.isActive  = newStatus;
    await landlord.save();

    // Cascade to tenants
    await User.updateMany({ landlord: req.params.id, role: "tenant" }, { isActive: newStatus });

    res.json({
      success: true,
      message: `Landlord ${newStatus ? "activated" : "suspended"} successfully`,
      data: { isActive: newStatus },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── Delete Landlord (cascade) ── */
export const deleteLandlord = async (req, res) => {
  try {
    const landlord = await User.findOne({ _id: req.params.id, role: "landlord" });
    if (!landlord) {
      return res.status(404).json({ success: false, message: "Landlord not found" });
    }

    await Promise.all([
      User.deleteMany({ landlord: req.params.id, role: "tenant" }),
      House.deleteMany({ landlord: req.params.id }),
      RentRecord.deleteMany({ landlord: req.params.id }),
      MaintenanceRequest.deleteMany({ landlord: req.params.id }),
      User.deleteOne({ _id: req.params.id }),
    ]);

    res.json({ success: true, message: "Landlord and all associated data deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── All Tenants (platform-wide) ── */
export const getAllTenants = async (req, res) => {
  try {
    const { search, status } = req.query;

    const query = { role: "tenant" };
    if (status === "active")    query.isActive = true;
    if (status === "suspended") query.isActive = false;
    if (status === "overdue")   query.balance  = { $lt: 0 };

    let tenants = await User.find(query)
      .select("-password -resetToken -resetTokenExpire")
      .populate("landlord", "name email isActive")
      .populate("house", "name address city")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      tenants = tenants.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.house?.name?.toLowerCase().includes(q) ||
          t.landlord?.name?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── All Maintenance Requests (platform-wide) ── */
export const getAllMaintenanceRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};

    const requests = await MaintenanceRequest.find(query)
      .populate("landlord", "name email")
      .populate("house", "name address city")
      .populate("tenant", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── All Rent Records (platform-wide) ── */
export const getAllRentRecords = async (req, res) => {
  try {
    const { month, status } = req.query;

    const query = {};
    if (month)  query.month  = month;
    if (status) query.status = status;

    const [records, monthlyStats] = await Promise.all([
      RentRecord.find(query)
        .populate("tenant",   "name email")
        .populate("landlord", "name email")
        .populate("house",    "name address")
        .sort({ dueDate: -1 })
        .limit(200),
      RentRecord.aggregate([
        {
          $group: {
            _id:   { month: "$month", status: "$status" },
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": -1 } },
        { $limit: 36 },
      ]),
    ]);

    res.json({ success: true, data: records, monthlyStats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ════════════════════════════════════════════════════════════════
   USER MANAGEMENT — secure, no password fields ever returned
   ════════════════════════════════════════════════════════════════ */

/* ── GET all users (landlords + tenants, including soft-deleted) ── */
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    // Base: never include superadmins in user management
    const query = { role: { $in: ["landlord", "tenant"] } };

    if (role === "landlord" || role === "tenant") query.role = role;
    if (status === "active")    { query.isActive = true;  query.isDeleted = false; }
    if (status === "suspended") { query.isActive = false; query.isDeleted = false; }
    if (status === "deleted")   query.isDeleted = true;

    let users = await User.find(query)
      .select(USER_SAFE_FIELDS)
      .populate("landlord", "name email")
      .populate("house",    "name address")
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q)     ||
          u.email?.toLowerCase().includes(q)    ||
          u.landlord?.name?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── SUSPEND a user ── */
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id:       req.params.id,
      role:      { $in: ["landlord", "tenant"] },
      isDeleted: false,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(400).json({ success: false, message: "User is already suspended" });
    }

    user.isActive = false;
    await user.save();

    // If landlord: cascade suspension to all their tenants
    if (user.role === "landlord") {
      await User.updateMany(
        { landlord: user._id, role: "tenant", isDeleted: false },
        { isActive: false }
      );
    }

    res.json({ success: true, message: `${user.name} suspended successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── ACTIVATE a user ── */
export const activateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id:       req.params.id,
      role:      { $in: ["landlord", "tenant"] },
      isDeleted: false,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.isActive) {
      return res.status(400).json({ success: false, message: "User is already active" });
    }

    user.isActive = true;
    await user.save();

    // Note: we do NOT auto-activate tenants when a landlord is activated,
    // because tenants may have been individually suspended for separate reasons.

    res.json({ success: true, message: `${user.name} activated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── SOFT DELETE a user (data preserved, account hidden) ── */
export const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id:       req.params.id,
      role:      { $in: ["landlord", "tenant"] },
      isDeleted: false,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now        = new Date();
    user.isDeleted   = true;
    user.deletedAt   = now;
    user.isActive    = false;           // Suspended alongside deletion
    await user.save();

    // If landlord: cascade soft-delete to all their tenants
    if (user.role === "landlord") {
      await User.updateMany(
        { landlord: user._id, role: "tenant", isDeleted: false },
        { isDeleted: true, deletedAt: now, isActive: false }
      );
    }

    res.json({
      success: true,
      message: `${user.name} soft-deleted. Data is preserved and can be restored.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── RESTORE a soft-deleted user ── */
export const restoreUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id:       req.params.id,
      role:      { $in: ["landlord", "tenant"] },
      isDeleted: true,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "Deleted user not found" });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.isActive  = true;
    await user.save();

    res.json({ success: true, message: `${user.name} restored successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── HARD DELETE a user — DANGEROUS, requires explicit confirmation ── */
export const hardDeleteUser = async (req, res) => {
  try {
    const { confirm } = req.body;

    // Require the caller to send the exact confirmation string
    if (confirm !== "CONFIRM_DELETE") {
      return res.status(400).json({
        success: false,
        message: 'Hard delete requires confirm: "CONFIRM_DELETE" in the request body.',
      });
    }

    const user = await User.findOne({
      _id:  req.params.id,
      role: { $in: ["landlord", "tenant"] },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "landlord") {
      // Cascade: remove all landlord data
      await Promise.all([
        User.deleteMany({ landlord: user._id, role: "tenant" }),
        House.deleteMany({ landlord: user._id }),
        RentRecord.deleteMany({ landlord: user._id }),
        MaintenanceRequest.deleteMany({ landlord: user._id }),
      ]);
    } else {
      // Tenant only: remove their records and free their house
      const tenantHouseId = user.house;
      await Promise.all([
        RentRecord.deleteMany({ tenant: user._id }),
        MaintenanceRequest.deleteMany({ tenant: user._id }),
      ]);
      // Free the house slot if occupied by this tenant
      if (tenantHouseId) {
        const remaining = await User.countDocuments({
          house: tenantHouseId,
          role: "tenant",
          _id: { $ne: user._id },
        });
        if (remaining === 0) {
          await House.findByIdAndUpdate(tenantHouseId, { isOccupied: false });
        }
      }
    }

    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: `${user.name} permanently deleted along with all associated data.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/* ── FORCE PASSWORD RESET — generates a secure token, emails reset link ── */
/* Admin never sees or sets the password. User resets via secure link.    */
export const forcePasswordReset = async (req, res) => {
  try {
    const user = await User.findOne({
      _id:       req.params.id,
      role:      { $in: ["landlord", "tenant"] },
      isDeleted: false,
    }).select("+resetToken +resetTokenExpire");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a cryptographically secure token
    const rawToken    = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Token valid for 60 minutes
    user.resetToken        = hashedToken;
    user.resetTokenExpire  = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.WEBSITE_URL}/set-password/${rawToken}`;

    try {
      await sendEmail({
        from:    process.env.EMAIL,
        to:      user.email,
        subject: "Password Reset — Action Required",
        html:    getAdminPasswordResetTemplate(user, resetUrl),
      });
    } catch {
      // Roll back token if email fails
      user.resetToken       = undefined;
      user.resetTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Failed to send reset email. Token rolled back." });
    }

    res.json({
      success: true,
      message: `Password reset link sent to ${user.email}. Link expires in 60 minutes.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
