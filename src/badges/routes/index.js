import { Router } from "express";

import express from "express";

import badge from "./badge.route.js";

const router = express.Router();

// localhost:3000/api/v1/badge/
router.use("/badge", badge);

export default router;
