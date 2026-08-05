import Badge from "../schema/badges.modal.js";

export const createBadge = async (req, res) => {
  try {
    const { title, introDescription, footerReassuranceText } = req.body;

    let { isModalEnabled, showNote, criteriaList, icon, automatedConditions } = req.body;

    // Convert form-data checkboxes/strings to boolean
    isModalEnabled =
      isModalEnabled === "on" ||
      isModalEnabled === "true" ||
      isModalEnabled === true;
    showNote = showNote === "on" || showNote === "true" || showNote === true;

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

    // Parse automatedConditions if it's a string (common in form-data)
    if (typeof automatedConditions === "string") {
      try {
        automatedConditions = JSON.parse(automatedConditions);
      } catch (e) {
        automatedConditions = undefined;
      }
    }

    // Fallback if they are passed directly in body
    if (!automatedConditions) {
       const { minRating, minReviews, maxResponseTimeHours } = req.body;
       if (minRating !== undefined || minReviews !== undefined || maxResponseTimeHours !== undefined) {
          automatedConditions = {
            minRating: minRating ? Number(minRating) : 0,
            minReviews: minReviews ? Number(minReviews) : 0,
            maxResponseTimeHours: maxResponseTimeHours !== undefined && maxResponseTimeHours !== "" && maxResponseTimeHours !== "null" ? Number(maxResponseTimeHours) : null,
          };
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
      ...(automatedConditions && { automatedConditions }),
    });

    // Trigger background re-evaluation for existing services
    reEvaluateServicesForBadge(badge._id).catch(err => console.error("Error in background badge assignment:", err));

    return res
      .status(201)
      .json({ success: true, message: "Badge created successfully", badge });
  } catch (error) {
    return res.status(500).json({
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
      { new: true },
    );

    if (!badge) {
      return res
        .status(404)
        .json({ success: false, message: "Badge not found" });
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

    // Group by title and keep only the "best" qualified badge for each title
    const bestBadgesByTitle = {};

    for (const badge of badges) {
      const cond = badge.automatedConditions;
      if (!cond) continue;

      let passes = true;

      // Condition checks
      if (cond.minRating > 0 && service.averageRating < cond.minRating)
        passes = false;
      if (cond.minReviews > 0 && service.totalReviews < cond.minReviews)
        passes = false;
      if (
        cond.maxResponseTimeHours !== null &&
        service.responseTimeHours > cond.maxResponseTimeHours
      )
        passes = false;

      // If it passes all rules configured, it qualifies
      if (passes) {
        const title = badge.title;
        if (!bestBadgesByTitle[title]) {
          bestBadgesByTitle[title] = badge;
        } else {
          // Compare difficulty to keep the "highest" level badge of this title
          const existing = bestBadgesByTitle[title].automatedConditions;

          // A badge is "better" if it has higher rating requirements,
          // or same rating but higher review requirements,
          // or same rating/reviews but stricter response time.
          const isBetter =
            cond.minRating > existing.minRating ||
            (cond.minRating === existing.minRating &&
              cond.minReviews > existing.minReviews) ||
            (cond.minRating === existing.minRating &&
              cond.minReviews === existing.minReviews &&
              cond.maxResponseTimeHours !== null &&
              (existing.maxResponseTimeHours === null ||
                cond.maxResponseTimeHours < existing.maxResponseTimeHours));

          if (isBetter) {
            bestBadgesByTitle[title] = badge;
          }
        }
      }
    }

    const earnedBadges = Object.values(bestBadgesByTitle).map((b) => b._id);

    // Update service's badges arrays with only the earned ones
    await Service.findByIdAndUpdate(serviceId, { badges: earnedBadges });
  } catch (error) {
    console.error("Error auto-assigning badges:", error);
  }
};

export const reEvaluateServicesForBadge = async (badgeId) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const Service = mongoose.model("Service");
    const Badge = (await import("../schema/badges.modal.js")).default;
    
    const badge = await Badge.findById(badgeId);
    if (!badge || !badge.automatedConditions) return;
    
    const cond = badge.automatedConditions;
    
    // Find services that AT LEAST match this badge's minimum conditions
    const query = { isDeleted: false };
    if (cond.minRating > 0) query.averageRating = { $gte: cond.minRating };
    if (cond.minReviews > 0) query.totalReviews = { $gte: cond.minReviews };
    if (cond.maxResponseTimeHours !== null) query.responseTimeHours = { $lte: cond.maxResponseTimeHours };
    
    const servicesToUpdate = await Service.find(query).select("_id");
    
    // For each service that matches, run the full autoAssign logic to ensure it doesn't conflict with other badges
    for (const service of servicesToUpdate) {
      await autoAssignBadges(service._id);
    }
    console.log(`Badge ${badge.title} auto-assigned to ${servicesToUpdate.length} eligible services.`);
  } catch (error) {
    console.error("Error re-evaluating services for badge:", error);
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
      return res
        .status(404)
        .json({ success: false, message: "Badge not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "Badge not found" });
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
