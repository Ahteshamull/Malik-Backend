import mongoose from "mongoose";

const esimProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String, // URL of the logo image
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    link: {
      type: String, // Referral or purchase link
      required: true,
    },
    isSpecialOffer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const EsimProvider = mongoose.model("EsimProvider", esimProviderSchema);

export default EsimProvider;
