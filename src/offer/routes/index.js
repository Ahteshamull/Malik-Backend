import express from "express";
import offer from "./offer.routes.js";

const router = express.Router();

// localhost:3000/api/v1/offer/
router.use("/offer", offer);

export default router;
