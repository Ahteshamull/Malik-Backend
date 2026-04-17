import { Router } from "express";
import {
  createSubCetagory,
  allSubCetagory,
  singleSubCetagory,
  updateSubCetagory,
  deleteSubCetagory,
} from "../controller/cetagory.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = Router();
//localhost:3000/api/v1/sub-cetagory/create-sub-cetagory
router.post(
  "/create-sub-cetagory",
  upload.array("image", 10),
  errorCheck,
  superAdminMiddleware,
  createSubCetagory,
);
//localhost:3000/api/v1/sub-cetagory/all-sub-cetagory
router.get("/all-sub-cetagory", allSubCetagory);
//localhost:3000/api/v1/sub-cetagory/single-sub-cetagory/:id
router.get("/single-sub-cetagory/:id", singleSubCetagory);
//localhost:3000/api/v1/sub-cetagory/update-sub-cetagory/:id
router.patch(
  "/update-sub-cetagory/:id",
  upload.array("image", 10),
  errorCheck,
  superAdminMiddleware,
  updateSubCetagory,
);
//localhost:3000/api/v1/sub-cetagory/delete-sub-cetagory/:id
router.delete("/delete-sub-cetagory/:id", superAdminMiddleware, deleteSubCetagory);


export default router;
