import mongoose from "mongoose";
import Report from "../schema/report.modal.js";
import userModel from "../../auth/schema/auth.modal.js";
import sendOtp from "../../helper/helpers/sendOtp.js";

/* ======================================================
   Create Report
====================================================== */
export const createReport = async (req, res) => {
  try {
    // Reporter ID from JWT token
    const reporterId = req.user?.id || req.user?._id;

    const { issueType, issueTitle, description } = req.body;

    /* ===== Auth Check ===== */
    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    /* ===== Required Fields Check ===== */
    if (!issueType || !issueTitle || !description) {
      return res.status(400).json({
        success: false,
        message: "issueType, issueTitle and description are required",
      });
    }

    /* ===== Check Reporter Exists ===== */
    const reporter = await userModel.findById(reporterId);

    if (!reporter) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ===== Create Report ===== */
    const report = await Report.create({
      userId: reporterId,
      issueType,
      issueTitle,
      description,
    });

    /* ===== Populate Reporter ===== */
    const populatedReport = await Report.findById(report._id).populate(
      "userId",
      "userName email role"
    );

    // ✅ Send email notification to admin (non-blocking)
    sendOtp
      .sendReportNotification({
        userName: reporter.userName || "User",
        userEmail: reporter.email,
        issueType,
        issueTitle,
        description,
      })
      .catch((err) => console.error("Report email notification failed:", err));

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      data: populatedReport,
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getallReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { searchTerm } = req.query;

    const filter = {};
    if (searchTerm) {
      filter.issueTitle = { $regex: searchTerm, $options: "i" };
    }

    const reports = await Report.find(filter)
      .populate("userId", "userName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);
    const pendingReports = await Report.countDocuments({
      status: "pending",
      ...filter,
    });
    const completedReports = await Report.countDocuments({
      status: "completed",
      ...filter,
    });

    return res.status(200).json({
      success: true,
      message: "Reports fetched successfully",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        pendingReports,
        completedReports,
      },
      data: reports,
    });
  } catch (error) {
    console.error("Get all reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
