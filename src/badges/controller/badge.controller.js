import Badge from "../schema/badges.modal.js";

export const createBadge = async (req, res) => {
  try {
    const { title, introDescription, footerReassuranceText, bgColor, textColor } = req.body;

    let { isModalEnabled, showNote, criteriaList, icon } = req.body;

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

    const badge = await Badge.create({
      title,
      icon,
      isModalEnabled,
      introDescription,
      showNote,
      footerReassuranceText,
      bgColor,
      textColor,
    });

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

// Auto-assignment functions removed as requested by user


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

    // Remove the badge from all services that have it
    const mongoose = (await import("mongoose")).default;
    const Service = mongoose.model("Service");
    await Service.updateMany(
      { badges: id },
      { $pull: { badges: id } }
    );

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
