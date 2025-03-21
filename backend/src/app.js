import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path';

import router from "./routers/index.js";
import notificationRouter from "./routers/notificationRouter.js";
import productRouter from "./routers/ProductRouter.js";
import messagesRouter from "./routers/messagesRouter.js";
import './cron/reportUpdates.js';
import './events/orderEvents.js';

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
app.use("/api/v1/message", messagesRouter);

// Add this before your error handling middleware
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (data) {
    console.log(`Response for ${req.method} ${req.url}:`, data);
    oldSend.apply(res, arguments);
  };
  next();
});

// Update your error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    method: req.method,
    url: req.url,
    error: err.stack
  });
  
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export the Express app
export default app;
