import Vendor from "../schema/vendor.modal.js";
import fs from "fs";
import path from "path";

export const createVendor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      serviceType,
      serviceDescription,
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }

    // Get image file path if uploaded
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const vendor = await Vendor.create({
      name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      serviceType,
      serviceDescription,
      image: imagePath,
    });

    res.status(201).json({
      success: true,
      message: `${vendor.name} created successfully`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Vendor.countDocuments();
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Vendors retrieved successfully",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const singleVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    res.status(200).json({
      success: true,
      message: `${vendor.name} retrieved successfully`,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (req.file) {
      const newImagePath = `/uploads/${req.file.filename}`;

      // Delete old image file if it exists
      if (vendor.image && vendor.image !== newImagePath) {
        const oldImagePath = path.join(process.cwd(), vendor.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.image = newImagePath;
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `${updatedVendor.name} updated successfully`,
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }
    res.status(200).json({
      success: true,
      message: `${vendor.name} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};