import fs from "fs";
import path from "path";
import axios from "axios";
import jwt from "jsonwebtoken";

import Service from "../schema/service.modal.js";
import Cetagory from "../../cetagory/schema/cetagory.modal.js";
import SubCetagory from "../../subCetagory/schema/cetagory.modal.js";
import { autoAssignBadges } from "../../badges/controller/badge.controller.js";
import Favorite from "../schema/favorite.modal.js";
import { delCacheByPrefix } from "../../helper/cache.js";


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

    // Map common spelling variations to schema fields
    if (serviceData.category && !serviceData.cetagory) {
      serviceData.cetagory = serviceData.category;
    }
    if (serviceData.subcategory && !serviceData.subCetagory) {
      serviceData.subCetagory = serviceData.subcategory;
    }
    if (serviceData.subCategory && !serviceData.subCetagory) {
      serviceData.subCetagory = serviceData.subCategory;
    }

    // Parse reviews if sent as a string (common in form-data)
    if (typeof serviceData.reviews === "string") {
      try {
        serviceData.reviews = JSON.parse(serviceData.reviews);
      } catch (e) {
        console.error("Error parsing reviews:", e);
      }
    }

    // Convert numeric fields from strings if necessary
    ["averageRating", "totalReviews", "responseTimeHours"].forEach((field) => {
      if (typeof serviceData[field] === "string") {
        serviceData[field] = Number(serviceData[field]);
      }
    });

    // Handle image upload if exists
    if (req.files) {
      if (req.files.image)
        serviceData.image = `/uploads/${req.files.image[0].filename}`;
      if (req.files.photoOfVisitor)
        serviceData.photoOfVisitor = req.files.photoOfVisitor.map(
          (file) => `/uploads/${file.filename}`,
        );
      if (req.files.hotelMenu)
        serviceData.hotelMenu = req.files.hotelMenu.map(
          (file) => `/uploads/${file.filename}`,
        );
    }

    // Basic validation check before creating to provide clearer error if needed
    const requiredFields = ["name", "address", "cetagory", "subCetagory"];
    const missingFields = requiredFields.filter((field) => !serviceData[field]);

    if (
      missingFields.length > 0 &&
      !serviceData.image &&
      (!req.files || !req.files.image)
    ) {
      // If image is also missing, add it to the list
      missingFields.push("image");
    }

    const service = await Service.create(serviceData);

    // Automatically check and assign badges to the new service
    await autoAssignBadges(service._id);

    // Populate category and subcategory
    await service.populate("cetagory", "name");
    await service.populate("subCetagory", "name");
    // Also populate newly assigned badges
    await service.populate("badges");
    // Populate offer
    await service.populate("offer");

    // Invalidate all service cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/service`);

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
      searchTerm,
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
    const searchVal = searchTerm || search;
    if (searchVal) {
      filter.name = { $regex: searchVal, $options: "i" };
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

    // Check if user is logged in to personalize favorites
    let userFavorites = [];
    const token =
      req.cookies?.accessToken ||
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN,
        );
        const userId = decoded._id || decoded.id;
        if (userId) {
          const favorites = await Favorite.find({ myId: userId });
          userFavorites = favorites.map((f) => f.favoriteService.toString());
        }
      } catch (err) {
        // Ignore token errors for public list
      }
    }

    const services = await Service.find(filter)
      .populate("cetagory", "name")
      .populate("subCetagory", "name")
      .populate("badges")
      .populate("offer")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    // Add isFavourite property to each service
    const servicesWithFavorites = services.map((service) => {
      const serviceObj = service.toObject();
      serviceObj.isFavourite = userFavorites.includes(service._id.toString());
      return serviceObj;
    });

    return res.status(200).json({
      success: true,
      message: "Services retrieved successfully",
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      data: servicesWithFavorites,
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
      .populate("badges")
      .populate("offer");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check for personalized favorite status
    let isFavourite = false;
    const token =
      req.cookies?.accessToken ||
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN,
        );
        const userId = decoded._id || decoded.id;
        if (userId) {
          const favorite = await Favorite.findOne({
            myId: userId,
            favoriteService: id,
          });
          isFavourite = !!favorite;
        }
      } catch (err) {
        // Ignore token errors
      }
    }

    const serviceObj = service.toObject();
    serviceObj.isFavourite = isFavourite;

    return res.status(200).json({
      success: true,
      data: serviceObj,
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

    // Map common spelling variations to schema fields
    if (updateData.category && !updateData.cetagory) {
      updateData.cetagory = updateData.category;
    }
    if (updateData.subcategory && !updateData.subCetagory) {
      updateData.subCetagory = updateData.subcategory;
    }
    if (updateData.subCategory && !updateData.subCetagory) {
      updateData.subCetagory = updateData.subCategory;
    }

    // Parse reviews if sent as a string
    if (typeof updateData.reviews === "string") {
      try {
        updateData.reviews = JSON.parse(updateData.reviews);
      } catch (e) {
        console.error("Error parsing reviews:", e);
      }
    }

    // Convert numeric fields from strings if necessary
    ["averageRating", "totalReviews", "responseTimeHours"].forEach((field) => {
      if (typeof updateData[field] === "string") {
        updateData[field] = Number(updateData[field]);
      }
    });

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
              if (oldFileName) {
                const oldFilePath = path.join(process.cwd(), oldFileName);
                if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
              }
            });
          }
          // Set new file paths array
          updateData[field] = req.files[field].map(
            (file) => `/uploads/${file.filename}`,
          );
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
      .populate("badges")
      .populate("offer");

    // Invalidate all service cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/service`);

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

    // Invalidate all service cache
    const baseUrl = process.env.BASE_URL || "/api/v1";
    delCacheByPrefix(`${baseUrl}/service`);

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

export const createFavorite = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { serviceId } = req.params;

    if (!userId || !serviceId) {
      return res.status(400).json({
        success: false,
        message:
          "User authentication required and service ID parameter is required",
      });
    }

    // Check if the service exists
    const service = await Service.findOne({ _id: serviceId, isDeleted: false });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      myId: userId,
      favoriteService: serviceId,
    });

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.deleteOne({ _id: existingFavorite._id });
      return res.status(200).json({
        success: true,
        message: "Service removed from favorites successfully",
        isFavorite: false,
      });
    } else {
      // Add to favorites
      const favorite = new Favorite({
        myId: userId,
        favoriteService: serviceId,
      });

      await favorite.save();
      return res.status(201).json({
        success: true,
        message: "Service added to favorites successfully",
        isFavorite: true,
        data: favorite,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling favorite",
      error: error.message,
    });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const favorites = await Favorite.find({ myId: userId })
      .populate({
        path: "favoriteService",
        populate: [
          { path: "cetagory", select: "name" },
          { path: "subCetagory", select: "name" },
          { path: "badges" },
          { path: "offer" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Favorites retrieved successfully",
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching favorites",
      error: error.message,
    });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let favorite = await Favorite.findOne({ _id: id, myId: userId });

    if (!favorite) {
      favorite = await Favorite.findOne({ favoriteService: id, myId: userId });
    }

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await Favorite.findByIdAndDelete(favorite._id);

    return res.status(200).json({
      success: true,
      message: "Service removed from favorites successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing from favorites",
      error: error.message,
    });
  }
};

export const weeklyFeaturedServices = async (req, res) => {
  try {
    const categories = await Cetagory.find();
    let allFeaturedServices = [];

    for (const category of categories) {
      if (allFeaturedServices.length >= 6) break;

      const services = await Service.find({
        cetagory: category._id,
        isDeleted: false,
      })
        .populate("cetagory", "name")
        .populate("subCetagory", "name")
        .populate("badges")
        .populate("offer")
        .sort({ updatedAt: -1 })
        .limit(2);

      allFeaturedServices = [...allFeaturedServices, ...services];
    }

    // Limit to exactly 6 just in case more were added
    const data = allFeaturedServices.slice(0, 6);

    return res.status(200).json({
      success: true,
      message: "Weekly featured services retrieved successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching weekly featured services",
      error: error.message,
    });
  }
};
