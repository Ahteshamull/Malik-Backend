import SubCetagory from "../schema/cetagory.modal.js";
import Cetagory from "../../cetagory/schema/cetagory.modal.js";

import fs from "fs";
import path from "path";

export const createSubCetagory = async (req, res) => {
  try {
    const { name, description, cetagory, tags } = req.body;
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];
    const isCategoryExist = await Cetagory.findById(cetagory);
    if (!isCategoryExist) {
        return res.status(404).json({ success: false, message: "Parent Cetagory not found with this ID" });
    }

    const subCetagory = await SubCetagory.create({
      name,
      description,
      images,
      cetagory,
      tags,
    });


    const populatedSubCetagory = await SubCetagory.findById(subCetagory._id).populate("cetagory");

    res.status(201).json({
      success: true,
      message: "SubCetagory created successfully",
      data: populatedSubCetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const allSubCetagory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await SubCetagory.countDocuments();
    const subCetagory = await SubCetagory.find()
      .populate("cetagory")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: "SubCetagory retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: subCetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const singleSubCetagory = async (req, res) => {
  try {
    const subCetagory = await SubCetagory.findById(req.params.id).populate(
      "cetagory",
    );
    if (!subCetagory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCetagory not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "SubCetagory retrieved successfully",
        data: subCetagory,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubCetagory = async (req, res) => {
  try {
    const subCetagory = await SubCetagory.findById(req.params.id);
    if (!subCetagory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCetagory not found" });
    }
    const { description, name, cetagory, tags } = req.body;
    const updateData = {};
    if (description) updateData.description = description;
    if (name) updateData.name = name;
    if (cetagory) {
        const isCategoryExist = await Cetagory.findById(cetagory);
        if (!isCategoryExist) {
            return res.status(404).json({ success: false, message: "Parent Cetagory not found with this ID" });
        }
        updateData.cetagory = cetagory;
    }
    if (tags) updateData.tags = tags;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);

      // Delete old images from storage
      if (subCetagory.images && subCetagory.images.length > 0) {
        subCetagory.images.forEach((img) => {
          const relativePath = img.startsWith("/") ? img.slice(1) : img;
          const oldImagePath = path.join(process.cwd(), relativePath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        });

      }
      updateData.images = newImages; // Add new image paths to update
    }

    const updatedSubCetagory = await SubCetagory.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).populate("cetagory");

    res.status(200).json({
      success: true,
      message: "SubCetagory updated successfully",
      data: updatedSubCetagory,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubCetagory = async (req, res) => {
  try {
    const subCetagory = await SubCetagory.findByIdAndDelete(req.params.id);
    if (!subCetagory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCetagory not found" });
    }

    // Delete image files if they exist
    if (subCetagory.images && subCetagory.images.length > 0) {
      subCetagory.images.forEach((img) => {
        const relativePath = img.startsWith("/") ? img.slice(1) : img;
        const imagePath = path.join(process.cwd(), relativePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }


    res.status(200).json({
      success: true,
      message: "SubCetagory deleted successfully",
      data: subCetagory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
