import express from "express";
import {
  createService,
  allServices,
  singleService,
  updateService,
  deleteService,
} from "../controller/service.controller.js";
import superAdminMiddleware from "../../helper/middlewares/superAdminMiddleware.js";
import {
  upload,
  errorCheck,
} from "../../helper/middlewares/imageControlMiddleware.js";

const router = express.Router();

//localhost:3000/api/v1/service/create-service
// Create a new service
router.post(
  "/create-service",
  superAdminMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "photoOfVisitor", maxCount: 10 }, { name: "hotelMenu", maxCount: 10 }]),
  errorCheck,
  createService,
);

//localhost:3000/api/v1/service/all-services
// ?search=Dental	Returns all services with "Dental" in their name.
// ?cetagory=Resturant	Returns all services belonging to "Resturant" category.
// ?offer=true&cetagory=Resturant	Returns services in "Resturant" category that have an offer.
// ?offerType=limited	Returns services with a specific offer type.
router.get("/all-services", allServices);



//localhost:3000/api/v1/service/single-service/:id
// Get a single service
router.get("/single-service/:id", singleService);


//localhost:3000/api/v1/service/update-service/:id
// Update a service
router.patch(
  "/update-service/:id",
  superAdminMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }, { name: "photoOfVisitor", maxCount: 10 }, { name: "hotelMenu", maxCount: 10 }]),
  errorCheck,
  updateService,
);

//localhost:3000/api/v1/service/delete-service/:id
// Soft delete a service
router.delete("/delete-service/:id", superAdminMiddleware, deleteService);

export default router;
