import mongoose from "mongoose";

const criteriaSchema = new mongoose.Schema({
  icon: {
    type: String, // Path or URL to the uploaded icon
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

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
    criteriaList: [criteriaSchema],
    automatedConditions: {
      minRating: { type: Number, default: 0 },
      minReviews: { type: Number, default: 0 },
      maxResponseTimeHours: { type: Number, default: null }, // Null means no limit
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