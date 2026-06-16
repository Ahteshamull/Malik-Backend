import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = "mongodb+srv://malik:malik@malik.ydbucaz.mongodb.net/malik?appName=malik";

async function test() {
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    
    // Find latest service
    const latestService = await db.collection("services").find().sort({ createdAt: -1 }).limit(1).toArray();
    console.log("Latest Service:", JSON.stringify(latestService, null, 2));

    // Find services with an offer
    const offerServices = await db.collection("services").find({ offer: { $exists: true, $ne: null } }).sort({ createdAt: -1 }).limit(5).toArray();
    console.log("Services with offer:", JSON.stringify(offerServices, null, 2));

    process.exit(0);
}

test().catch(console.error);
