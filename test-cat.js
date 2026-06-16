import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = "mongodb+srv://malik:malik@malik.ydbucaz.mongodb.net/malik?appName=malik";

async function test() {
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    
    const categoryId = new mongoose.Types.ObjectId("6a3045a880b6084529bf6b3c");

    // Find services with this category
    const servicesWithCat = await db.collection("services").find({ cetagory: categoryId }).toArray();
    console.log(`Services with category ${categoryId}:`, servicesWithCat.length);

    if (servicesWithCat.length > 0) {
        console.log("First service with this category:", JSON.stringify(servicesWithCat[0], null, 2));
    }

    // Also check if any service has the string version of the category
    const servicesWithStringCat = await db.collection("services").find({ cetagory: "6a3045a880b6084529bf6b3c" }).toArray();
    console.log(`Services with string category "6a3045a880b6084529bf6b3c":`, servicesWithStringCat.length);

    process.exit(0);
}

test().catch(console.error);
