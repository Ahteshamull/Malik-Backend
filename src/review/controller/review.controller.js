import mongoose from "mongoose";
import Retting from "../schema/retting.modal.js";
import Service from "../../service/schema/service.modal.js";
import userModel from "../../auth/schema/auth.modal.js";

export const createRetting = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { rating, comment } = req.body;

    // Get user ID from authenticated user (from JWT token)
    const userId = req.user?.id || req.user?._id;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Validate input
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required",
      });
    }

    // Check if the service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Create the retting (rating/review)
    const newRetting = await Retting.create({
      rating,
      comment,
      serviceId,
      userId: userId,
      RettingType: "service",
    });

    const populatedRetting = await Retting.findById(newRetting._id)
      .populate("serviceId", "name image")
      .populate("userId", "name email image");

    // Optionally update the Service model's reviews array if you want to keep a copy there
    await Service.findByIdAndUpdate(serviceId, {
      $push: {
        reviews: {
          userId,
          rating,
          comment,
          createdAt: new Date(),
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Retting created successfully",
      data: populatedRetting,
    });
  } catch (error) {
    console.error("Error creating Retting:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating Retting",
      error: error.message,
    });
  }
};


export const deleteRetting = async (req, res) => {
  try {
    const { RettingId } = req.params;

    if (!RettingId) {
      return res.status(400).json({
        success: false,
        message: "Retting ID is required",
      });
    }

    const retting = await Retting.findById(RettingId);

    if (!retting) {
      return res.status(404).json({
        success: false,
        message: "Retting not found",
      });
    }

    // Soft delete the Retting
    await Retting.findByIdAndUpdate(RettingId, { isDeleted: true });

    return res.status(200).json({
      success: true,
      message: "Retting deleted successfully by Admin",
    });
  } catch (error) {
    console.error("Error deleting Retting:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting Retting",
      error: error.message,
    });
  }
};


export const singleRetting = async (req, res) => {
  try {
    const { RettingId } = req.params;

    // Validate Retting ID
    if (!RettingId) {
      return res.status(400).json({
        success: false,
        message: "Retting ID is required",
      });
    }

    // Find the Retting
    const retting = await Retting.findById(RettingId)
      .populate("serviceId", "name image")
      .populate("userId", "name email image");

    if (!retting) {
      return res.status(404).json({
        success: false,
        message: "Retting not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Retting retrieved successfully",
      data: retting,
    });
  } catch (error) {
    console.error("Error fetching Retting:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching Retting",
      error: error.message,
    });
  }
};

export const allRettings = async (req, res) => {
  try {
    const { page = 1, limit = 10, RettingType, rating } = req.query;

    // Convert pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { isDeleted: false };

    // Filter by Retting type if specified
    if (RettingType) {
      filter.RettingType = RettingType;
    }

    // Filter by rating if specified
    if (rating) {
      filter.rating = parseInt(rating);
    }

    // Get total count
    const total = await Retting.countDocuments(filter);

    // Get Rettings with pagination and populate related data
    const Rettings = await Retting.find(filter)
      .populate("serviceId", "name image")
      .populate("userId", "name email image")
      .populate("serviceProviderId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const averageRating = await Retting.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "All Rettings retrieved successfully",
      meta: {
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        data: Rettings,
        averageRating: averageRating[0]?.avgRating || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching all Rettings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching all Rettings",
      error: error.message,
    });
  }
};

export const getReetingByserviceId = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate service ID
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    // Convert pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Retting.countDocuments({
      serviceId: serviceId,
      isDeleted: false,
    });

    // Find the Rettings for this service with pagination
    const rettings = await Retting.find({ serviceId: serviceId, isDeleted: false })
      .populate("serviceId", "name image")
      .populate("userId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    if (!rettings || rettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this service",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      meta: {
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        data: rettings,
      },
    });
  } catch (error) {
    console.error("Error fetching Retting:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching Retting",
      error: error.message,
    });
  }
};
