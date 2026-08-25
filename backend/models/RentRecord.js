import mongoose from "mongoose";

const rentRecordSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    month: {
      type: String,
      required: [true, "Month is required"],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    // What this record is for — Rent, Deposit, Late Fee, Utilities, Other,
    // etc. Deliberately not enum-constrained: different entry points in the
    // UI (Log Payment vs. the monthly/one-time charge wizards) use their own
    // label sets for this. Combined with the compound index below, this is
    // what lets a rent payment and a deposit payment for the same tenant in
    // the same month coexist as two separate records instead of one
    // silently overwriting the other.
    category: {
      type: String,
      trim: true,
      default: "Rent",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

rentRecordSchema.index({ tenant: 1, month: 1, category: 1 }, { unique: true });
rentRecordSchema.index({ landlord: 1 });

const RentRecord = mongoose.model("RentRecord", rentRecordSchema);

export default RentRecord;
