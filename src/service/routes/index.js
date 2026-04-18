import express from "express";

import service from "./service.routes.js";

const router = express.Router();

// localhost:3000/api/v1/service/
router.use("/service", service);

export default router;
