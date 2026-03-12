import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["superadmin", "landlord", "tenant"],
      required: [true, "Role is required"],
    },
    // For tenants: reference to their landlord (a User with role 'landlord')
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // For tenants: the house they occupy
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Tenant-specific rental fields
    rentAmount: {
      type: Number,
      min: 0,
    },
    rentDueDate: {
      type: Number,
      min: 1,
      max: 31,
    },
    leaseStart: {
      type: Date,
    },
    leaseEnd: {
      type: Date,
    },
    balance: {
      type: Number,
      default: 0,
    },
    // Password reset
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ landlord: 1 });

const User = mongoose.model("User", userSchema);

export default User;
