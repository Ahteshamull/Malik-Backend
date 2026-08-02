import express from "express";
import {
  getContent,
  updateContent,
  getProviders,
  addProvider,
  updateProvider,
  deleteProvider,
} from "../controller/esim.controller.js";
import { upload, errorCheck } from "../../helper/middlewares/imageControlMiddleware.js";

const router = express.Router();

// Content Routes
// localhost:4000/api/v1/esim/content
router.get("/content", getContent);
// localhost:4000/api/v1/esim/content
router.put("/content", updateContent); // Assuming admin auth middleware might be applied at top level or frontend checks it

// Provider Routes

// localhost:4000/api/v1/esim/providers
router.get("/providers", getProviders);

// localhost:4000/api/v1/esim/provider
router.post("/provider", upload.single("logo"), errorCheck, addProvider);

// localhost:4000/api/v1/esim/provider/:id
router.put("/provider/:id", upload.single("logo"), errorCheck, updateProvider);

// localhost:4000/api/v1/esim/provider/:id
router.delete("/provider/:id", deleteProvider);

export default router;
