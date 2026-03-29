import mongoose from "mongoose";
const { Schema } = mongoose;

const dealSchema = new Schema({}, { strict: false, timestamps: true });
const Deal = mongoose.models.Deal || mongoose.model("Deal", dealSchema);
export default Deal;
