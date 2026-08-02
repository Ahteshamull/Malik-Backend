import express from "express";
import auth from "../auth/routes/index.js";
import user from "../users/routes/index.js";
import admin from "../admin/routes/index.js";
import legalDoc from "../legalDoc/routes/index.js";
import contact from "../contact/routes/index.js";
import notification from "../notification/routes/index.js";
import search from "../search/routes/index.js";
import dashboard from "../dashboard/routes/index.js";
import review from "../review/routes/index.js";
import faq from "../faq/routes/index.js";
import report from "../report/routes/index.js";
import vendor from "../vendor/routes/index.js";
import cetagory from "../cetagory/routes/index.js";
import subCetagory from "../subCetagory/routes/index.js";
import service from "../service/routes/index.js";
import badge from "../badges/routes/index.js";
import offer from "../offer/routes/index.js";
import analytics from "../analytics/routes/index.js";
import esim from "../esim/routes/index.js";
import notFound from "../helper/middlewares/notFound.js";


const router = express.Router();
const baseurl = process.env.BASE_URL || "/api/v1";

router.use(baseurl, auth);
router.use(baseurl, user);
router.use(baseurl, admin);
router.use(baseurl, legalDoc);
router.use(baseurl, contact);
router.use(baseurl, notification);
router.use(baseurl, search);
router.use(baseurl, dashboard);
router.use(baseurl, review);
router.use(baseurl, faq);
router.use(baseurl, report);
router.use(baseurl, vendor);
router.use(baseurl, cetagory);
router.use(baseurl, subCetagory);
router.use(baseurl, service);
router.use(baseurl, badge);
router.use(baseurl, offer); 
router.use(baseurl, analytics); 
router.use(baseurl, esim);

// 404 handler
router.use(baseurl, notFound);

export default router;
