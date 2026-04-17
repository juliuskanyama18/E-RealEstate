import mongoose from "mongoose";

const orgPaymentSchema = new mongoose.Schema(
  {
    landlord:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date:          { type: Date, required: true },
    category:      { type: String, default: "Other" },
    notes:         { type: String, trim: true },
    amount:        { type: Number, required: true, default: 0 },
    receiptImage:  { type: String }, // base64 data URL
    receiptName:   { type: String }, // original filename
  },
  { timestamps: true }
);

export default mongoose.model("OrgPayment", orgPaymentSchema);
