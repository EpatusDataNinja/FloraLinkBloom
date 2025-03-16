import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import * as ReportsController from "../controllers/ReportsController.js";

const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);

// Basic report routes
router.get("/sales", ReportsController.generateSalesReport);
router.get("/products", ReportsController.generateProductPerformanceReport);
router.get("/seasonal", ReportsController.generateSeasonalTrendsReport);
router.get("/stock", ReportsController.generateStockReport);
router.get("/users", ReportsController.generateUserActivityReport);

// Dashboard summary
router.get("/dashboard/summary", ReportsController.generateDashboardSummary);

// Export routes
router.get("/export/sales", ReportsController.exportSalesReport);
router.get("/export/products", ReportsController.exportProductReport);

// Add this route
router.get("/inventory-forecast/:productId", ReportsController.generateInventoryForecast);

// Add this new route
router.get("/realtime-metrics", ReportsController.getRealtimeMetrics);

export default router; 