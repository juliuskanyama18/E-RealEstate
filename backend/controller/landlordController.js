import bcrypt from "bcrypt";
import validator from "validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import House from "../models/House.js";
import User from "../models/User.js";
import MaintenanceRequest from "../models/MaintenanceRequest.js";
import { sendEmail } from "../config/nodemailer.js";
import { getTenantWelcomeTemplate } from "../utils/emailTemplates.js";

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

    const duplicate = await User.findOne({ landlord: req.user._id, email: email.toLowerCase(), role: "tenant" });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "A tenant with this email already exists under your account" });
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
      await sendEmail({
        from: process.env.EMAIL,
        to: tenant.email,
        subject: `Welcome to ${house.name}`,
        html: getTenantWelcomeTemplate(tenant, house, !!password),
      });
    } catch { /* non-fatal */ }

    const response = tenant.toObject();
    delete response.password;
    res.status(201).json({ success: true, message: "Tenant added successfully", data: response });
  } catch (error) {
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
    const request = await MaintenanceRequest.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user._id },
      { proContacts: proContacts || [] },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
