import legalDocModel from "../schema/legalDoc.modal.js";
import { delCache, delCacheByPrefix } from "../../helper/cache.js";

// Helper to clear all legalDoc caches
const invalidateLegalCache = () => {
  const baseUrl = process.env.BASE_URL || "/api/v1";
  delCacheByPrefix(`${baseUrl}/legalDoc`);
};

// Fallback metadata for known keys
const getKnownMetadata = (content) => {
  switch (content) {
    case "aboutUs":
      return {
        title: "About Us",
        subtitle: "Our mission, values and vision for Caribbean travel",
        icon: "business",
        iconColor: "0xFF5BD7BC",
        webUrl: "https://caribee.app/about",
        order: 1,
      };
    case "legalPolicies":
      return {
        title: "Legal Policies",
        subtitle: "Compliance, operational policies and legal framework",
        icon: "gavel",
        iconColor: "0xFF90CDF4",
        webUrl: "https://caribee.app/legal-policies",
        order: 2,
      };
    case "termsAndCondition":
      return {
        title: "Terms of Use",
        subtitle: "User agreement, rights and service terms",
        icon: "description",
        iconColor: "0xFFFBBF24",
        webUrl: "https://caribee.app/terms",
        order: 3,
      };
    case "privacyPolicy":
      return {
        title: "Privacy Policy",
        subtitle: "Data protection, cookies and your privacy rights",
        icon: "security",
        iconColor: "0xFFC084FC",
        webUrl: "https://caribee.app/privacy",
        order: 4,
      };
    default:
      return {
        title: content
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim(),
        subtitle: "",
        icon: "description",
        iconColor: "0xFF5BD7BC",
        webUrl: "",
        order: 99,
      };
  }
};

/**
 * Get all legal documents (for app and dashboard)
 * App: retrieves published documents sorted by order
 * Dashboard: pass ?includeUnpublished=true to get all documents
 */
export const getAllDocs = async (req, res) => {
  try {
    const { includeUnpublished } = req.query;

    const filter = {};
    if (includeUnpublished !== "true") {
      filter.isPublished = true;
    }

    let documents = await legalDocModel.find(filter).sort({ order: 1, createdAt: 1 });

    // Auto-backfill documents that may be missing title/fields from legacy schema
    let needsCacheClear = false;
    for (const doc of documents) {
      if (!doc.title || doc.title.trim() === "") {
        const meta = getKnownMetadata(doc.content);
        doc.title = meta.title;
        if (!doc.subtitle) doc.subtitle = meta.subtitle;
        if (!doc.icon) doc.icon = meta.icon;
        if (!doc.iconColor) doc.iconColor = meta.iconColor;
        if (!doc.webUrl) doc.webUrl = meta.webUrl;
        if (doc.order === undefined || doc.order === 0) doc.order = meta.order;
        if (doc.isPublished === undefined) doc.isPublished = true;
        await doc.save();
        needsCacheClear = true;
      }
    }

    if (needsCacheClear) {
      invalidateLegalCache();
      documents = await legalDocModel.find(filter).sort({ order: 1, createdAt: 1 });
    }

    return res.status(200).json({
      success: true,
      message: "Legal documents retrieved successfully",
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve legal documents",
      error: error.message,
    });
  }
};

/**
 * Get a single document by content key or ID
 */
export const getDoc = async (req, res) => {
  try {
    const { content } = req.params;

    let doc = await legalDocModel.findOne({ content });
    if (!doc && content && content.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await legalDocModel.findById(content);
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "No legal document found for the specified identifier",
      });
    }

    // Auto-backfill if title is missing
    if (!doc.title || doc.title.trim() === "") {
      const meta = getKnownMetadata(doc.content);
      doc.title = meta.title;
      if (!doc.subtitle) doc.subtitle = meta.subtitle;
      if (!doc.icon) doc.icon = meta.icon;
      if (!doc.webUrl) doc.webUrl = meta.webUrl;
      if (doc.order === undefined || doc.order === 0) doc.order = meta.order;
      await doc.save();
      invalidateLegalCache();
    }

    return res.status(200).json({
      success: true,
      message: "Legal document retrieved successfully",
      data: [doc],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve legal document",
      error: error.message,
    });
  }
};

/**
 * Admin: Create a new policy
 */
export const createPolicy = async (req, res) => {
  try {
    const {
      title,
      content,
      subtitle,
      description,
      image,
      icon,
      iconColor,
      webUrl,
      externalLinks,
      order,
      isPublished,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    // Auto-generate slug/content identifier if not provided
    const slug =
      content && content.trim() !== ""
        ? content.trim()
        : title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

    // Check if slug already exists
    const existing = await legalDocModel.findOne({ content: slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A policy with identifier '${slug}' already exists. Please choose a different title or slug.`,
      });
    }

    // Determine order if not specified
    let sortOrder = order;
    if (sortOrder === undefined || sortOrder === null) {
      const maxDoc = await legalDocModel.findOne().sort({ order: -1 });
      sortOrder = maxDoc && maxDoc.order ? maxDoc.order + 1 : 1;
    }

    // Image path from file upload or URL body
    const imagePath = req.file ? `/uploads/${req.file.filename}` : (image || "");

    // Parse external links if passed as string in multipart form data
    let parsedLinks = externalLinks;
    if (typeof externalLinks === "string") {
      try {
        parsedLinks = JSON.parse(externalLinks);
      } catch (_) {
        parsedLinks = [];
      }
    }

    const newPolicy = new legalDocModel({
      title: title.trim(),
      content: slug,
      subtitle: subtitle ? subtitle.trim() : "",
      description,
      image: imagePath,
      icon: icon ? icon.trim() : "description",
      iconColor: iconColor ? iconColor.trim() : "0xFF5BD7BC",
      webUrl: webUrl ? webUrl.trim() : "",
      externalLinks: Array.isArray(parsedLinks) ? parsedLinks : [],
      order: Number(sortOrder) || 0,
      isPublished: isPublished !== undefined ? isPublished === true || isPublished === "true" : true,
    });

    const saved = await newPolicy.save();
    invalidateLegalCache();

    return res.status(201).json({
      success: true,
      message: "Legal policy created successfully",
      data: saved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create legal policy",
      error: error.message,
    });
  }
};

/**
 * Admin: Update an existing policy by ID
 */
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      subtitle,
      description,
      image,
      icon,
      iconColor,
      webUrl,
      externalLinks,
      order,
      isPublished,
    } = req.body;

    const policy = await legalDocModel.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    if (title !== undefined) policy.title = title.trim();
    if (content !== undefined && content.trim() !== "") policy.content = content.trim();
    if (subtitle !== undefined) policy.subtitle = subtitle.trim();
    if (description !== undefined) policy.description = description;

    // Handle image file upload or body string
    if (req.file) {
      policy.image = `/uploads/${req.file.filename}`;
    } else if (image !== undefined) {
      policy.image = image;
    }

    if (icon !== undefined) policy.icon = icon.trim();
    if (iconColor !== undefined) policy.iconColor = iconColor.trim();
    if (webUrl !== undefined) policy.webUrl = webUrl.trim();

    if (externalLinks !== undefined) {
      let parsedLinks = externalLinks;
      if (typeof externalLinks === "string") {
        try {
          parsedLinks = JSON.parse(externalLinks);
        } catch (_) {
          parsedLinks = [];
        }
      }
      policy.externalLinks = Array.isArray(parsedLinks) ? parsedLinks : [];
    }

    if (order !== undefined) policy.order = Number(order);
    if (isPublished !== undefined) {
      policy.isPublished = isPublished === true || isPublished === "true";
    }

    const updated = await policy.save();
    invalidateLegalCache();

    return res.status(200).json({
      success: true,
      message: "Legal policy updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update legal policy",
      error: error.message,
    });
  }
};

/**
 * Admin: Delete a policy by ID
 */
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await legalDocModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    invalidateLegalCache();

    return res.status(200).json({
      success: true,
      message: "Legal policy deleted successfully",
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete legal policy",
      error: error.message,
    });
  }
};

/**
 * Admin: Reorder policies
 * Expects { policies: [ { id: "...", order: 0 }, { id: "...", order: 1 } ] }
 */
export const reorderPolicies = async (req, res) => {
  try {
    const { policies } = req.body;

    if (!Array.isArray(policies) || policies.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of { id, order } is required",
      });
    }

    const bulkOps = policies.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: Number(item.order) } },
      },
    }));

    await legalDocModel.bulkWrite(bulkOps);
    invalidateLegalCache();

    const updatedList = await legalDocModel.find().sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "Policies reordered successfully",
      data: updatedList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reorder policies",
      error: error.message,
    });
  }
};

/**
 * Admin: Toggle publish status
 */
export const togglePublishPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await legalDocModel.findById(id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    policy.isPublished = !policy.isPublished;
    await policy.save();
    invalidateLegalCache();

    return res.status(200).json({
      success: true,
      message: `Policy ${policy.isPublished ? "published" : "unpublished"} successfully`,
      data: policy,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle publish status",
      error: error.message,
    });
  }
};

/**
 * Legacy support: create or update doc by content parameter
 */
export const createDoc = async (req, res) => {
  try {
    const { content } = req.params;
    const { description, title, subtitle, icon, webUrl, image } = req.body;

    if (!content || !description) {
      return res.status(400).json({
        success: false,
        message: "Content parameter and description are required",
      });
    }

    const meta = getKnownMetadata(content);

    const existingDoc = await legalDocModel.findOne({ content });
    if (existingDoc) {
      existingDoc.description = description;
      if (title) existingDoc.title = title;
      if (subtitle) existingDoc.subtitle = subtitle;
      if (icon) existingDoc.icon = icon;
      if (webUrl) existingDoc.webUrl = webUrl;
      if (image || req.file) {
        existingDoc.image = req.file ? `/uploads/${req.file.filename}` : image;
      }
      const updatedDoc = await existingDoc.save();

      invalidateLegalCache();

      return res.status(200).json({
        success: true,
        message: "Legal document updated successfully",
        data: updatedDoc,
      });
    } else {
      const newDoc = new legalDocModel({
        title: title || meta.title,
        content,
        subtitle: subtitle || meta.subtitle,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : (image || ""),
        icon: icon || meta.icon,
        iconColor: meta.iconColor,
        webUrl: webUrl || meta.webUrl,
        order: meta.order,
        isPublished: true,
      });

      const savedDoc = await newDoc.save();
      invalidateLegalCache();

      return res.status(201).json({
        success: true,
        message: "Legal document created successfully",
        data: savedDoc,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process legal document",
      error: error.message,
    });
  }
};