import User from "../models/User.js";
import RentRecord from "../models/RentRecord.js";

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
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
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
      .sort({ dueDate: -1 })
      .limit(24);

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
