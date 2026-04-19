import fs from "fs";
import path from "path";
import axios from "axios";

import Service from "../schema/service.modal.js";
import Cetagory from "../../cetagory/schema/cetagory.modal.js";
import SubCetagory from "../../subCetagory/schema/cetagory.modal.js";
import { autoAssignBadges } from "../../badges/controller/badge.controller.js";

export const createService = async (req, res) => {
  try {
    let serviceData = { ...req.body };

    // Handle data if sent as a single JSON string (common in Postman/Frontend)
    if (typeof req.body.data === "string") {
      try {
        const parsedData = JSON.parse(req.body.data);
        serviceData = { ...serviceData, ...parsedData };
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
      }
    }

    // Handle image upload if exists
    if (req.files) {
      if (req.files.image) serviceData.image = `/uploads/${req.files.image[0].filename}`;
      if (req.files.photoOfVisitor) serviceData.photoOfVisitor = req.files.photoOfVisitor.map(file => `/uploads/${file.filename}`);
      if (req.files.hotelMenu) serviceData.hotelMenu = req.files.hotelMenu.map(file => `/uploads/${file.filename}`);
    }

    const service = await Service.create(serviceData);

    // Automatically check and assign badges to the new service
    await autoAssignBadges(service._id);

    // Populate category and subcategory
    await service.populate("cetagory", "name");
    await service.populate("subCetagory", "name");
    // Also populate newly assigned badges
    await service.populate("badges");

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating service",
      error: error.message,
    });
  }
};


export const allServices = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      name,
      offer,
      offerType,
      cetagory: cetagoryQuery,
      category: categoryQuery,
      subCetagory: subCetagoryQuery,
      subcategory: subCategoryQuery,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };

    // Handle search by service name (Partial match, case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Handle offer filtering
    if (offer) {
      filter.offer = offer === "true";
    }

    // Handle offerType filtering
    if (offerType) {
      filter.offerType = offerType;
    }

    // Handle Category lookup by name
    const targetCategory =
      cetagoryQuery ||
      categoryQuery ||
      (type === "cetagory" || type === "category" ? name : null);
    if (targetCategory) {
      const cat = await Cetagory.findOne({
        name: { $regex: new RegExp(`^${targetCategory}$`, "i") },
      });
      filter.cetagory = cat ? cat._id : "000000000000000000000000";
    }

    // Handle SubCategory lookup by name
    const targetSubCategory =
      subCetagoryQuery ||
      subCategoryQuery ||
      (type === "subCetagory" || type === "subcategory" ? name : null);
    if (targetSubCategory) {
      const subCat = await SubCetagory.findOne({
        name: { $regex: new RegExp(`^${targetSubCategory}$`, "i") },
      });
      filter.subCetagory = subCat ? subCat._id : "000000000000000000000000";
    }

    const total = await Service.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    const services = await Service.find(filter)
      .populate("cetagory", "name")
      .populate("subCetagory", "name")
      .populate("badges")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching services",
      error: error.message,
    });
  }
};

export const singleService = async (req, res) => {
  try {
    const { id } = req.params;
    // Find service by ID and ensure it is not deleted
    const service = await Service.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("cetagory")
      .populate("subCetagory")
      .populate("badges");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching service",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Handle data if sent as a single JSON string
    if (typeof req.body.data === "string") {
      try {
        const parsedData = JSON.parse(req.body.data);
        updateData = { ...updateData, ...parsedData };
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
      }
    }

    // Handle file updates and old file deletion
    if (req.files) {
      const existingService = await Service.findById(id);
      
      const fileFieldsArray = ["photoOfVisitor", "hotelMenu"];
      
      // Update arrays of files
      fileFieldsArray.forEach((field) => {
        if (req.files[field]) {
          // Delete old files if they exist
          if (existingService && Array.isArray(existingService[field])) {
            existingService[field].forEach((oldFileName) => {
              if(oldFileName) {
                const oldFilePath = path.join(process.cwd(), oldFileName);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
              }
            });
          }
          // Set new file paths array
          updateData[field] = req.files[field].map(file => `/uploads/${file.filename}`);
        }
      });

      // Update single image
      if (req.files.image) {
        if (existingService && existingService.image) {
          const oldFilePath = path.join(process.cwd(), existingService.image);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        }
        updateData.image = `/uploads/${req.files.image[0].filename}`;
      }
    }

    const service = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Trigger automatic badge assignment evaluation when service is updated
    await autoAssignBadges(service._id);
    
    // Fetch again to get fully populated badges
    const updatedService = await Service.findById(service._id)
      .populate("cetagory")
      .populate("subCetagory")
      .populate("badges");

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating service",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, { isDeleted: true });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting service",
      error: error.message,
    });
  }
};
