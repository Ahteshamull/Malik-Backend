import { Router } from "express";

import {
  createBadge,
  getAllBadges,
  singleBadge,
  deleteBadge,
  updateBadge,
} from "../controller/badge.controller.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";

const router = Router();

// localhost:3000/api/v1/badge/create-badge
router.post(
  "/create-badge",
  upload.fields([
    { name: "icon", maxCount: 1 },
  ]),
  errorCheck,
  superAdminMiddleware,
  createBadge,
);

// localhost:3000/api/v1/badge/all-badges
router.get("/all-badges", getAllBadges);

// localhost:3000/api/v1/badge/single-badge/:id
router.get("/single-badge/:id", singleBadge);

// localhost:3000/api/v1/badge/update-badge/:id
router.patch(
  "/update-badge/:id",
  upload.fields([
    { name: "icon", maxCount: 1 },
  ]),
  errorCheck,
  superAdminMiddleware,
  updateBadge
);

// localhost:3000/api/v1/badge/delete-badge/:id
router.delete("/delete-badge/:id", superAdminMiddleware, deleteBadge);

export default router;
