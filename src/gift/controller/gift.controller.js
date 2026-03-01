import mongoose from "mongoose";
import Gift from "../schema/gift.modal.js";
import userModel from "../../auth/schema/auth.modal.js";

export const createRedeem = async (req, res) => {
  return res.status(503).json({
    message: "Gift functionality is currently disabled",
    reason: "Collaboration features have been removed",
  });
};
