import ReportsService from '../services/ReportsService.js';
import db from "../database/models/index.js";
const { Orders } = db;

// After order completion
Orders.afterCreate(async (order) => {
  await ReportsService.updateProductPerformanceMetrics(order.productID);
  await ReportsService.updateSalesMetrics();
  await ReportsService.updateStockMetrics(order.productID);
}); 