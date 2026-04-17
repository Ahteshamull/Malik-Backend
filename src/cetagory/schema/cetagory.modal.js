import mongoose from "mongoose";

const cetagorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: {
        values: ["Resturant", "Recursion", "Event"],
        message: "Invalid cetagory",
      },
      required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true },
);

const Cetagory = mongoose.model("Cetagory", cetagorySchema);

export default Cetagory;
