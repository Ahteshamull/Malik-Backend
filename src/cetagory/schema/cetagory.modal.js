import mongoose from "mongoose";

const cetagorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Eat&Drink", "Experiences", "Events"],
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    bgColor: {
      type: String,
      default: "#f0f9ff",
    },
    textColor: {
      type: String,
      default: "#0369a1",
    },
    pageTitle: {
      type: String,
    },
    pageDescription: {
      type: String,
    },
  },
  { timestamps: true },
);

const Cetagory = mongoose.model("Cetagory", cetagorySchema);

export default Cetagory;
