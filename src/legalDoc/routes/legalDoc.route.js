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
import { upload } from "../../helper/middlewares/imageControlMiddleware.js";

const router = express.Router();

// Public App APIs
router.get("/all-docs", cacheMiddleware(3600), getAllDocs);
router.get("/get-all-docs", cacheMiddleware(3600), getAllDocs);
router.get("/get-doc/:content", cacheMiddleware(86400), getDoc);

// Admin Dashboard APIs (with image upload support)
router.post("/create-policy", upload.single("image"), createPolicy);
router.patch("/update-policy/:id", upload.single("image"), updatePolicy);
router.delete("/delete-policy/:id", deletePolicy);
router.patch("/reorder", reorderPolicies);
router.patch("/toggle-publish/:id", togglePublishPolicy);

// Legacy backward compatibility
router.patch("/create-doc/:content", upload.single("image"), createDoc);

export default router;