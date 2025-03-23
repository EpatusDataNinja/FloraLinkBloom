import ReportsService from '../services/ReportsService.js';
import db from "../database/models/index.js";

const initializeOrderEvents = () => {
  const { Orders } = db;
  
  if (!Orders) {
    console.error('Orders model not found in database instance');
    return;
  }

  // After order completion
  Orders.afterCreate(async (order) => {
    try {
      await ReportsService.updateProductPerformanceMetrics(order.productID);
      await ReportsService.updateSalesMetrics();
      await ReportsService.updateStockMetrics(order.productID);
    } catch (error) {
      console.error('Error in order afterCreate hook:', error);
    }
  });
};

// Export the initialization function
export default initializeOrderEvents; 