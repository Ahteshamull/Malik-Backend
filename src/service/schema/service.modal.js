import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    cetagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cetagory",
      required: true,
    },
    subCetagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCetagory",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    openTime: {
      type: String,
    },
    closeTime: {
      type: String,
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    photoOfVisitor: [
      {
        type: String,
      },
    ],
    hotelMenu: [
      {
        type: String,
      },
    ],
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    date: {
      type: String,
    },
    // These should be Numbers to store aggregate values
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    responseTimeHours: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        type: Object,
      },
    ],
    // isFavourite: {
    //   type: Boolean,
    //   default: false,
    // },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

// Added text index for name searches
serviceSchema.index({ name: "text" });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
