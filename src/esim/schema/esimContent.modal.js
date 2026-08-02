import mongoose from "mongoose";

const esimContentSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "E-Sim Providers",
    },
    description: {
      type: String,
      default: "Find the best E-Sim providers for your trip.",
    },
  },
  { timestamps: true }
);

const EsimContent = mongoose.model("EsimContent", esimContentSchema);

export default EsimContent;
