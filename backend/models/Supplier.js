import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    landlord:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name:       { type: String, required: true, trim: true },
    profession: { type: String, trim: true },
    email:      { type: String, trim: true },
    phone:      { type: String, trim: true },
    mobile:     { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
