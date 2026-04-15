import express from "express";

import vendor from "./vendor.routes.js";

const router = express.Router();

// localhost:3000/api/v1/vendor/
router.use("/vendor", vendor);

export default router;
