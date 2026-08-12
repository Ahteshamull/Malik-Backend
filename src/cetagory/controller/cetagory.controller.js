import Cetagory from "../schema/cetagory.modal.js";
import fs from "fs";
import path from "path";
import { delCacheByPrefix } from "../../helper/cache.js";

export const createCetagory = async (req, res) => {
  try {
    const { name, description, bgColor, textColor, pageTitle, pageDescription } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const cetagory = await Cetagory.create({
      name,
      description,
      image,
      bgColor,
      textColor,
      pageTitle,
      pageDescription,
    });

    // Invalidate all category cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/cetagory`);

    res.status(201).json({
      success: true,
      message: "Cetagory created successfully",
      data: cetagory,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allCetagory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Cetagory.countDocuments();
    const cetagory = await Cetagory.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: "Cetagory retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: cetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const singleCetagory = async (req, res) => {
  try {
    const cetagory = await Cetagory.findById(req.params.id);
    if (!cetagory) {
      return res
        .status(404)
        .json({ success: false, message: "Cetagory not found" });
    }
    res.status(200).json({
      success: true,
      message: "Cetagory retrieved successfully",
      data: cetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCetagory = async (req, res) => {
  try {
    const cetagory = await Cetagory.findById(req.params.id);
    if (!cetagory) {
      return res
        .status(404)
        .json({ success: false, message: "Cetagory not found" });
    }
    const { description, name, bgColor, textColor, pageTitle, pageDescription } = req.body;
    const updateData = { description, name, bgColor, textColor, pageTitle, pageDescription };

    if (req.file) {
      const newImagePath = `/uploads/${req.file.filename}`;

      // Delete old image file if it exists
      if (cetagory.image && cetagory.image !== newImagePath) {
        const oldImagePath = path.join(process.cwd(), cetagory.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = newImagePath;
    }

    const updatedCetagory = await Cetagory.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    // Invalidate all category cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/cetagory`);

    res.status(200).json({
      success: true,
      message: "Cetagory updated successfully",
      data: updatedCetagory,
    });
  } catch (error) {
    if (error && error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCetagory = async (req, res) => {
  try {
    const cetagory = await Cetagory.findByIdAndDelete(req.params.id);
    if (!cetagory) {
      return res
        .status(404)
        .json({ success: false, message: "Cetagory not found" });
    }

    // Delete image file if it exists
    if (cetagory.image) {
      const imagePath = path.join(process.cwd(), cetagory.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Invalidate all category cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/cetagory`);

    res.status(200).json({
      success: true,
      message: "Cetagory deleted successfully",
      data: cetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
