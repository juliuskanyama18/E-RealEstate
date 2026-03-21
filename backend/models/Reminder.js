import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    house:    { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    dateTime: { type: Date, required: true },
    category: { type: String, default: "Other" },
    notes:    { type: String, trim: true },
    status:   { type: String, enum: ["upcoming", "complete", "overdue"], default: "upcoming" },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
