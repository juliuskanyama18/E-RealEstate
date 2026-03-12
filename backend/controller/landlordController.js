import bcrypt from "bcrypt";
import validator from "validator";
import House from "../models/House.js";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { getTenantWelcomeTemplate } from "../utils/emailTemplates.js";

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
