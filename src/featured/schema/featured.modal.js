import mongoose from "mongoose";

const FeaturedSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true, // e.g. "featured_restaurants", "featured_experiences", "featured_events", "featured_offers"
    },
    title: {
      type: String,
      required: true,
    },
    items: [
      {
        itemType: {
          type: String,
          required: true,
          enum: ["Service", "Offer"],
        },
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "items.itemType",
        },
      },
    ],
  },
  { timestamps: true }
);

const FeaturedSection = mongoose.model("FeaturedSection", FeaturedSectionSchema);
export default FeaturedSection;
