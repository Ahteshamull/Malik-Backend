import Offer from "../schema/offer.modal.js";
import Service from "../../service/schema/service.modal.js";
import fs from "fs";
import path from "path";

export const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      cetagory,
      discount,
      startTime,
      endTime,
      promocode,
      serviceLink,
      offerCetagory,
      Refinements
    } = req.body;

    let image = req.body.image;
    let parsedRefinements = [];

    if (typeof Refinements === "string") {
      try {
        parsedRefinements = JSON.parse(Refinements);
      } catch (e) {
        console.error("Error parsing refinements");
      }
    } else if (Array.isArray(Refinements)) {
      parsedRefinements = Refinements;
    }

    if (req.files && req.files.length > 0) {
      // Find main image
      const mainImageFile = req.files.find(f => f.fieldname === 'image');
      if (mainImageFile) {
        image = `/uploads/${mainImageFile.filename}`;
      }

      // Map refinement images
      req.files.forEach(file => {
        if (file.fieldname.startsWith('refinement_image_')) {
          const index = parseInt(file.fieldname.split('_')[2]);
          if (!isNaN(index) && parsedRefinements[index]) {
             if (!parsedRefinements[index].images) {
                 parsedRefinements[index].images = [];
             }
             parsedRefinements[index].images.push(`/uploads/${file.filename}`);
          }
        }
      });
    } else if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const offer = new Offer({
      title,
      description,
      cetagory,
      image,
      discount,
      startTime,
      endTime,
      promocode,
      serviceLink,
      offerCetagory,
      Refinements: parsedRefinements
    });

    await offer.save();
    await offer.populate("cetagory", "name"); // populate the category name
    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create offer",
      error: error.message,
    });
  }
};

export const allOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("cetagory", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Offers retrieved successfully",
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve offers",
      error: error.message,
    });
  }
};

export const singleOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "cetagory",
      "name",
    );
    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Offer retrieved successfully",
      data: offer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve offer",
      error: error.message,
    });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    const updateData = { ...req.body };

    let parsedRefinements = [];
    if (typeof req.body.Refinements === "string") {
      try {
        parsedRefinements = JSON.parse(req.body.Refinements);
      } catch (e) {
        console.error("Error parsing refinements");
      }
    } else if (Array.isArray(req.body.Refinements)) {
      parsedRefinements = req.body.Refinements;
    }

    if (parsedRefinements.length > 0 || req.body.Refinements) {
       updateData.Refinements = parsedRefinements;
    }

    if (req.files && req.files.length > 0) {
      const mainImageFile = req.files.find(f => f.fieldname === 'image');
      if (mainImageFile) {
        const newImagePath = `/uploads/${mainImageFile.filename}`;
        // Delete old image file if it exists
        if (offer.image && offer.image.startsWith("/uploads/")) {
          const oldImagePath = path.join(process.cwd(), offer.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.image = newImagePath;
      }

      // Map refinement images
      req.files.forEach(file => {
        if (file.fieldname.startsWith('refinement_image_')) {
          const index = parseInt(file.fieldname.split('_')[2]);
          if (!isNaN(index) && updateData.Refinements && updateData.Refinements[index]) {
             if (!updateData.Refinements[index].images) {
                 updateData.Refinements[index].images = [];
             }
             updateData.Refinements[index].images.push(`/uploads/${file.filename}`);
          }
        }
      });
    } else if (req.file) {
      const newImagePath = `/uploads/${req.file.filename}`;
      // Delete old image file if it exists
      if (offer.image && offer.image.startsWith("/uploads/")) {
        const oldImagePath = path.join(process.cwd(), offer.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = newImagePath;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).populate("cetagory", "name");

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: updatedOffer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update offer",
      error: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    // Delete image file if it exists
    if (offer.image && offer.image.startsWith("/uploads/")) {
      const imagePath = path.join(process.cwd(), offer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      data: offer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete offer",
      error: error.message,
    });
  }
};

export const getCatagoryOffers = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find services in this category that have an offer attached
    const services = await Service.find({
      cetagory: categoryId,
      isDeleted: false,
      offer: { $exists: true, $ne: null },
    })
      .populate("offer")
      .populate("cetagory", "name")
      .populate("subCetagory", "name");

    return res.status(200).json({
      success: true,
      message: "Category-wise offer services retrieved successfully",
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: "Failed to retrieve category-wise offer services",
      error: error.message,
    });
  }
};

export const getOffersByOfferCetagory = async (req, res) => {
  try {
    let categoryName = req.params.categoryName;

    if (!categoryName) {
      // Group all offers
      const offers = await Offer.find({ status: "active" }).populate(
        "cetagory",
        "name",
      );
      const groupedData = { Hotel: [], Transport: [], Others: [] };

      offers.forEach((offer) => {
        const category = offer.offerCetagory || "Others";
        if (groupedData[category]) {
          groupedData[category].push(offer);
        } else {
          groupedData[category] = [offer];
        }
      });

      return res.status(200).json({
        success: true,
        message: "Offers grouped by offer category retrieved successfully",
        data: groupedData,
      });
    }

    // Capitalize first letter to match Enum ("Hotel", "Transport", "Others")
    categoryName =
      categoryName.charAt(0).toUpperCase() +
      categoryName.slice(1).toLowerCase();

    const offers = await Offer.find({
      status: "active",
      offerCetagory: categoryName,
    }).populate("cetagory", "name");

    return res.status(200).json({
      success: true,
      message: `Offers for category ${categoryName} retrieved successfully`,
      data: offers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve offers",
      error: error.message,
    });
  }
};
