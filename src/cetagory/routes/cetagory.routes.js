import { Router } from "express";
import {
  createCetagory,
  allCetagory,
  singleCetagory,
  updateCetagory,
  deleteCetagory,
} from "../controller/cetagory.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = Router();
//localhost:3000/api/v1/cetagory/create-cetagory
router.post(
  "/create-cetagory",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  createCetagory,
);
//localhost:3000/api/v1/cetagory/all-cetagory
router.get("/all-cetagory", allCetagory);
//localhost:3000/api/v1/cetagory/single-cetagory/:id
router.get("/single-cetagory/:id", singleCetagory);
//localhost:3000/api/v1/cetagory/update-cetagory/:id
router.patch(
  "/update-cetagory/:id",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  updateCetagory,
);
//localhost:3000/api/v1/cetagory/delete-cetagory/:id
router.delete("/delete-cetagory/:id", superAdminMiddleware, deleteCetagory);

export default router;
