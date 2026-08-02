import express from "express";
import esimRoutes from "./esim.route.js";

const router = express.Router();

router.use("/esim", esimRoutes);

export default router;
