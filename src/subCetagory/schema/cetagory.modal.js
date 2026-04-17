import mongoose from "mongoose";
import Cetagory from "../../cetagory/schema/cetagory.modal.js";


const subCetagorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cetagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cetagory",
      required: true,
    },
    tags: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },
  },
  { timestamps: true },
);

const SubCetagory = mongoose.model("SubCetagory", subCetagorySchema);

export default SubCetagory;
