import express from "express";
import {
  createService,
  allServices,
  singleService,
  updateService,
  deleteService,
  getFavorites,
  removeFromFavorites,
  createFavorite,
  weeklyFeaturedServices,
  offerServices,
  allServicesWithCetagory,
  toggleVisitedService,
  getMyVisitedServices,
} from "../controller/service.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import { authenticateToken } from "../../helper/middlewares/auth.middleware.js";
import userMiddleware from "../../helper/middlewares/user.middleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

import { cacheMiddleware } from "../../helper/middlewares/cache.middleware.js";

const router = express.Router();

//localhost:3000/api/v1/service/create-service
// Create a new service
router.post(
  "/create-service",
  superAdminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "photoOfVisitor", maxCount: 10 },
    { name: "hotelMenu", maxCount: 10 },
  ]),
  errorCheck,
  createService,
);

//localhost:3000/api/v1/service/all-services
// ?search=Dental	Returns all services with "Dental" in their name.
// ?cetagory=Resturant	Returns all services belonging to "Resturant" category.
// ?offer=true&cetagory=Resturant	Returns services in "Resturant" category that have an offer.
// ?offerType=limited	Returns services with a specific offer type.
router.get("/all-services", cacheMiddleware(3600), allServices);


router.get("/all-services-with-cetagory/:categoryId", cacheMiddleware(3600), allServicesWithCetagory);

//localhost:3000/api/v1/service/single-service/:id
// Get a single service
router.get(
  "/single-service/:id",
  userMiddleware,
  cacheMiddleware(3600),
  singleService,
);

//localhost:3000/api/v1/service/update-service/:id
// Update a service
router.patch(
  "/update-service/:id",
  superAdminMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "photoOfVisitor", maxCount: 10 },
    { name: "hotelMenu", maxCount: 10 },
  ]),
  errorCheck,
  updateService,
);

//localhost:3000/api/v1/service/delete-service/:id
// Soft delete a service
router.delete("/delete-service/:id", superAdminMiddleware, deleteService);

//localhost:3000/api/v1/service/add-to-favorites/:id
// Add a service to favorites
router.post("/add-to-favorites/:serviceId", userMiddleware, createFavorite);

//localhost:3000/api/v1/service/get-favorites
// Get all favorites
router.get(
  "/get-favorites",
  userMiddleware,
  cacheMiddleware(3600),
  getFavorites,
);

//localhost:3000/api/v1/service/remove-from-favorites/:id
// Remove a service from favorites
router.delete(
  "/remove-from-favorites/:id",
  userMiddleware,
  removeFromFavorites,
);
//localhost:3000/api/v1/service/add-visited/:id
// Add or remove a service from visited list (toggle)
router.post("/add-visited/:serviceId", userMiddleware, toggleVisitedService);

//localhost:3000/api/v1/service/my-visited-services
// Get all visited services
router.get("/my-visited-services", userMiddleware, getMyVisitedServices);

//localhost:3000/api/v1/service/weekly-featured-services
// Get weekly featured services
router.get(
  "/weekly-featured-services",
  cacheMiddleware(3600),
  weeklyFeaturedServices,
);

router.get("/offer/services", cacheMiddleware(3600), offerServices);
export default router;
