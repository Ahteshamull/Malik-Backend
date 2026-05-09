import { Router } from "express";
import {
  createOffer,
  allOffers,
  singleOffer,
  updateOffer,
  deleteOffer,
} from "../controller/offer.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = Router();

// localhost:3000/api/v1/offer/create-offer
router.post(
  "/create-offer",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  createOffer,
);

// localhost:3000/api/v1/offer/all-offers
router.get("/all-offers", allOffers);

// localhost:3000/api/v1/offer/single-offer/:id
router.get("/single-offer/:id", singleOffer);

// localhost:3000/api/v1/offer/update-offer/:id
router.patch(
  "/update-offer/:id",
  upload.single("image"),
  errorCheck,
  superAdminMiddleware,
  updateOffer,
);

// localhost:3000/api/v1/offer/delete-offer/:id
router.delete("/delete-offer/:id", superAdminMiddleware, deleteOffer);

export default router;
