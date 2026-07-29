import { Router } from "express";
import {
  createOffer,
  allOffers,
  singleOffer,
  updateOffer,
  deleteOffer,
  getCatagoryOffers,
  getOffersByOfferCetagory,
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
  upload.any(),
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
  upload.any(),
  errorCheck,
  superAdminMiddleware,
  updateOffer,
);

// localhost:3000/api/v1/offer/delete-offer/:id
router.delete("/delete-offer/:id", superAdminMiddleware, deleteOffer);

//localhost:3000/api/v1/offer/get-cetagory-offers/:id
router.get("/get-cetagory-offers/:id", getCatagoryOffers);

// localhost:3000/api/v1/offer/get-offer-by-id/:id
router.get("/get-offer-by-id/:id", singleOffer);

router.get("/get-offer-cetagory", getOffersByOfferCetagory);
router.get("/get-offer-cetagory/:categoryName", getOffersByOfferCetagory);

export default router;
