import express from "express";
import {
  createRetting,
  allRettings,
  singleRetting,
  getReetingByserviceId,
  deleteRetting,
  reportAReview,
} from "../controller/review.controller.js";
import {
  authenticateToken,
  requireSuperAdminOrAdminRole,
} from "../../helper/middlewares/auth.middleware.js";

const router = express.Router();

// localhost:4000/api/v1/review/create-retting/:serviceId
router.post("/create-retting/:serviceId", authenticateToken, createRetting);

// localhost:4000/api/v1/review/all-rettings
router.get("/all-rettings", allRettings);

// localhost:4000/api/v1/review/single-retting/:RettingId
router.get("/single-retting/:RettingId", singleRetting);

// localhost:4000/api/v1/review/get-retting-by-service-id/:serviceId
router.get("/get-retting-by-service-id/:serviceId", getReetingByserviceId);

// localhost:4000/api/v1/review/delete-retting/:RettingId
router.delete(
  "/delete-retting/:RettingId",
  authenticateToken,
  requireSuperAdminOrAdminRole,
  deleteRetting,
);

// localhost:4000/api/v1/review/report-review/:reviewId
router.post("/report-review/:reviewId", authenticateToken, reportAReview);

export default router;
