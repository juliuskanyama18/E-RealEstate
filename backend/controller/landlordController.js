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
import { sendEmail } from "../config/nodemailer.js";
import { getTenantWelcomeTemplate, getTenantInviteTemplate } from "../utils/emailTemplates.js";

// ─── Multer setup for house photos ─────────────────────────────────────────
const uploadDir = path.resolve("uploads/houses");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
    });

    res.status(201).json({ success: true, message: "House created", data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getHouses = async (req, res) => {
  try {
    const houses = await House.find({ landlord: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: houses });
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
    const { name, address, city, rentAmount, bedrooms, bathrooms, description } = req.body;
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

    try {
      const { sendInvitation } = req.body;
      if (sendInvitation && tenant.email) {
        // Generate invite token (reuses resetToken field, 7-day expiry)
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
          subject: `You've been invited to ${house.name} — Set your password`,
          html: getTenantInviteTemplate(tenant, house, setPasswordUrl),
        });
      } else {
        const notifyDaysBefore = req.user.notifyDaysBefore ?? 3;
        await sendEmail({
          from: process.env.EMAIL,
          to: tenant.email,
          subject: `Welcome to ${house.name}`,
          html: getTenantWelcomeTemplate(tenant, house, !!password, notifyDaysBefore),
        });
      }
    } catch { /* non-fatal */ }

    const response = tenant.toObject();
    delete response.password;
    res.status(201).json({ success: true, message: "Tenant added successfully", data: response });
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
    const { houseId, category, title, description, preferredTime } = req.body;

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
    const { category, title, description, preferredTime, existingPhotos } = req.body;

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
    const records = await RentRecord.find({ landlord: req.user._id })
      .populate("tenant", "name email")
      .populate("house", "name address")
      .sort({ dueDate: -1 })
      .limit(1000);
    res.json({ success: true, data: records });
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
