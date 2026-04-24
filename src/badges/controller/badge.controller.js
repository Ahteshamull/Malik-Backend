import Badge from "../schema/badges.modal.js";

export const createBadge = async (req, res) => {
  try {
    const {
      title,
      isModalEnabled,
      introDescription,
      showNote,
      footerReassuranceText,
    } = req.body;

    let { criteriaList, icon } = req.body;

    // Handle File Upload for Main Icon
    if (req.files && req.files.icon) {
      icon = `/uploads/${req.files.icon[0].filename}`;
    }

    // Parse criteriaList if it's a string (common in form-data)
    if (typeof criteriaList === "string") {
      try {
        criteriaList = JSON.parse(criteriaList);
      } catch (e) {
        criteriaList = [];
      }
    }

    const badge = await Badge.create({
      title,
      icon,
      isModalEnabled,
      introDescription,
      criteriaList,
      showNote,
      footerReassuranceText,
    });
    return res
      .status(201)
      .json({ success: true, message: "Badge created successfully", badge });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

export const addCriteriaToBadge = async (req, res) => {
  try {
    const { id } = req.params;
    let { icon, text } = req.body;

    // Handle File Upload for Criteria Icon
    if (req.file) {
      icon = `/uploads/${req.file.filename}`;
    }

    if (!icon || !text) {
      return res
        .status(400)
        .json({ success: false, message: "Icon and text are required" });
    }

    const badge = await Badge.findByIdAndUpdate(
      id,
      {
        $push: { criteriaList: { icon, text } },
      },
      { new: true }
    );

    if (!badge) {
      return res.status(404).json({ success: false, message: "Badge not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Criteria added successfully",
      badge,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const autoAssignBadges = async (serviceId) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const Service = mongoose.model("Service");
    
    const service = await Service.findById(serviceId);
    if (!service) return;

    const badges = await Badge.find({ isDeleted: false });

    const earnedBadges = [];

    for (const badge of badges) {
      const cond = badge.automatedConditions;
      if (!cond) continue;

      let passes = true;

      // Condition checks
      if (cond.minRating > 0 && service.averageRating < cond.minRating) passes = false;
      if (cond.minReviews > 0 && service.totalReviews < cond.minReviews) passes = false;
      if (cond.maxResponseTimeHours !== null && service.responseTimeHours > cond.maxResponseTimeHours) passes = false;

      // If it passes all rules configured, it earns the badge
      if (passes) {
        earnedBadges.push(badge._id);
      }
    }

    // Update service's badges arrays with only the earned ones
    await Service.findByIdAndUpdate(serviceId, { badges: earnedBadges });
    
  } catch (error) {
    console.error("Error auto-assigning badges:", error);
  }
};

export const getAllBadges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Badge.countDocuments({ isDeleted: false });
    const badges = await Badge.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Badges fetched successfully",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      badges,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const badge = await Badge.findByIdAndDelete(id);
    if (!badge) {
      return res.status(404).json({ success: false, message: "Badge not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Badge deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const singleBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const badge = await Badge.findById(id);
    if (!badge) {
      return res.status(404).json({ success: false, message: "Badge not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Badge fetched successfully",
      badge,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
