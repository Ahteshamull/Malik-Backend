import express from "express";
import {
  createRetting,
  userPersonalRetting,
  userRetting,
  deleteRetting,
  allRettings,
} from "../controller/review.controller.js";
import { authenticateToken } from "../../helper/middlewares/auth.middleware.js";

const router = express.Router();

// localhost:3000/api/v1/review/create-retting/:collaborationId
router.post("/create-retting/:collaborationId", authenticateToken, createRetting);

// http://localhost:3000/api/v1/review/user-personal
router.get("/user-personal", authenticateToken, userPersonalRetting);

// localhost:3000/api/v1/review/user/:userId
router.get("/user/:userId", authenticateToken, userRetting);

// localhost:3000/api/v1/review/delete/:RettingId
router.delete("/delete/:RettingId", authenticateToken, deleteRetting);

// localhost:3000/api/v1/review/all-rettings
router.get("/all-rettings", authenticateToken, allRettings);


export default router;
