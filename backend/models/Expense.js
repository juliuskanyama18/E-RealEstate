import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    landlord:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    house:           { type: mongoose.Schema.Types.ObjectId, ref: "House" },
    dueDate:         { type: Date, required: true },
    category:        { type: String, default: "Other" },
    description:     { type: String, trim: true },
    amount:          { type: Number, required: true, default: 0 },
    taxAmount:       { type: Number, default: 0 },
    status:          { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    paymentDate:     { type: Date },
    payableByTenant: { type: Boolean, default: false },
    capitalExpense:  { type: Boolean, default: false },
    receiptImage:    { type: String }, // base64 data URL
    receiptName:     { type: String },
    supplier:        { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    notes:           { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", expenseSchema);
