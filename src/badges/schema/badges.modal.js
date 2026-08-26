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
    bgColor: {
      type: String,
      default: "#fffbeb",
    },
    textColor: {
      type: String,
      default: "#b45309",
    },
    position: {
      type: String,
      enum: ["top_left", "top_right", "bottom_left", "bottom_right"],
      default: "top_left",
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;