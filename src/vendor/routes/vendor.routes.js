import { Router } from "express";

import {
  createVendor,
  allVendors,
  singleVendor,
  updateVendor,
  deleteVendor,
} from "../controller/vendor.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = Router();

// localhost:3000/api/v1/vendor/create-vendor
router.post(
  "/create-vendor",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  createVendor,
);

// localhost:3000/api/v1/vendor/all-vendors
router.get("/all-vendors", allVendors);

// localhost:3000/api/v1/vendor/single-vendor/:id
router.get("/single-vendor/:id", singleVendor);

// localhost:3000/api/v1/vendor/update-vendor/:id
router.patch(
  "/update-vendor/:id",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  updateVendor,
);

// localhost:3000/api/v1/vendor/delete-vendor/:id
router.delete("/delete-vendor/:id", superAdminMiddleware, deleteVendor);

export default router;
