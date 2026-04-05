import express from "express";
import { createReport } from "../controller/report.controller.js";
import { authenticateToken } from "../../helper/middlewares/auth.middleware.js";

const router = express.Router();

// localhost:3000/api/v1/report/create-report
router.post("/create-report", authenticateToken, createReport);

export default router;