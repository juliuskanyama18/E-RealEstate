import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { getLandlordWelcomeTemplate, getPasswordResetTemplate } from "../utils/emailTemplates.js";

const signToken = (id, role) => {
  const expiresIn = role === "superadmin" ? "1d" : "7d";
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const landlord = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "landlord",
      phone: phone?.trim(),
    });

    const token = signToken(landlord._id, landlord.role);

    try {
      await sendEmail({
        from: process.env.EMAIL,
        to: landlord.email,
        subject: "Welcome to RentalSaaS",
        html: getLandlordWelcomeTemplate(landlord),
      });
    } catch {
      // Non-fatal
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: { _id: landlord._id, name: landlord.name, email: landlord.email, role: landlord.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Block soft-deleted accounts — treat as non-existent (no information leak)
    if (user.isDeleted) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account suspended. Contact the platform administrator." });
    }

    // Record login timestamp without triggering full validation
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: "If that email exists, a reset link has been sent" });
    }

    const rawToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.WEBSITE_URL}/set-password/${rawToken}`;

    try {
      await sendEmail({
        from: process.env.EMAIL,
        to: user.email,
        subject: "Password Reset Request",
        html: getPasswordResetTemplate(resetUrl),
      });
    } catch {
      user.resetToken = undefined;
      user.resetTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }

    res.json({ success: true, message: "If that email exists, a reset link has been sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    }).select("+resetToken +resetTokenExpire");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), ...(phone !== undefined ? { phone: phone.trim() } : {}) },
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpire");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpire: { $gt: Date.now() },
    }).select("+resetToken +resetTokenExpire");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired invitation link" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    const authToken = signToken(user._id, user.role);
    res.json({
      success: true,
      message: "Password set successfully",
      data: {
        token: authToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
