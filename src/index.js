import dotenv from "dotenv";

dotenv.config();

import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import dbConnect from "./config/database/dbConfig.js";
import router from "./api/index.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



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

// এই লাইনটি uploads ফোল্ডারকে পাবলিকলি অ্যাক্সেস করার অনুমতি দেয়
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
