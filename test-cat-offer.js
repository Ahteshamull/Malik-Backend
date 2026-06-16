import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = "mongodb+srv://malik:malik@malik.ydbucaz.mongodb.net/malik?appName=malik";

async function test() {
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    const categoryId = new mongoose.Types.ObjectId("6a3045a880b6084529bf6b3c");

    const servicesWithCatAndOffer = await db.collection("services").find({ 
        cetagory: categoryId,
        offer: { $exists: true, $ne: null }
    }).toArray();
    
    console.log(`Services with category ${categoryId} and an offer:`, servicesWithCatAndOffer.length);
    
    if (servicesWithCatAndOffer.length > 0) {
        console.log(JSON.stringify(servicesWithCatAndOffer, null, 2));
    } else {
        // Let's print the second service to see if it has an offer
        const all = await db.collection("services").find({ cetagory: categoryId }).toArray();
        if (all.length > 1) {
            console.log("Second service:", JSON.stringify(all[1], null, 2));
        }
    }

    process.exit(0);
}

test().catch(console.error);
