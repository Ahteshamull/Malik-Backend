import mongoose from "mongoose";
const { Schema } = mongoose;

const legalDocSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content/slug identifier is required"],
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    icon: {
      type: String,
      default: "description",
      trim: true,
    },
    iconColor: {
      type: String,
      default: "0xFF5BD7BC",
      trim: true,
    },
    webUrl: {
      type: String,
      default: "",
      trim: true,
    },
    externalLinks: [
      {
        title: { type: String, trim: true, default: "" },
        url: { type: String, trim: true, default: "" },
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LegalDoc", legalDocSchema);