import Badge from "../schema/badges.modal.js";

export const createBadge = async (req, res) => {
  try {
    const {
      title,
      icon,
      isModalEnabled,
      introDescription,
      criteriaList,
      showNote,
      footerReassuranceText,
    } = req.body;
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
    const { icon, text } = req.body;

    if (!icon || !text) {
      return res.status(400).json({ success: false, message: "Icon and text are required" });
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
