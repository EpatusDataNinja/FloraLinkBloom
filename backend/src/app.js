import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';

import router from "./routers/index.js";
import notificationRouter from "./routers/notificationRouter.js";
import productRouter from "./routers/ProductRouter.js";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false
};

app.use(cors(corsOptions));

// For handling preflight requests
app.options('*', cors(corsOptions));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make the uploads directory static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/v1", router);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/product", productRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

export default app;
