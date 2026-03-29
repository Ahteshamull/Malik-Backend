import mongoose from "mongoose";
const { Schema } = mongoose;

const listingSchema = new Schema({}, { strict: false, timestamps: true });
export const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
export default Listing;
