import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
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
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    fullAddress: {
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
    aboutMe: {
      type: String,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["host", "influencer"],
      default: "influencer",
    },
    refreshToken: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
 
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "active",
    },

    stripeAccountId: { type: String },
    isStripeConnected: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
