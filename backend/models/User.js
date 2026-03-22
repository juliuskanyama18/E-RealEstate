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
    portalActivated: {
      type: Boolean,
      default: false,
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
    // Landlord — organisation / business settings
    businessName: { type: String, trim: true },
    address:      { type: String, trim: true },
    city:         { type: String, trim: true },
    // Payment configuration
    defaultRentDueDate: { type: Number, min: 1, max: 31 },
    gracePeriodDays:    { type: Number, default: 0, min: 0 },
    lateFeeType:        { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    lateFeeAmount:      { type: Number, default: 0, min: 0 },
    bankName:           { type: String, trim: true },
    bankAccountNumber:  { type: String, trim: true },
    bankAccountName:    { type: String, trim: true },
    // Notification preferences
    notifyDaysBefore:   { type: Number, default: 3, min: 0 },
    notifyOverdue:      { type: Boolean, default: true },
    notificationEmail:  { type: String, trim: true, lowercase: true },
    // Password reset
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpire: {
      type: Date,
      select: false,
    },
    // Soft delete — data is preserved but account is hidden from all operations
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Activity tracking
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ landlord: 1 });

const User = mongoose.model("User", userSchema);

export default User;
