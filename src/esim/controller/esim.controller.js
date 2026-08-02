import EsimContent from "../schema/esimContent.modal.js";
import EsimProvider from "../schema/esimProvider.modal.js";
import path from "path";
import fs from "fs";

// --- Content Management ---

export const getContent = async (req, res) => {
  try {
    let content = await EsimContent.findOne();
    if (!content) {
      // Create default if doesn't exist
      content = await EsimContent.create({
        heading: "E-Sim Providers",
        description: "Find the best E-Sim providers for your trip.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "E-Sim content retrieved successfully",
      data: content,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving E-Sim content",
      error: error.message,
    });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { heading, description } = req.body;
    let content = await EsimContent.findOne();

    if (!content) {
      content = await EsimContent.create({ heading, description });
    } else {
      content.heading = heading || content.heading;
      content.description = description || content.description;
      await content.save();
    }

    return res.status(200).json({
      success: true,
      message: "E-Sim content updated successfully",
      data: content,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating E-Sim content",
      error: error.message,
    });
  }
};

// --- Provider Management ---

export const getProviders = async (req, res) => {
  try {
    const providers = await EsimProvider.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "E-Sim providers retrieved successfully",
      data: providers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving E-Sim providers",
      error: error.message,
    });
  }
};

export const addProvider = async (req, res) => {
  try {
    const { name, link, description, isSpecialOffer } = req.body;
    
    if (!name || !link) {
      return res.status(400).json({
        success: false,
        message: "Name and link are required",
      });
    }

    let logoPath = "";
    if (req.file) {
      // Assuming baseUrl logic or just saving the relative path
      logoPath = `/uploads/${req.file.filename}`;
    }

    const provider = await EsimProvider.create({
      name,
      link,
      description: description || "",
      isSpecialOffer: isSpecialOffer === "true",
      logo: logoPath,
    });

    return res.status(201).json({
      success: true,
      message: "E-Sim provider added successfully",
      data: provider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding E-Sim provider",
      error: error.message,
    });
  }
};

export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, description, isSpecialOffer } = req.body;

    const provider = await EsimProvider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "E-Sim provider not found",
      });
    }

    if (name) provider.name = name;
    if (link) provider.link = link;
    if (description !== undefined) provider.description = description;
    if (isSpecialOffer !== undefined) provider.isSpecialOffer = isSpecialOffer === "true";

    if (req.file) {
      provider.logo = `/uploads/${req.file.filename}`;
    }

    await provider.save();

    return res.status(200).json({
      success: true,
      message: "E-Sim provider updated successfully",
      data: provider,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating E-Sim provider",
      error: error.message,
    });
  }
};

export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await EsimProvider.findByIdAndDelete(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "E-Sim provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "E-Sim provider deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting E-Sim provider",
      error: error.message,
    });
  }
};
