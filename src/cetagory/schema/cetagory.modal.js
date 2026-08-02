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
  },
  { timestamps: true },
);

const Cetagory = mongoose.model("Cetagory", cetagorySchema);

export default Cetagory;
