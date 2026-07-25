import mongoose from "mongoose";

import dns from 'node:dns/promises';

const dbConnect = async () => {
  try {
    // Use Cloudflare or Google DNS to fix querySrv ECONNREFUSED error
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📈 Database Connected...");
  } catch (err) {
    console.log(err);
  }
};

export default dbConnect;
