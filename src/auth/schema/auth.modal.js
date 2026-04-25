import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true],
      trim: true,
    },
    email: {
      type: String,
      required: [true],
      unique: [true],
      trim: true,
    },

    password: {
      type: String,
      required: [true],
      trim: true,
    },
    confirmPassword: {
      type: String,
      required: [true],
      trim: true,
    },
    otp: {
      type: Number,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    registrationOtp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    address: {
      type: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    experience: {
      type: String,
    },
    ageRange: {
      type: String,
      enum: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    image: {
      type: String,
    },

    refreshToken: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    travelStyle: {
      type: [String],
      enum: [
        "Relaxed & familiar",
        "Adventurous",
        "Culture & heritage",
        "Nightlife & social",
        "Off the beaten path",
      ],
      default: [],
    },

    // Account auto-deletion timer for unverified users
    expireAt: {
      type: Date,
      index: { expires: 0 }, // Document will expire at the specific date/time set in this field
    },
    // stripeAccountId: { type: String },
    // isStripeConnected: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
