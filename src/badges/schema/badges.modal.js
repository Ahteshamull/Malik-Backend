import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String, // Path or URL to the main badge icon
      required: true,
    },
    isModalEnabled: {
      type: Boolean,
      default: true,
    },
    introDescription: {
      type: String,
      trim: true,
    },
    showNote: {
      type: Boolean,
      default: true,
    },
    footerReassuranceText: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;