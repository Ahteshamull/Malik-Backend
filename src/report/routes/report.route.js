import express from "express";
import {
  createReport,
  getallReports,
  deleteReport,
} from "../controller/report.controller.js";
import { authenticateToken } from "../../helper/middlewares/auth.middleware.js";

const router = express.Router();

// localhost:3000/api/v1/report/create-report
router.post("/create-report", authenticateToken, createReport);

//localhost:3000/api/v1/report/all-reports
router.get("/all-reports", authenticateToken, getallReports);

//localhost:3000/api/v1/report/delete-report/:id
router.delete("/delete-report/:id", authenticateToken, deleteReport);

export default router;
