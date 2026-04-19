import { Router } from "express";

import { createBadge } from "../controller/badge.controller.js";
import { upload, errorCheck } from "../../helper/middlewares/imageControlMiddleware.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";

const router = Router();

// localhost:3000/api/v1/badge/create-badge
router.post(
  "/create-badge",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "criteriaList", maxCount: 10 },
  ]),
  errorCheck,
  superAdminMiddleware,
  createBadge,
);

export default router;
