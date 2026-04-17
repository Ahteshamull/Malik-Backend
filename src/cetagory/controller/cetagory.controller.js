import Cetagory from "../schema/cetagory.modal.js";

export const createCetagory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        const cetagory = await Cetagory.create({ name, description, image });
        res.status(201).json({ success: true, message: "Cetagory created successfully", data: cetagory });
    } catch (error) {
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
        res.status(200).json({ success: true, message: "Cetagory retrieved successfully", data: cetagory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const singleCetagory = async (req, res) => {
    try {
        const cetagory = await Cetagory.findById(req.params.id);
        if (!cetagory) {
            return res.status(404).json({ success: false, message: "Cetagory not found" });
        }
        res.status(200).json({ success: true, message: "Cetagory retrieved successfully", data: cetagory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCetagory = async (req, res) => {
    try {
        const cetagory = await Cetagory.findById(req.params.id);
        if (!cetagory) {
            return res.status(404).json({ success: false, message: "Cetagory not found" });
        }
        const updatedCetagory = await Cetagory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Cetagory updated successfully", data: updatedCetagory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCetagory = async (req, res) => {
    try {
        const cetagory = await Cetagory.findByIdAndDelete(req.params.id);
        if (!cetagory) {
            return res.status(404).json({ success: false, message: "Cetagory not found" });
        }
        res.status(200).json({ success: true, message: "Cetagory deleted successfully", data: cetagory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};