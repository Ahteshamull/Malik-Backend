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
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });


const Offer = mongoose.model("Offer", OfferSchema);
export default Offer;
