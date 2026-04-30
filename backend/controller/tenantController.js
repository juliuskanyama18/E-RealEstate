import path from "path";
import fs from "fs";
import multer from "multer";
import User from "../models/User.js";
import Lease from "../models/Lease.js";
import RentRecord from "../models/RentRecord.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Document from "../models/Document.js";
import Reminder from "../models/Reminder.js";

const maintUploadDir = path.resolve("uploads/maintenance");
if (!fs.existsSync(maintUploadDir)) fs.mkdirSync(maintUploadDir, { recursive: true });

const maintStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, maintUploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

export const uploadTenantMaintenancePhotos = multer({
  storage: maintStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
}).array("photos", 10);

export const getMyDetails = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id)
      .select("-password -resetToken -resetTokenExpire")
      .populate("house", "name address city bedrooms bathrooms description")
      .populate("landlord", "name email phone");

    if (!tenant) return res.status(404).json({ success: false, message: "Account not found" });
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getRentStatus = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id)
      .select("name rentAmount balance rentDueDate leaseStart leaseEnd house")
      .populate("house", "name address city");

    if (!tenant) return res.status(404).json({ success: false, message: "Account not found" });

    // Fall back to the Lease document for dates not stored on User (e.g. existing linked tenants)
    let leaseStart = tenant.leaseStart;
    let leaseEnd   = tenant.leaseEnd;
    if ((!leaseStart || !leaseEnd) && tenant._id) {
      const lease = await Lease.findOne({ tenant: tenant._id }).select("startDate endDate rentAmount paymentDay").lean();
      if (lease) {
        if (!leaseStart) leaseStart = lease.startDate;
        if (!leaseEnd)   leaseEnd   = lease.endDate;
      }
    }

    const today = new Date();
    const currentDay = today.getDate();
    const daysUntilDue =
      tenant.rentDueDate >= currentDay
        ? tenant.rentDueDate - currentDay
        : tenant.rentDueDate +
          new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() -
          currentDay;

    res.json({
      success: true,
      data: {
        rentAmount: tenant.rentAmount,
        balance: tenant.balance,
        rentDueDate: tenant.rentDueDate,
        daysUntilDue,
        leaseStart,
        leaseEnd,
        status: tenant.balance >= 0 ? "paid" : "outstanding",
        house: tenant.house,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getRentHistory = async (req, res) => {
  try {
    const records = await RentRecord.find({ tenant: req.user._id })
      .populate("tenant", "name")
      .sort({ dueDate: -1 })
      .limit(48);

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyMaintenanceRequests = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id).select("house landlord");
    if (!tenant?.house) return res.json({ success: true, data: [] });

    const requests = await MaintenanceRequest.find({
      house: tenant.house,
      landlord: tenant.landlord,
      viewableBy: 'all',
    })
      .populate("house", "name address city")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createTenantMaintenanceRequest = (req, res) => {
  uploadTenantMaintenancePhotos(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const { category, title, description, preferredTime } = req.body;
      if (!category || !title || !description) {
        return res.status(400).json({ success: false, message: "category, title, and description are required" });
      }

      const tenant = await User.findById(req.user._id).select("house landlord");
      if (!tenant?.house) {
        return res.status(400).json({ success: false, message: "You are not assigned to a house" });
      }

      const photos = (req.files || []).map(f => `/uploads/maintenance/${f.filename}`);

      const request = await MaintenanceRequest.create({
        landlord: tenant.landlord,
        house: tenant.house,
        tenant: req.user._id,
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        photos,
        preferredTime: preferredTime || "ANYTIME",
        submittedBy: "tenant",
        activityLog: [{ entryType: "created", addedBy: "tenant", timestamp: new Date() }],
      });

      res.status(201).json({ success: true, data: request });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
};

export const getPaymentSchedule = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id)
      .select("rentAmount rentDueDate leaseStart leaseEnd house")
      .populate("house", "name");

    if (!tenant) return res.status(404).json({ success: false, message: "Account not found" });

    // Prefer User fields; fall back to Lease document for pre-fix linked tenants
    let leaseStart  = tenant.leaseStart;
    let leaseEnd    = tenant.leaseEnd;
    let rentAmount  = tenant.rentAmount;
    let rentDueDate = tenant.rentDueDate;

    if (!leaseStart || !leaseEnd || !rentAmount || !rentDueDate) {
      const lease = await Lease.findOne({ tenant: tenant._id })
        .select("startDate endDate rentAmount paymentDay")
        .lean();
      if (lease) {
        if (!leaseStart)  leaseStart  = lease.startDate;
        if (!leaseEnd)    leaseEnd    = lease.endDate;
        if (!rentAmount)  rentAmount  = lease.rentAmount;
        if (!rentDueDate) rentDueDate = lease.paymentDay === 31 ? 1 : lease.paymentDay;
      }
    }

    if (!rentAmount || !rentDueDate) {
      return res.json({ success: true, data: [] });
    }

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const today  = new Date(); today.setHours(0, 0, 0, 0);

    // Normalise to local midnight so date comparisons are timezone-safe
    const toLocal = (d) => { const dt = new Date(d); return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()); };
    const leaseS = leaseStart ? toLocal(leaseStart) : null;
    const leaseE = leaseEnd   ? toLocal(leaseEnd)   : null;

    // Start from the lease start month (or 6 months back max) so all overdue entries appear
    const leaseStartOffset = leaseS
      ? (leaseS.getFullYear() - today.getFullYear()) * 12 + (leaseS.getMonth() - today.getMonth())
      : -1;
    const startOffset = Math.max(-6, leaseStartOffset);
    const houseName = tenant.house?.name || "your property";

    // Cross-reference paid months so they don't show as upcoming/overdue
    const paidRecords = await RentRecord.find({ tenant: req.user._id, status: 'paid' }).select('month').lean();
    const paidMonths  = new Set(paidRecords.map(r => r.month));

    const rows = [];
    for (let offset = startOffset; offset <= 4; offset++) {
      const yr   = today.getFullYear();
      const mo   = today.getMonth() + offset;
      const last = new Date(yr, mo + 1, 0).getDate();
      const day  = Math.min(rentDueDate, last);
      const due  = new Date(yr, mo, day);
      if (leaseS && due < leaseS) continue;
      if (leaseE && due > leaseE) continue;
      const moNorm   = ((mo % 12) + 12) % 12;
      const monthKey = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}`;
      if (paidMonths.has(monthKey)) continue; // skip already-paid months
      rows.push({
        key: `${yr}-${mo}`,
        day,
        month: MONTHS[moNorm],
        year: due.getFullYear(),
        dueDate: due.toISOString(),
        overdue: due < today,
        amount: rentAmount,
        category: "Rent",
        description: `Rent for ${houseName}`,
      });
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getLandlordDetails = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id).select("landlord").lean();
    if (!tenant?.landlord) return res.status(404).json({ success: false, message: "Landlord not found" });

    const landlord = await User.findById(tenant.landlord)
      .select("name email phone businessName address city bankName bankAccountNumber bankAccountName")
      .lean();

    if (!landlord) return res.status(404).json({ success: false, message: "Landlord not found" });
    res.json({ success: true, data: landlord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ tenant: req.user._id, notifyTenant: true })
      .populate("house", "name address city")
      .sort({ dateTime: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const tenant = await User.findById(req.user._id).select("house");
    if (!tenant?.house) return res.json({ success: true, data: [] });

    const docs = await Document.find({ house: tenant.house }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
