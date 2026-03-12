import User from "../models/User.js";
import House from "../models/House.js";
import RentRecord from "../models/RentRecord.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [totalLandlords, activeLandlords, totalTenants, totalHouses, rentAgg] = await Promise.all([
      User.countDocuments({ role: "landlord" }),
      User.countDocuments({ role: "landlord", isActive: true }),
      User.countDocuments({ role: "tenant" }),
      House.countDocuments(),
      User.aggregate([
        { $match: { role: "tenant", rentAmount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$rentAmount" } } },
      ]),
    ]);

    const totalMonthlyRent = rentAgg[0]?.total || 0;

    const recentLandlords = await User.find({ role: "landlord" })
      .select("name email isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalLandlords,
        activeLandlords,
        suspendedLandlords: totalLandlords - activeLandlords,
        totalTenants,
        totalHouses,
        totalMonthlyRent,
        recentLandlords,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllLandlords = async (req, res) => {
  try {
    const landlords = await User.find({ role: "landlord" })
      .select("name email phone isActive createdAt")
      .sort({ createdAt: -1 });

    const landlordIds = landlords.map((l) => l._id);

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

    const houseMap = Object.fromEntries(houseCounts.map((h) => [h._id.toString(), h.count]));
    const tenantMap = Object.fromEntries(tenantCounts.map((t) => [t._id.toString(), t.count]));

    const result = landlords.map((l) => ({
      ...l.toObject(),
      houseCount: houseMap[l._id.toString()] || 0,
      tenantCount: tenantMap[l._id.toString()] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getLandlord = async (req, res) => {
  try {
    const landlord = await User.findOne({ _id: req.params.id, role: "landlord" }).select("-password -resetToken -resetTokenExpire");
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

export const toggleLandlordStatus = async (req, res) => {
  try {
    const landlord = await User.findOne({ _id: req.params.id, role: "landlord" });
    if (!landlord) {
      return res.status(404).json({ success: false, message: "Landlord not found" });
    }

    const newStatus = !landlord.isActive;
    landlord.isActive = newStatus;
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
      User.deleteOne({ _id: req.params.id }),
    ]);

    res.json({ success: true, message: "Landlord and all associated data deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
