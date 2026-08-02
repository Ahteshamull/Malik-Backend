import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      trim: true,
    },
    searchType: {
      type: String,
      default: "all",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const SearchLog = mongoose.model("SearchLog", searchLogSchema);

export default SearchLog;
