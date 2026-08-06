import express from "express";
import featured from "./featured.routes.js";

const router = express.Router();

// Register featured routes under prefix /featured
router.use("/featured", featured);

export default router;
