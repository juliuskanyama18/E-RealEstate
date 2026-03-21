import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    house:    { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true, index: true },
    type:        { type: String, enum: ["property", "lease"], default: "property" },
    fileName:    { type: String, required: true },
    originalName:{ type: String },
    description: { type: String, trim: true, maxlength: 256 },
    filePath:    { type: String },
    fileSize:    { type: Number },
    mimeType:    { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
