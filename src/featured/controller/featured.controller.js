import FeaturedSection from "../schema/featured.modal.js";

// Get all featured sections with populated items
export const getFeaturedSections = async (req, res) => {
  try {
    const sections = await FeaturedSection.find()
      .populate({
        path: "items.item",
        populate: [
          { path: "cetagory", select: "name" },
          { path: "subCetagory", select: "name" },
          { path: "badges" },
          { path: "offer" }
        ]
      });

    return res.status(200).json({
      success: true,
      message: "Featured sections retrieved successfully",
      data: sections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve featured sections",
      error: error.message,
    });
  }
};

// Get a single featured section by its key
export const getFeaturedSectionByKey = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const section = await FeaturedSection.findOne({ sectionKey })
      .populate({
        path: "items.item",
        populate: [
          { path: "cetagory", select: "name" },
          { path: "subCetagory", select: "name" },
          { path: "badges" },
          { path: "offer" }
        ]
      });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Featured section '${sectionKey}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Featured section retrieved successfully",
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve featured section",
      error: error.message,
    });
  }
};

// Create or update a featured section configuration
export const updateFeaturedSection = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { title, items } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Modern Mongoose update using returnDocument: 'after' (no deprecated new: true)
    const section = await FeaturedSection.findOneAndUpdate(
      { sectionKey },
      {
        sectionKey,
        title,
        items: items || [],
      },
      { upsert: true, returnDocument: 'after' }
    ).populate({
      path: "items.item",
      populate: [
        { path: "cetagory", select: "name" },
        { path: "subCetagory", select: "name" },
        { path: "badges" },
        { path: "offer" }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Featured section updated successfully",
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update featured section",
      error: error.message,
    });
  }
};

// Get intro text for home/featured page
export const getFeaturedIntro = async (req, res) => {
  try {
    const section = await FeaturedSection.findOne({ sectionKey: "featured_home_intro" });
    return res.status(200).json({
      success: true,
      data: {
        title: section?.title || "Discover the Caribbean differently",
        subtitle: section?.subtitle || "Curated experiences, real culture, & trusted guidance",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve featured intro text",
      error: error.message,
    });
  }
};

// Update intro text for home/featured page (admin only)
export const updateFeaturedIntro = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const section = await FeaturedSection.findOneAndUpdate(
      { sectionKey: "featured_home_intro" },
      {
        sectionKey: "featured_home_intro",
        title: title.trim(),
        subtitle: (subtitle || "").trim(),
        items: [],
      },
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(200).json({
      success: true,
      message: "Featured page intro updated successfully",
      data: {
        title: section.title,
        subtitle: section.subtitle,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update featured intro text",
      error: error.message,
    });
  }
};
