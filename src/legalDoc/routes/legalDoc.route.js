import express from "express";
import { createDoc, getDoc } from "../controller/legalDoc.controller.js";
import { cacheMiddleware } from "../../helper/middlewares/cache.middleware.js";

const router = express.Router();

//localhost:3000/api/v1/legalDoc/create-doc/:content
router.patch("/create-doc/:content", createDoc);

//localhost:3000/api/v1/legalDoc/get-doc/:content
// Cache for 24 hours (86400 seconds) as these docs don't change often
router.get("/get-doc/:content", cacheMiddleware(86400), getDoc);

export default router;

