import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema({
cetagory: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Cetagory",
},
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  serviceLink: {
    type: String,
  },
  discount: {
    type: Number,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  promocode: {
    type: String,
  },
  offerCetagory:{
    type: String,
    enum: ["Hotel", "Eat & Drink", "Experiences", "Events", "Transport", "Accommodation", "Others", "Other"],
    default: "Others",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    Refinements: [
      {
        title: { type: String },
        images: [{ type: String }],
      }
    ]
}, { timestamps: true });


const Offer = mongoose.model("Offer", OfferSchema);
export default Offer;
