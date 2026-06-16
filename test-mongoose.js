import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cetagory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cetagory",
      required: true,
    }
  }
);
const Service = mongoose.model("TestService", serviceSchema);

async function run() {
    try {
        const s = new Service({ name: "Test", cetagory: "null" });
        await s.validate();
        console.log("Validation passed:", s);
    } catch (e) {
        console.log("Error:", e.message);
    }
    
    try {
        const s = new Service({ name: "Test", cetagory: null });
        await s.validate();
        console.log("Validation passed:", s);
    } catch (e) {
        console.log("Error:", e.message);
    }

    try {
        const s = new Service({ name: "Test" });
        await s.validate();
        console.log("Validation passed:", s);
    } catch (e) {
        console.log("Error:", e.message);
    }
}
run();
