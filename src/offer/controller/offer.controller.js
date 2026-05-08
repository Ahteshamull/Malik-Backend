import Offer from "../schema/offer.modal.js";
import fs from "fs";
import path from "path";

export const createOffer = async (req, res) => {
    try {
        const { title, description, discount, startTime, endTime } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
        
        const offer = new Offer({
            title,
            description,
            image,
            discount,
            startTime,
            endTime,
        });
        
        await offer.save();
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
        const offers = await Offer.find().sort({ createdAt: -1 });
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
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: "Offer not found" });
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
            return res.status(404).json({ success: false, message: "Offer not found" });
        }

        const updateData = { ...req.body };

        if (req.file) {
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
            { new: true }
        );

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
            return res.status(404).json({ success: false, message: "Offer not found" });
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
