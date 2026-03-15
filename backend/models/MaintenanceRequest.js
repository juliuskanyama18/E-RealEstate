import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema(
  {
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    house:    { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    category: { type: String, required: true, trim: true },
    title:    { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, required: true, trim: true },
    photos:   [{ type: String }],
    preferredTime: { type: String, enum: ["ANYTIME", "COORDINATE"], default: "ANYTIME" },
    status:   { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    starred:     { type: Boolean, default: false },
    submittedBy: { type: String, enum: ["landlord", "tenant"], default: "landlord" },
    tenant:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    proContacts: [{
      name:  { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
      notes: { type: String, trim: true, default: '' },
    }],
    activityLog: [{
      entryType:  { type: String, enum: ['created', 'status_update', 'note'], required: true },
      status:     { type: String },
      note:       { type: String, trim: true },
      addedBy:    { type: String, default: 'landlord' },
      timestamp:  { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
