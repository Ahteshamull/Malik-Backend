import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import dbConnect from "./config/database/dbConfig.js";
import router from "./api/index.js";
import cors from "cors";



const app = express();

const server = createServer(app);

const PORT = process.env.PORT || 5000;



app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use(router);

import { getStatusPage } from "./views/statusPage.js";
import { getSystemStats } from "./helper/systemStats.js";

app.get("/", (req, res) => {
  res.send(getStatusPage());
});

app.get("/status-data", (req, res) => {
  res.json(getSystemStats());
});

dbConnect();

server.listen(PORT, () => {
  console.log(`🛜  Server running at ${PORT}`);

});
