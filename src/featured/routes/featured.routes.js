import { Router } from "express";
import {
  getFeaturedSections,
  getFeaturedSectionByKey,
  updateFeaturedSection,
} from "../controller/featured.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";

const router = Router();

// GET all featured sections (publicly accessible)
// GET /api/v1/featured/all-sections
router.get("/all-sections", getFeaturedSections);

// GET a single featured section by key (publicly accessible)
// GET /api/v1/featured/section/:sectionKey
router.get("/section/:sectionKey", getFeaturedSectionByKey);

// PUT to update a featured section configuration (admin only)
// PUT /api/v1/featured/update/:sectionKey
router.put("/update/:sectionKey", superAdminMiddleware, updateFeaturedSection);

export default router;
