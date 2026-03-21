import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    house:    { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    tenant:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startDate:  { type: Date, required: true },
    endDate:    { type: Date },
    rentAmount: { type: Number, required: true, min: 0 },
    frequency:  { type: String, required: true, default: "1 Month" },
    paymentDay: { type: Number, required: true, min: 1, max: 31, default: 31 },
    deposit:    { type: Number, min: 0 },
    chargeLateFees: { type: Boolean, default: false },
    lateFees: [{ amount: { type: Number }, days: { type: Number } }],
    leaseExpiryReminder:     { type: Boolean, default: true },
    leaseExpiryReminderDays: { type: Number, default: 60 },
    rentReminder:    { type: Boolean, default: true },
    overdueReminder: { type: Boolean, default: true },
    furnishing: { type: String, default: "Unfurnished" },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["active", "expired", "terminated"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Lease", leaseSchema);
