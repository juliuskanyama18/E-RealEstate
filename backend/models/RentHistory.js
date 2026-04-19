import mongoose from "mongoose";

const rentHistorySchema = new mongoose.Schema(
  {
    lease:    { type: mongoose.Schema.Types.ObjectId, ref: "Lease",  required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true, index: true },
    house:    { type: mongoose.Schema.Types.ObjectId, ref: "House" },
    startDate: { type: Date, required: true },
    amount:    { type: Number, required: true, min: 0 },
    isFirst:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("RentHistory", rentHistorySchema);
