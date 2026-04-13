export const createVendor = async (req, res) => {
    try {
        const { name, email, phone, address, city, state, zip, country, serviceType, serviceDescription } = req.body;
        const vendor = await Vendor.create({ name, email, phone, address, city, state, zip, country, serviceType, serviceDescription });
        res.status(201).json({ success: true, vendor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}