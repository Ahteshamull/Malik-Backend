import express from "express";
import analyticsRoutes from "./analytics.route.js";

const router = express.Router();

router.use("/analytics", analyticsRoutes);

export default router;
