import mongoose from "mongoose";

const { Schema } = mongoose;

const rettingSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceProviderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    RettingType: {
      type: String,
      enum: ["service", "user"],
      default: "service",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isReport: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "rettings",
  },
);

// Create indexes for better query performance
rettingSchema.index({ serviceId: 1 });
rettingSchema.index({ userId: 1 });
rettingSchema.index({ serviceProviderId: 1 });
rettingSchema.index({ rating: 1 });
rettingSchema.index({ isDeleted: 1 });
rettingSchema.index({ RettingType: 1 });

// Static method to calculate average rating and total reviews
rettingSchema.statics.calculateAverageRating = async function (serviceId) {
  const stats = await this.aggregate([
    {
      $match: { serviceId: serviceId, isDeleted: false },
    },
    {
      $group: {
        _id: "$serviceId",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Service").findByIdAndUpdate(serviceId, {
      totalReviews: stats[0].nRating,
      averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
    });
  } else {
    await mongoose.model("Service").findByIdAndUpdate(serviceId, {
      totalReviews: 0,
      averageRating: 0,
    });
  }
};

// Call calculateAverageRating after save
rettingSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.serviceId);
});

// Call calculateAverageRating after delete/update
rettingSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.serviceId);
  }
});

const Retting = mongoose.model("Retting", rettingSchema);

export default Retting;
