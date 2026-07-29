import mongoose from "mongoose";

const visitedSchema = new mongoose.Schema(
  {
    myId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    visitedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  { timestamps: true }
);

const Visited = mongoose.model("Visited", visitedSchema);

export default Visited;
