import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.isDeleted) {
      return res.status(401).json({ success: false, message: "Account not found" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Not authorized, invalid token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied: requires role ${roles.join(" or ")}`,
    });
  }
  next();
};

export const requireActive = (req, res, next) => {
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account suspended. Contact the platform administrator.",
    });
  }
  next();
};
