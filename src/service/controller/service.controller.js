import fs from "fs";
import path from "path";
import Service from "../schema/service.modal.js";
import Cetagory from "../../cetagory/schema/cetagory.modal.js";
import SubCetagory from "../../subCetagory/schema/cetagory.modal.js";

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
    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }

    const service = await Service.create(serviceData);

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
    const { page = 1, limit = 10, search, type, name } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };

    // Handle search by service name (Partial match, case-insensitive)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }


    // Handle Category/SubCategory lookup by NAME from query
    if (name) {
      if (type === "cetagory" || type === "category") {
        const cat = await Cetagory.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        // If name was provided but not found, set filter to an ID that won't exist
        filter.cetagory = cat ? cat._id : "000000000000000000000000"; 
      }

      if (type === "subCetagory" || type === "subcategory") {
        const subCat = await SubCetagory.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
        // If name was provided but not found, set filter to an ID that won't exist
        filter.subCetagory = subCat ? subCat._id : "000000000000000000000000";
      }
    }



    const total = await Service.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);


    const services = await Service.find(filter)
      .populate("cetagory", "name")
      .populate("subCetagory", "name")
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
    const { name } = req.params;
    // Find service by name (exact match, case-insensitive)
    const service = await Service.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, "i") }, 
      isDeleted: false 
    })
      .populate("cetagory")
      .populate("subCetagory");


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

    // Handle image update and old image deletion
    if (req.file) {
      const existingService = await Service.findById(id);
      if (existingService && existingService.image) {
        const oldImagePath = path.join(process.cwd(), existingService.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
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

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
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


