import Retting from "../schema/retting.modal.js";

import userModel from "../../auth/schema/auth.modal.js";

export const createRetting = async (req, res) => {
  return res.status(503).json({
    message: "Retting creation is currently disabled",
    reason: "Collaboration features have been removed",
  });
};

export const userPersonalRetting = async (req, res) => {
  try {
    const { page = 1, limit = 10, RettingType } = req.query;

    // Get user ID from authenticated user (from JWT token)
    const userId = req.user?.id || req.user?._id;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Convert pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter - get Rettings where user is either Rettinger or Rettingee
    const filter = {
      isDeleted: false,
      $or: [
        { RettingerId: userId.toString() }, // Rettings I wrote
        { RettingeeId: userId.toString() }, // Rettings about me
      ],
    };

    // Filter by Retting type if specified
    if (RettingType) {
      filter.RettingType = RettingType;
    }

    // Get total count
    const total = await Retting.countDocuments(filter);

    // Get Rettings with pagination and populate related data
    const Rettings = await Retting.find(filter)
      .populate("collaborationId", "title status")
      .populate("RettingerId", "name email image")
      .populate("RettingeeId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get statistics
    const RettingsWritten = await Retting.countDocuments({
      RettingerId: userId.toString(),
      isDeleted: false,
    });

    const RettingsReceived = await Retting.countDocuments({
      RettingeeId: userId.toString(),
      isDeleted: false,
    });

    const averageRating = await Retting.aggregate([
      {
        $match: {
          RettingeeId: userId.toString(),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Get user details with rating info
    const userWithRatings = await userModel
      .findById(userId)
      .select("name email image averageRating totalRettings");

    return res.status(200).json({
      success: true,
      message: "User Rettings retrieved successfully",
      data: {
        user: userWithRatings,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        meta: {
          RettingsWritten,
          RettingsReceived,
          averageRating: averageRating[0]?.avgRating || 0,
          filterApplied: {
            RettingType: RettingType || null,
          },
        },
        Rettings,
      },
    });
  } catch (error) {
    console.error("Error fetching user Rettings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user Rettings",
      error: error.message,
    });
  }
};

export const userRetting = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, RettingType } = req.query;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Convert pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter - get Rettings where user is either Rettinger or Rettingee
    const filter = {
      isDeleted: false,
      $or: [
        { RettingerId: userId }, // Rettings user wrote
        { RettingeeId: userId }, // Rettings about user
      ],
    };

    // Filter by Retting type if specified
    if (RettingType) {
      filter.RettingType = RettingType;
    }

    // Get total count
    const total = await Retting.countDocuments(filter);

    // Get Rettings with pagination and populate related data
    const Rettings = await Retting.find(filter)
      .populate("collaborationId", "title status")
      .populate("RettingerId", "name email image")
      .populate("RettingeeId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get statistics
    const RettingsWritten = await Retting.countDocuments({
      RettingerId: userId,
      isDeleted: false,
    });

    const RettingsReceived = await Retting.countDocuments({
      RettingeeId: userId,
      isDeleted: false,
    });

    const averageRating = await Retting.aggregate([
      {
        $match: {
          RettingeeId: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    // Get user details with rating info
    const userWithRatings = await userModel
      .findById(userId)
      .select("name email image averageRating totalRettings");

    return res.status(200).json({
      success: true,
      message: "User Rettings retrieved successfully",
      data: {
        user: userWithRatings,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        meta: {
          userId,
          RettingsWritten,
          RettingsReceived,
          averageRating: averageRating[0]?.avgRating || 0,
          filterApplied: {
            RettingType: RettingType || null,
          },
        },
        Rettings,
      },
    });
  } catch (error) {
    console.error("Error fetching user Rettings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user Rettings",
      error: error.message,
    });
  }
};

export const deleteRetting = async (req, res) => {
  try {
    const { RettingId } = req.params;

    // Get user ID from authenticated user (from JWT token)
    const userId = req.user?.id || req.user?._id;

    // Validate user authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Validate Retting ID
    if (!RettingId) {
      return res.status(400).json({
        success: false,
        message: "Retting ID is required",
      });
    }

    // Find the Retting
    const Retting = await Retting.findById(RettingId);

    if (!Retting) {
      return res.status(404).json({
        success: false,
        message: "Retting not found",
      });
    }

    // Check if Retting is already deleted
    if (Retting.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Retting is already deleted",
      });
    }

    // Check if user is authorized to delete this Retting
    // Only the Rettinger (who wrote the Retting) can delete it
    if (Retting.RettingerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the Rettinger can delete this Retting",
      });
    }

    // Soft delete the Retting
    await Retting.findByIdAndUpdate(RettingId, { isDeleted: true });

    return res.status(200).json({
      success: true,
      message: "Retting deleted successfully",
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
      .populate("collaborationId", "title status")
      .populate("RettingerId", "name email image")
      .populate("RettingeeId", "name email image")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Get statistics
    const totalRettings = await Retting.countDocuments({ isDeleted: false });

    const RettingsByType = await Retting.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: "$RettingType",
          count: { $sum: 1 },
        },
      },
    ]);

    const RettingsByRating = await Retting.aggregate([
      {
        $match: { isDeleted: false },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

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
      data: {
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        meta: {
          totalRettings,
          averageRating: averageRating[0]?.avgRating || 0,
          RettingsByType,
          RettingsByRating,
          filterApplied: {
            RettingType: RettingType || null,
            rating: rating || null,
          },
        },
        Rettings,
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
