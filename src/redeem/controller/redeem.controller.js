import Redeem from "../schema/redeem.modal.js";
import userModel from "../../auth/schema/auth.modal.js";
import Gift from "../../gift/schema/gift.modal.js";

export const allRedeemStar = async (req, res) => {
  try {
    // Get all redeem stars from database with populated data
    const redeemStars = await Redeem.find({})
      .populate("property", "title description images")
      .populate("host", "name email")
      .populate("stars", "title description image price")
      .sort({ createdAt: -1 });

    // Remove sensitive fields from response and include user info
    const sanitizedStars = redeemStars.map((star) => ({
      _id: star._id,
      title: star.title,
      description: star.description,
      price: star.price,
      image: star.image,
      createdAt: star.createdAt,
      updatedAt: star.updatedAt,
      // Include related data
      property: star.property
        ? {
            _id: star.property._id,
            title: star.property.title,
            description: star.property.description,
            images: star.property.images,
          }
        : null,
      host: star.host
        ? {
            _id: star.host._id,
            name: star.host.name,
            email: star.host.email,
          }
        : null,
      stars: star.stars || [],
    }));

    res.status(200).json({
      success: true,
      message: "Redeem stars retrieved successfully",
      data: sanitizedStars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving redeem stars",
    });
  }
};

export const getUserRedeemStars = async (req, res) => {
  return res.status(503).json({
    message: "Redeem stars functionality is currently disabled",
    reason: "Collaboration features have been removed",
  });
};
