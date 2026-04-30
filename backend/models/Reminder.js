import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    house:         { type: mongoose.Schema.Types.ObjectId, ref: "House", required: false, default: null, index: true },
    landlord:      { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    tenant:        { type: mongoose.Schema.Types.ObjectId, ref: "User",  default: null },
    dateTime:      { type: Date, required: true },
    category:      { type: String, default: "Other" },
    notes:         { type: String, trim: true },
    status:         { type: String, enum: ["upcoming", "complete", "overdue"], default: "upcoming" },
    notifyTenant:   { type: Boolean, default: false },
    recurring:      { type: Boolean, default: false },
    repeatInterval: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: "monthly" },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
