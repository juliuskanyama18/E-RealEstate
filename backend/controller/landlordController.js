import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import House from "../models/House.js";
import User from "../models/User.js";
import RentRecord from "../models/RentRecord.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Lease from "../models/Lease.js";
import Document from "../models/Document.js";
import Reminder from "../models/Reminder.js";
import OrgPayment from "../models/OrgPayment.js";
import Expense from "../models/Expense.js";
import RentHistory from "../models/RentHistory.js";
import Supplier from "../models/Supplier.js";
import { sendEmail } from "../config/nodemailer.js";
import { getTenantWelcomeTemplate, getTenantInviteTemplate } from "../utils/emailTemplates.js";

// ─── Multer setup for house photos ─────────────────────────────────────────
const uploadDir = path.resolve("uploads/houses");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ─── Multer setup for documents ─────────────────────────────────────────────
const docUploadDir = path.resolve("uploads/documents");
if (!fs.existsSync(docUploadDir)) fs.mkdirSync(docUploadDir, { recursive: true });

// ─── Multer setup for receipts ───────────────────────────────────────────────
const receiptUploadDir = path.resolve("uploads/receipts");
if (!fs.existsSync(receiptUploadDir)) fs.mkdirSync(receiptUploadDir, { recursive: true });
const receiptStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, receiptUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const ALLOWED_RECEIPT_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
  "application/pdf",
  "application/msword",                                                        // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
  "application/vnd.ms-excel",                                                  // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        // .xlsx
]);
export const uploadReceiptFile = multer({
  storage: receiptStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_RECEIPT_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only images and documents (PDF, Word, Excel) are allowed"));
  },
}).single("receiptImage");

const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, docUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
export const uploadDocumentFile = multer({
  storage: docStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}).single("file");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
export const uploadHousePhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith("image/"));
  },
}).single("photo");

// ─── Houses ────────────────────────────────────────────────────────────────

export const createHouse = async (req, res) => {
  try {
    const { name, address, city, rentAmount, bedrooms, bathrooms, description } = req.body;
    if (!name || !address || !city || rentAmount === undefined) {
      return res.status(400).json({ success: false, message: "name, address, city, and rentAmount are required" });
    }
    if (Number(rentAmount) < 0) {
      return res.status(400).json({ success: false, message: "Rent amount cannot be negative" });
    }

    const house = await House.create({
      landlord: req.user._id,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      rentAmount: Number(rentAmount),
      bedrooms: bedrooms ? Number(bedrooms) : 1,
      bathrooms: bathrooms ? Number(bathrooms) : 1,
      description: description?.trim(),
      photo: req.file ? `/uploads/houses/${req.file.filename}` : undefined,
    });

    res.status(201).json({ success: true, message: "House created", data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouses = async (req, res) => {
  try {
    const houses = await House.find({ landlord: req.user._id }).sort({ createdAt: -1 });

    // Attach lease + tenant info to each house
    const leases = await Lease.find({ landlord: req.user._id })
      .populate("tenant", "name email")
      .lean();
    const leaseByHouse = {};
    for (const l of leases) {
      const hid = l.house?.toString();
      if (hid) leaseByHouse[hid] = l;
    }

    // Check which houses had rent paid this month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const paidRecords = await RentRecord.find({
      landlord: req.user._id,
      month: currentMonth,
      status: "paid",
    }).select("house");
    const paidHouseIds = new Set(paidRecords.map(r => r.house?.toString()).filter(Boolean));

    const enriched = houses.map(h => {
      const hObj = h.toObject();
      const lease = leaseByHouse[h._id.toString()];
      if (lease) {
        hObj.lease = {
          paymentDay: lease.paymentDay,
          rentAmount: lease.rentAmount,
          frequency: lease.frequency,
          endDate: lease.endDate,
          status: lease.status,
          tenant: lease.tenant || null,
        };
      }
      // Compute rent status for tab filtering
      if (hObj.isOccupied && hObj.lease?.paymentDay) {
        const isPaid = paidHouseIds.has(h._id.toString());
        if (isPaid) {
          hObj.rentStatus = null; // paid this month — not overdue or due soon
        } else {
          const currentDay = now.getDate();
          const paymentDay = hObj.lease.paymentDay;
          if (currentDay > paymentDay) {
            hObj.rentStatus = "overdue";
          } else if (paymentDay - currentDay <= 5) {
            hObj.rentStatus = "due_soon";
          } else {
            hObj.rentStatus = null;
          }
        }
      }
      return hObj;
    });

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouse = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });
    res.json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateHouse = async (req, res) => {
  try {
    const { name, address, city, rentAmount, bedrooms, bathrooms, description, isOccupied } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (address) updates.address = address.trim();
    if (city) updates.city = city.trim();
    if (rentAmount !== undefined) {
      if (Number(rentAmount) < 0) return res.status(400).json({ success: false, message: "Rent amount cannot be negative" });
      updates.rentAmount = Number(rentAmount);
    }
    if (bedrooms !== undefined) updates.bedrooms = Number(bedrooms);
    if (bathrooms !== undefined) updates.bathrooms = Number(bathrooms);
    if (description !== undefined) updates.description = description.trim();
    if (isOccupied !== undefined) updates.isOccupied = isOccupied === true || isOccupied === 'true';

    const house = await House.findOneAndUpdate({ _id: req.params.id, landlord: req.user._id }, updates, { new: true, runValidators: true });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });
    res.json({ success: true, message: "House updated", data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateHousePhoto = (req, res) => {
  uploadHousePhoto(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    try {
      const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
      if (!house) return res.status(404).json({ success: false, message: "House not found" });

      const updates = {};

      if (req.file) {
        // New photo uploaded — delete old file first, then replace
        if (house.photo) {
          const oldPath = path.resolve(house.photo.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updates.photo = `/uploads/houses/${req.file.filename}`;
      } else if (req.body.removePhoto === "true") {
        // User explicitly deleted the photo — remove file and clear field
        if (house.photo) {
          const oldPath = path.resolve(house.photo.replace(/^\//, ""));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updates.photo = null;
      }

      if (req.body.nickname !== undefined) updates.nickname = req.body.nickname.trim();

      const updated = await House.findOneAndUpdate(
        { _id: req.params.id, landlord: req.user._id },
        updates,
        { new: true }
      );
      res.json({ success: true, message: "House updated", data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  });
};

export const deleteHouse = async (req, res) => {
  try {
    const hasActiveTenants = await User.exists({ house: req.params.id, landlord: req.user._id, role: "tenant" });
    if (hasActiveTenants) {
      return res.status(409).json({ success: false, message: "Cannot delete: house has active tenants. Remove all tenants first." });
    }

    const house = await House.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });
    res.json({ success: true, message: "House deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouseTenants = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const tenants = await User.find({ house: req.params.id, landlord: req.user._id, role: "tenant" })
      .select("-password -resetToken -resetTokenExpire");
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Tenants ───────────────────────────────────────────────────────────────

export const addTenant = async (req, res) => {
  try {
    const { houseId, name, email, password, phone, rentAmount, rentDueDate, leaseStart, leaseEnd } = req.body;

    if (!houseId || !name || !email || rentAmount === undefined || !rentDueDate) {
      return res.status(400).json({ success: false, message: "houseId, name, email, rentAmount, and rentDueDate are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    const dueDay = Number(rentDueDate);
    if (dueDay < 1 || dueDay > 31) {
      return res.status(400).json({ success: false, message: "rentDueDate must be between 1 and 31" });
    }

    const house = await House.findOne({ _id: houseId, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const duplicate = await User.findOne({ email: email.toLowerCase() });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "This email address is already registered in the system" });
    }

    let hashedPw;
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      hashedPw = await bcrypt.hash(password, 12);
    }

    const tenant = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPw || await bcrypt.hash(crypto.randomUUID?.() || Math.random().toString(36), 12),
      role: "tenant",
      landlord: req.user._id,
      house: houseId,
      phone: phone?.trim(),
      rentAmount: Number(rentAmount),
      rentDueDate: dueDay,
      leaseStart: leaseStart ? new Date(leaseStart) : undefined,
      leaseEnd: leaseEnd ? new Date(leaseEnd) : undefined,
    });

    await House.findByIdAndUpdate(houseId, { isOccupied: true });

    // Send response immediately — do NOT await email (prevents hanging on hosted environments)
    const response = tenant.toObject();
    delete response.password;
    res.status(201).json({ success: true, message: "Tenant added successfully", data: response });

    // Fire email in background after response is sent
    const { sendInvitation } = req.body;
    if (sendInvitation && tenant.email) {
      const rawToken = crypto.randomBytes(20).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      User.findByIdAndUpdate(tenant._id, {
        resetToken: hashedToken,
        resetTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }).catch(() => {});
      const setPasswordUrl = `${process.env.WEBSITE_URL}/set-password/${rawToken}`;
      sendEmail({
        from: process.env.EMAIL,
        to: tenant.email,
        subject: `You've been invited to ${house.name} — Set your password`,
        html: getTenantInviteTemplate(tenant, house, setPasswordUrl),
      }).catch((err) => console.error("[addTenant] Invite email failed:", err.message));
    } else if (tenant.email) {
      const notifyDaysBefore = req.user.notifyDaysBefore ?? 3;
      sendEmail({
        from: process.env.EMAIL,
        to: tenant.email,
        subject: `Welcome to ${house.name}`,
        html: getTenantWelcomeTemplate(tenant, house, !!password, notifyDaysBefore),
      }).catch((err) => console.error("[addTenant] Welcome email failed:", err.message));
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email address is already registered in the system" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid house ID format" });
    }
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTenants = async (req, res) => {
  try {
    const tenants = await User.find({ landlord: req.user._id, role: "tenant" })
      .select("-password -resetToken -resetTokenExpire")
      .populate("house", "name address city")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTenant = async (req, res) => {
  try {
    const tenant = await User.findOne({ _id: req.params.id, landlord: req.user._id, role: "tenant" })
      .select("-password -resetToken -resetTokenExpire")
      .populate("house", "name address city rentAmount isOccupied");
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { name, email, password, phone, rentAmount, rentDueDate, leaseStart, leaseEnd } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (email) {
      if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email address" });
      const dup = await User.findOne({ landlord: req.user._id, email: email.toLowerCase(), role: "tenant", _id: { $ne: req.params.id } });
      if (dup) return res.status(409).json({ success: false, message: "Another tenant with this email already exists" });
      updates.email = email.toLowerCase().trim();
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      updates.password = await bcrypt.hash(password, 12);
    }
    if (rentAmount !== undefined) {
      if (Number(rentAmount) < 0) return res.status(400).json({ success: false, message: "Rent amount cannot be negative" });
      updates.rentAmount = Number(rentAmount);
    }
    if (rentDueDate !== undefined) {
      const d = Number(rentDueDate);
      if (d < 1 || d > 31) return res.status(400).json({ success: false, message: "rentDueDate must be between 1 and 31" });
      updates.rentDueDate = d;
    }
    if (leaseStart) updates.leaseStart = new Date(leaseStart);
    if (leaseEnd) updates.leaseEnd = new Date(leaseEnd);

    const tenant = await User.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id, role: "tenant" },
      updates,
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpire");

    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.json({ success: true, message: "Tenant updated", data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateTenantBalance = async (req, res) => {
  try {
    const { balance } = req.body;
    if (balance === undefined) return res.status(400).json({ success: false, message: "balance is required" });

    const tenant = await User.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id, role: "tenant" },
      { balance: Number(balance) },
      { new: true }
    ).select("name email balance rentAmount house");

    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.json({ success: true, message: "Balance updated", data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const removeTenant = async (req, res) => {
  try {
    const tenant = await User.findOneAndDelete({ _id: req.params.id, landlord: req.user._id, role: "tenant" });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const remaining = await User.exists({ house: tenant.house, role: "tenant" });
    if (!remaining) {
      await House.findByIdAndUpdate(tenant.house, { isOccupied: false });
    }

    res.json({ success: true, message: "Tenant removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Maintenance ────────────────────────────────────────────────────────────

// Multer for maintenance photos
const maintUploadDir = path.resolve("uploads/maintenance");
if (!fs.existsSync(maintUploadDir)) fs.mkdirSync(maintUploadDir, { recursive: true });

const maintStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, maintUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
export const uploadMaintenancePhotos = multer({
  storage: maintStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
}).array("photos", 10);

export const createMaintenanceRequest = async (req, res) => {
  try {
    const { houseId, category, title, description, preferredTime, dueDate, viewableBy, priority } = req.body;

    const house = await House.findOne({ _id: houseId, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const photos = (req.files || []).map(f => `/uploads/maintenance/${f.filename}`);

    const request = await MaintenanceRequest.create({
      landlord: req.user._id,
      house: houseId,
      category,
      title,
      description,
      photos,
      preferredTime: preferredTime || "ANYTIME",
      dueDate: dueDate || undefined,
      priority: priority || "medium",
      viewableBy: viewableBy || "all",
      submittedBy: "landlord",
      activityLog: [{ entryType: "created", addedBy: "landlord", timestamp: new Date() }],
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMaintenanceRequests = async (req, res) => {
  try {
    const filter = { landlord: req.user._id };
    if (req.query.houseId) filter.house = req.query.houseId;

    const requests = await MaintenanceRequest.find(filter)
      .populate("house", "name address city")
      .populate("tenant", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOne({ _id: req.params.id, landlord: req.user._id })
      .populate("house", "name address city")
      .populate("tenant", "name email");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateMaintenanceRequest = async (req, res) => {
  try {
    const { category, title, description, preferredTime, existingPhotos, dueDate, viewableBy, priority, status: bodyStatus } = req.body;

    const request = await MaintenanceRequest.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    // Determine which existing photos to keep
    const keepPhotos = existingPhotos ? JSON.parse(existingPhotos) : request.photos;

    // Delete removed photos from filesystem
    const removedPhotos = request.photos.filter(p => !keepPhotos.includes(p));
    for (const photoPath of removedPhotos) {
      const filePath = path.resolve(photoPath.replace(/^\//, ""));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Add newly uploaded photos
    const newPhotos = (req.files || []).map(f => `/uploads/maintenance/${f.filename}`);
    const updatedPhotos = [...keepPhotos, ...newPhotos];

    const updates = { photos: updatedPhotos };
    if (category) updates.category = category;
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (preferredTime) updates.preferredTime = preferredTime;
    if (dueDate !== undefined) updates.dueDate = dueDate || null;
    if (priority) updates.priority = priority;
    if (viewableBy) updates.viewableBy = viewableBy;
    if (bodyStatus) updates.status = bodyStatus;

    const updated = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate("house", "name address city").populate("tenant", "name email");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const entry = { entryType: "status_update", status: req.body.status, addedBy: "landlord", timestamp: new Date() };
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id },
      { status: req.body.status, $push: { activityLog: entry } },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const addMaintenanceNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note?.trim()) return res.status(400).json({ success: false, message: "Note is required" });
    const entry = { entryType: "note", note: note.trim(), addedBy: "landlord", timestamp: new Date() };
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id },
      { $push: { activityLog: entry } },
      { new: true, runValidators: true }
    ).populate("house", "name address city").populate("tenant", "name email");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const toggleMaintenanceStar = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    request.starred = !request.starred;
    await request.save();
    res.json({ success: true, data: { starred: request.starred } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateMaintenanceProContact = async (req, res) => {
  try {
    const { proContacts } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    request.proContacts = Array.isArray(proContacts) ? proContacts : [];
    request.markModified('proContacts');
    await request.save();
    await MaintenanceRequest.updateOne({ _id: request._id }, { $unset: { proContact: 1 } });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteMaintenanceRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findOneAndDelete({
      _id: req.params.id,
      landlord: req.user._id,
    });
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, message: "Maintenance request deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Organisation settings ───────────────────────────────────────────────────
const ORG_FIELDS =
  "name email phone businessName address city defaultRentDueDate gracePeriodDays lateFeeType lateFeeAmount bankName bankAccountNumber bankAccountName notifyDaysBefore notifyOverdue notificationEmail";

export const getOrgSettings = async (req, res) => {
  try {
    const landlord = await User.findById(req.user._id).select(ORG_FIELDS);
    res.json({ success: true, data: landlord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateOrgSettings = async (req, res) => {
  try {
    const allowed = [
      "businessName", "address", "city", "phone",
      "defaultRentDueDate", "gracePeriodDays", "lateFeeType", "lateFeeAmount",
      "bankName", "bankAccountNumber", "bankAccountName",
      "notifyDaysBefore", "notifyOverdue", "notificationEmail",
    ];
    const update = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) update[key] = req.body[key]; });

    // Convert empty strings to undefined so Mongoose doesn't try to validate them
    if (update.defaultRentDueDate === '' || update.defaultRentDueDate === null) delete update.defaultRentDueDate;
    if (update.notifyDaysBefore   === '' || update.notifyDaysBefore   === null) delete update.notifyDaysBefore;

    const landlord = await User.findByIdAndUpdate(req.user._id, update, {
      new: true, runValidators: true,
    }).select(ORG_FIELDS);

    res.json({ success: true, data: landlord });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Record a payment ───────────────────────────────────────────────────────
export const recordPayment = async (req, res) => {
  try {
    const { tenantId, amount, month, datePaid, paymentMethod, notes } = req.body;
    if (!tenantId || amount === undefined || !month) {
      return res.status(400).json({ success: false, message: "tenantId, amount, and month are required" });
    }

    const tenant = await User.findOne({ _id: tenantId, landlord: req.user._id, role: "tenant" });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const paidAmt = Number(amount);
    if (paidAmt <= 0) return res.status(400).json({ success: false, message: "Amount must be positive" });

    // Build due date from month string (e.g. "2025-03") + tenant's rentDueDate day
    const [yr, mo] = month.split("-").map(Number);
    const dueDate = new Date(yr, mo - 1, tenant.rentDueDate || 1);

    // Upsert RentRecord for this tenant + month
    await RentRecord.findOneAndUpdate(
      { tenant: tenant._id, month },
      {
        landlord: req.user._id,
        house: tenant.house,
        amount: paidAmt,
        month,
        dueDate,
        paidDate: datePaid ? new Date(datePaid) : new Date(),
        status: "paid",
        notes: notes?.trim() || undefined,
        ...(paymentMethod ? { paymentMethod } : {}),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Adjust tenant balance: add amount paid (reduces debt if negative, adds credit if positive)
    await User.findByIdAndUpdate(tenant._id, { $inc: { balance: paidAmt } });

    res.json({ success: true, message: "Payment recorded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Get all rent records for this landlord ──────────────────────────────────
export const getPayments = async (req, res) => {
  try {
    const filter = { landlord: req.user._id };
    if (req.query.houseId) filter.house = req.query.houseId;
    const records = await RentRecord.find(filter)
      .populate("tenant", "name email")
      .populate("house", "name address")
      .sort({ dueDate: -1 })
      .limit(1000);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Get single payment record ───────────────────────────────────────────────
export const getPayment = async (req, res) => {
  try {
    const record = await RentRecord.findOne({ _id: req.params.id, landlord: req.user._id })
      .populate("tenant", "name email phone rentAmount")
      .populate("house", "name address city");
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Update a payment record ──────────────────────────────────────────────────
export const updatePayment = async (req, res) => {
  try {
    const { amount, status, notes, paidDate, dueDate } = req.body;
    const record = await RentRecord.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    // If amount changed and record was/is paid, adjust tenant balance
    const oldAmount = record.amount;
    const oldStatus = record.status;
    const newAmount = amount !== undefined ? Number(amount) : oldAmount;
    const newStatus = status || oldStatus;

    // Balance adjustment logic:
    // "paid" status means tenant's debt is reduced → balance is positive contribution
    // If old was paid and new is not paid → reverse the credit (subtract oldAmount from balance)
    // If old was not paid and new is paid → add credit (add newAmount to balance)
    // If both paid → adjust the difference (newAmount - oldAmount)
    if (record.tenant) {
      let balanceDelta = 0;
      if (oldStatus === "paid" && newStatus !== "paid") {
        balanceDelta = -oldAmount;
      } else if (oldStatus !== "paid" && newStatus === "paid") {
        balanceDelta = newAmount;
      } else if (oldStatus === "paid" && newStatus === "paid") {
        balanceDelta = newAmount - oldAmount;
      }
      if (balanceDelta !== 0) {
        await User.findByIdAndUpdate(record.tenant, { $inc: { balance: balanceDelta } });
      }
    }

    if (amount !== undefined)  record.amount  = newAmount;
    if (status)                record.status  = newStatus;
    if (notes !== undefined)   record.notes   = notes?.trim() || undefined;
    if (paidDate !== undefined) record.paidDate = paidDate ? new Date(paidDate) : undefined;
    if (dueDate !== undefined)  record.dueDate  = dueDate  ? new Date(dueDate)  : record.dueDate;

    await record.save();
    const updated = await RentRecord.findById(record._id)
      .populate("tenant", "name email phone rentAmount")
      .populate("house", "name address city");
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Delete a payment record ──────────────────────────────────────────────────
export const deletePayment = async (req, res) => {
  try {
    const record = await RentRecord.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    // Reverse balance contribution if it was a paid record
    if (record.status === "paid" && record.tenant) {
      await User.findByIdAndUpdate(record.tenant, { $inc: { balance: -record.amount } });
    }
    res.json({ success: true, message: "Payment record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Get monthly cashflow (income from paid RentRecords) for the year ────────
export const getCashflow = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const records = await RentRecord.aggregate([
      {
        $match: {
          landlord: req.user._id,
          status: "paid",
          month: { $regex: `^${year}-` },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthly = Array(12).fill(0);
    records.forEach((r) => {
      const idx = parseInt(r._id.split("-")[1]) - 1;
      if (idx >= 0 && idx < 12) monthly[idx] = r.total;
    });

    // Count distinct tenants who paid in the current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const paidThisMonth = await RentRecord.countDocuments({
      landlord: req.user._id,
      status: "paid",
      month: currentMonth,
    });

    res.json({ success: true, data: monthly, paidThisMonth });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Leases ──────────────────────────────────────────────────────────────────

export const createLease = async (req, res) => {
  try {
    const { startDate, endDate, rentAmount, frequency, paymentDay,
            deposit, chargeLateFees, lateFees,
            leaseExpiryReminder, leaseExpiryReminderDays,
            rentReminder, overdueReminder, furnishing, notes } = req.body;

    if (!startDate || rentAmount === undefined || !frequency || !paymentDay) {
      return res.status(400).json({ success: false, message: "startDate, rentAmount, frequency, and paymentDay are required" });
    }

    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    // Terminate any existing active lease for this house
    await Lease.updateMany(
      { house: req.params.id, landlord: req.user._id, status: "active" },
      { status: "terminated" }
    );

    const lease = await Lease.create({
      house: req.params.id,
      landlord: req.user._id,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      rentAmount: Number(rentAmount),
      frequency,
      paymentDay: Number(paymentDay),
      deposit: deposit ? Number(deposit) : undefined,
      chargeLateFees: !!chargeLateFees,
      lateFees: chargeLateFees ? (lateFees || []) : [],
      leaseExpiryReminder: leaseExpiryReminder !== false,
      leaseExpiryReminderDays: Number(leaseExpiryReminderDays) || 60,
      rentReminder: rentReminder !== false,
      overdueReminder: overdueReminder !== false,
      furnishing: furnishing || "Unfurnished",
      notes: notes || "",
    });

    res.status(201).json({ success: true, message: "Lease created", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllActiveLeases = async (req, res) => {
  try {
    const leases = await Lease.find({ landlord: req.user._id, status: "active" })
      .populate("house", "name city")
      .select("house startDate endDate frequency paymentDay status")
      .lean();
    res.json({ success: true, data: leases });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouseLease = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const lease = await Lease.findOne({ house: req.params.id, landlord: req.user._id, status: "active" })
      .populate("tenant", "name email phone portalActivated");

    res.json({ success: true, data: lease || null });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouseLeases = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const leases = await Lease.find({ house: req.params.id, landlord: req.user._id })
      .sort({ startDate: -1 })
      .lean();

    res.json({ success: true, data: leases });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateLease = async (req, res) => {
  try {
    const lease = await Lease.findOneAndUpdate(
      { _id: req.params.leaseId, landlord: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate("tenant", "name email phone");
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    res.json({ success: true, data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const linkTenantToLease = async (req, res) => {
  try {
    const { tenantId } = req.body;

    const lease = await Lease.findOne({ _id: req.params.leaseId, landlord: req.user._id });
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });

    // Unlink when tenantId is null/empty
    if (!tenantId) {
      lease.tenant = undefined;
      await lease.save();
      const stillOccupied = await User.exists({ house: lease.house, landlord: req.user._id, role: "tenant" });
      if (!stillOccupied) await House.findByIdAndUpdate(lease.house, { isOccupied: false });
      return res.json({ success: true, message: "Tenant unlinked from lease", data: lease });
    }

    const tenant = await User.findOne({ _id: tenantId, landlord: req.user._id, role: "tenant" });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    lease.tenant = tenantId;
    await lease.save();
    await House.findByIdAndUpdate(lease.house, { isOccupied: true });
    await lease.populate("tenant", "name email phone portalActivated");
    res.json({ success: true, message: "Tenant linked to lease", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const inviteTenant = async (req, res) => {
  try {
    const tenant = await User.findOne({ _id: req.params.id, landlord: req.user._id, role: "tenant" });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const house = await House.findById(tenant.house);
    const rawToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    await User.findByIdAndUpdate(tenant._id, {
      resetToken: hashedToken,
      resetTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    const setPasswordUrl = `${process.env.WEBSITE_URL}/set-password/${rawToken}`;
    await sendEmail({
      from: process.env.EMAIL,
      to: tenant.email,
      subject: `You've been invited to ${house?.name || "your property"} — Set your password`,
      html: getTenantInviteTemplate(tenant, house, setPasswordUrl),
    });
    res.json({ success: true, message: "Invite sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createAndLinkTenant = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, mobile, dateOfBirth, notes: tenantNotes } = req.body;

    const name = `${firstName || ""} ${lastName || ""}`.trim();
    if (!name) return res.status(400).json({ success: false, message: "First name is required" });
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "Invalid email address" });

    const lease = await Lease.findOne({ _id: req.params.leaseId, landlord: req.user._id });
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "This email is already registered" });

    const house = await House.findById(lease.house);

    const tenant = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(crypto.randomUUID?.() || Math.random().toString(36), 12),
      role: "tenant",
      landlord: req.user._id,
      house: lease.house,
      phone: (phone || mobile)?.trim(),
      rentAmount: lease.rentAmount,
      rentDueDate: lease.paymentDay === 31 ? 1 : lease.paymentDay,
      leaseStart: lease.startDate,
      leaseEnd: lease.endDate,
    });

    lease.tenant = tenant._id;
    await lease.save();
    await House.findByIdAndUpdate(lease.house, { isOccupied: true });

    // Send invite email (non-fatal) — only when caller requests it
    if (req.body.sendInvite !== false) {
      try {
        const rawToken = crypto.randomBytes(20).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        await User.findByIdAndUpdate(tenant._id, {
          resetToken: hashedToken,
          resetTokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        const setPasswordUrl = `${process.env.WEBSITE_URL}/set-password/${rawToken}`;
        await sendEmail({
          from: process.env.EMAIL,
          to: tenant.email,
          subject: `You've been invited to ${house?.name || "your property"} — Set your password`,
          html: getTenantInviteTemplate(tenant, house, setPasswordUrl),
        });
      } catch { /* non-fatal */ }
    }

    await lease.populate("tenant", "name email phone portalActivated");
    const response = tenant.toObject();
    delete response.password;
    res.status(201).json({ success: true, message: "Tenant created and linked", data: { lease, tenant: response } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Document controllers ────────────────────────────────────────────────────

export const getDocuments = async (req, res) => {
  try {
    const { type } = req.query; // 'property' | 'lease'
    const filter = { house: req.params.id, landlord: req.user._id };
    if (type === "property" || type === "lease") filter.type = type;
    const docs = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const doc = await Document.create({
      house: req.params.id,
      landlord: req.user._id,
      type: req.body.type === "lease" ? "lease" : "property",
      fileName: req.file.filename,
      originalName: req.file.originalname,
      description: req.body.description?.trim() || "",
      filePath: `/uploads/documents/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.docId, landlord: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });
    // Remove physical file
    const fullPath = path.resolve(`.${doc.filePath}`);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    res.json({ success: true, message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Reminders ─────────────────────────────────────────────────────────────

export const getAllReminders = async (req, res) => {
  try {
    const now = new Date();
    await Reminder.updateMany(
      { landlord: req.user._id, status: "upcoming", dateTime: { $lt: now } },
      { status: "overdue" }
    );
    const reminders = await Reminder.find({ landlord: req.user._id })
      .populate("house", "name city")
      .sort({ dateTime: 1 })
      .lean();
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createAnyReminder = async (req, res) => {
  try {
    const { houseId, dateTime, category, notes } = req.body;
    if (!dateTime) return res.status(400).json({ success: false, message: "dateTime is required" });
    if (houseId) {
      const house = await House.findOne({ _id: houseId, landlord: req.user._id });
      if (!house) return res.status(404).json({ success: false, message: "House not found" });
    }
    const status = new Date(dateTime) < new Date() ? "overdue" : "upcoming";
    const reminder = await Reminder.create({
      house: houseId || null,
      landlord: req.user._id,
      dateTime,
      category: category || "Other",
      notes,
      status,
    });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getReminders = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const now = new Date();
    // Auto-mark overdue
    await Reminder.updateMany(
      { house: req.params.id, landlord: req.user._id, status: "upcoming", dateTime: { $lt: now } },
      { status: "overdue" }
    );

    const reminders = await Reminder.find({ house: req.params.id, landlord: req.user._id }).sort({ dateTime: 1 });
    res.json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createReminder = async (req, res) => {
  try {
    const house = await House.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!house) return res.status(404).json({ success: false, message: "House not found" });

    const { dateTime, category, notes } = req.body;
    if (!dateTime) return res.status(400).json({ success: false, message: "dateTime is required" });

    const status = new Date(dateTime) < new Date() ? "overdue" : "upcoming";
    const reminder = await Reminder.create({
      house: req.params.id,
      landlord: req.user._id,
      dateTime,
      category: category || "Other",
      notes,
      status,
    });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.reminderId, landlord: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });
    res.json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.reminderId, landlord: req.user._id });
    if (!reminder) return res.status(404).json({ success: false, message: "Reminder not found" });
    res.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Create a charge (pending RentRecord) ────────────────────────────────────
export const createCharge = async (req, res) => {
  try {
    const { tenantId, amount, month, dueDate, notes, category } = req.body;
    if (!tenantId || amount === undefined || !month || !dueDate) {
      return res.status(400).json({ success: false, message: "tenantId, amount, month, and dueDate are required" });
    }

    const tenant = await User.findOne({ _id: tenantId, landlord: req.user._id, role: "tenant" });
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    const chargeAmt = Number(amount);
    if (chargeAmt <= 0) return res.status(400).json({ success: false, message: "Amount must be positive" });

    // Create pending RentRecord (charge not yet paid)
    const record = await RentRecord.findOneAndUpdate(
      { tenant: tenant._id, month },
      {
        landlord: req.user._id,
        house: tenant.house,
        amount: chargeAmt,
        month,
        dueDate: new Date(dueDate),
        status: "pending",
        notes: notes?.trim() || undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Decrement tenant balance (they now owe more)
    await User.findByIdAndUpdate(tenant._id, { $inc: { balance: -chargeAmt } });

    res.status(201).json({ success: true, message: "Charge created", data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Org Payments ────────────────────────────────────────────────────────────

export const getOrgPayments = async (req, res) => {
  try {
    // Exclude the large base64 receiptImage from the list — fetched individually on edit
    const payments = await OrgPayment.find({ landlord: req.user._id })
      .select("-receiptImage")
      .sort({ date: -1 })
      .lean();
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getOrgPayment = async (req, res) => {
  try {
    const payment = await OrgPayment.findOne({ _id: req.params.id, landlord: req.user._id }).lean();
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Helper: read an uploaded file into a base64 data URL, then delete it from disk
const fileToDataUrl = (file) => {
  const buf = fs.readFileSync(file.path);
  const dataUrl = `data:${file.mimetype};base64,${buf.toString("base64")}`;
  fs.unlinkSync(file.path); // remove temp file — stored in MongoDB now
  return dataUrl;
};

export const createOrgPayment = async (req, res) => {
  try {
    const { date, category, notes, amount } = req.body;
    if (!date || amount === undefined) return res.status(400).json({ success: false, message: "date and amount are required" });
    const receiptImage = req.file ? fileToDataUrl(req.file) : undefined;
    const receiptName  = req.file ? req.file.originalname : undefined;
    const payment = await OrgPayment.create({ landlord: req.user._id, date, category: category || "Other", notes, amount: Number(amount), receiptImage, receiptName });
    const { receiptImage: _img, ...safe } = payment.toObject();
    res.status(201).json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateOrgPayment = async (req, res) => {
  try {
    const payment = await OrgPayment.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    const { date, category, notes, amount, removeReceipt } = req.body;
    if (date)     payment.date     = date;
    if (category) payment.category = category;
    if (notes !== undefined) payment.notes = notes;
    if (amount !== undefined) payment.amount = Number(amount);

    if (req.file) {
      // New file — encode as base64 and store in MongoDB, delete temp file
      payment.receiptImage = fileToDataUrl(req.file);
      payment.receiptName  = req.file.originalname;
    } else if (removeReceipt === 'true') {
      payment.receiptImage = undefined;
      payment.receiptName  = undefined;
    }

    await payment.save();
    const { receiptImage: _img, ...safe } = payment.toObject();
    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteOrgPayment = async (req, res) => {
  try {
    const payment = await OrgPayment.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export const getExpenses = async (req, res) => {
  try {
    // Only return expenses NOT assigned to any property
    const expenses = await Expense.find({ landlord: req.user._id, house: { $in: [null, undefined] } })
      .select("-receiptImage")
      .sort({ dueDate: -1 })
      .lean();
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, landlord: req.user._id }).lean();
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouseExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ landlord: req.user._id, house: req.params.houseId })
      .select("-receiptImage")
      .sort({ dueDate: -1 })
      .lean();
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { dueDate, category, description, amount, status, paymentDate, payableByTenant, capitalExpense, notes, supplier } = req.body;
    if (!dueDate || amount === undefined) return res.status(400).json({ success: false, message: "dueDate and amount are required" });
    const receiptImage = req.file ? fileToDataUrl(req.file) : undefined;
    const receiptName  = req.file ? req.file.originalname : undefined;
    const expense = await Expense.create({
      landlord: req.user._id, dueDate, category: category || "Other", description, notes,
      amount: Number(amount),
      status: status || "unpaid", paymentDate: paymentDate || null,
      payableByTenant: payableByTenant === 'true' || payableByTenant === true,
      capitalExpense:  capitalExpense  === 'true' || capitalExpense  === true,
      receiptImage, receiptName,
      supplier: supplier || undefined,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    const { dueDate, category, description, amount, status, paymentDate,
            payableByTenant, capitalExpense, notes, supplier, house, removeReceipt } = req.body;

    if (dueDate     !== undefined) expense.dueDate     = dueDate;
    if (category    !== undefined) expense.category    = category;
    if (description !== undefined) expense.description = description;
    if (amount      !== undefined) expense.amount      = Number(amount);
    if (status      !== undefined) expense.status      = status;
    if (paymentDate !== undefined) expense.paymentDate = paymentDate || null;
    if (payableByTenant !== undefined) expense.payableByTenant = payableByTenant === 'true' || payableByTenant === true;
    if (capitalExpense  !== undefined) expense.capitalExpense  = capitalExpense  === 'true' || capitalExpense  === true;
    if (notes       !== undefined) expense.notes       = notes;
    if (supplier    !== undefined) expense.supplier    = supplier || undefined;
    if (house       !== undefined) expense.house       = house    || undefined;

    if (req.file) {
      expense.receiptImage = fileToDataUrl(req.file);
      expense.receiptName  = req.file.originalname;
    } else if (removeReceipt === 'true') {
      expense.receiptImage = undefined;
      expense.receiptName  = undefined;
    }

    await expense.save();
    const { receiptImage: _img, ...safe } = expense.toObject();
    res.json({ success: true, data: safe });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ landlord: req.user._id }).sort({ name: 1 }).lean();
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, profession, email, phone, mobile } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const supplier = await Supplier.create({ landlord: req.user._id, name, profession, email, phone, mobile });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndDelete({ _id: req.params.id, landlord: req.user._id });
    if (!supplier) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─── Rent History ────────────────────────────────────────────────────────────
export const getRentHistory = async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, landlord: req.user._id });
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    const history = await RentHistory.find({ lease: lease._id }).sort({ startDate: 1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const createRentHistory = async (req, res) => {
  try {
    const lease = await Lease.findOne({ _id: req.params.leaseId, landlord: req.user._id });
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    const { startDate, amount } = req.body;
    if (!startDate || amount === undefined) return res.status(400).json({ success: false, message: "startDate and amount are required" });
    const existing = await RentHistory.countDocuments({ lease: lease._id });
    // Prevent duplicate first entry (e.g. from concurrent requests / React Strict Mode)
    if (existing === 0) {
      const alreadyFirst = await RentHistory.findOne({ lease: lease._id, isFirst: true });
      if (alreadyFirst) return res.json({ success: true, data: alreadyFirst });
    }
    const entry = await RentHistory.create({
      lease: lease._id, landlord: req.user._id, house: lease.house,
      startDate: new Date(startDate), amount: Number(amount),
      isFirst: existing === 0,
    });
    // Update lease rent amount to latest
    await Lease.findByIdAndUpdate(lease._id, { rentAmount: Number(amount) });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getRentHistoryEntry = async (req, res) => {
  try {
    const entry = await RentHistory.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateRentHistory = async (req, res) => {
  try {
    const entry = await RentHistory.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: "Not found" });
    if (entry.isFirst) return res.status(403).json({ success: false, message: "Cannot edit the first rent change" });
    const { startDate, amount } = req.body;
    if (startDate) entry.startDate = new Date(startDate);
    if (amount !== undefined) entry.amount = Number(amount);
    await entry.save();
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteRentHistory = async (req, res) => {
  try {
    const entry = await RentHistory.findOne({ _id: req.params.id, landlord: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: "Not found" });
    if (entry.isFirst) return res.status(403).json({ success: false, message: "Cannot delete the first rent change" });
    await entry.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
