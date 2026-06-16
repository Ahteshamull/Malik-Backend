import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./src/service/schema/service.modal.js";

dotenv.config();

const uri = "mongodb+srv://malik:malik@malik.ydbucaz.mongodb.net/malik?appName=malik";

async function test() {
    await mongoose.connect(uri);
    
    // get a valid category
    const Cetagory = mongoose.model("Cetagory");
    const cat = await Cetagory.findOne();
    const SubCetagory = mongoose.model("SubCetagory");
    const subCat = await SubCetagory.findOne();
    const Offer = mongoose.model("Offer");
    const offer = await Offer.findOne();
    
    console.log("Using category:", cat._id);
    console.log("Using offer:", offer._id);

    const s = await Service.create({
        name: "Test API Service",
        address: "Test address",
        cetagory: cat._id,
        subCetagory: subCat._id,
        offer: offer._id,
        image: "test.jpg"
    });
    
    console.log("Created service:", s._id);

    const services = await Service.find({ 
        cetagory: cat._id,
        isDeleted: false,
        offer: { $exists: true, $ne: null } 
    }).populate("offer");

    console.log("Found services by category:", services.length);

    process.exit(0);
}

test().catch(console.error);
