import express from "express";
import {
  createDoc,
  getDoc,
  getAllDocs,
  createPolicy,
  updatePolicy,
  deletePolicy,
  reorderPolicies,
  togglePublishPolicy,
} from "../controller/legalDoc.controller.js";
import { cacheMiddleware } from "../../helper/middlewares/cache.middleware.js";

const router = express.Router();

// Public App APIs
router.get("/all-docs", cacheMiddleware(3600), getAllDocs);
router.get("/get-all-docs", cacheMiddleware(3600), getAllDocs);
router.get("/get-doc/:content", cacheMiddleware(86400), getDoc);

// Admin Dashboard APIs
router.post("/create-policy", createPolicy);
router.patch("/update-policy/:id", updatePolicy);
router.delete("/delete-policy/:id", deletePolicy);
router.patch("/reorder", reorderPolicies);
router.patch("/toggle-publish/:id", togglePublishPolicy);

// Legacy backward compatibility
router.patch("/create-doc/:content", createDoc);

export default router;