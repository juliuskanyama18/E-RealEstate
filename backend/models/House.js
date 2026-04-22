import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
  {
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "House name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'Tanzania',
    },
    rentAmount: {
      type: Number,
      default: 0,
      min: [0, "Rent amount cannot be negative"],
    },
    bedrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    nickname: {
      type: String,
      trim: true,
    },
    photo: {
      type: String, // relative URL, e.g. /uploads/houses/<filename>
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const House = mongoose.model("House", houseSchema);

export default House;
