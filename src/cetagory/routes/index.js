import { Router } from "express";

import express from "express";

import cetagory from "./cetagory.routes.js";

const router = express.Router();

// localhost:3000/api/v1/cetagory/
router.use("/cetagory", cetagory);

export default router;