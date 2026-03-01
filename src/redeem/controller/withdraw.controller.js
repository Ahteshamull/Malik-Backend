import userModel from "../../auth/schema/auth.modal.js";
import Notification from "../../notification/schema/notification.modal.js";

export const withdrawRedeemStars = async (req, res) => {
  return res.status(503).json({
    message: "Withdraw functionality is currently disabled",
    reason: "Collaboration features have been removed",
  });
};
