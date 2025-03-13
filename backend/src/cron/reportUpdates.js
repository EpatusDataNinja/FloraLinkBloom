import cron from 'node-cron';
import ReportsService from '../services/ReportsService.js';
import db from "../database/models/index.js";
const { Products } = db;

// Update sales metrics hourly
cron.schedule('0 * * * *', async () => {
  try {
    await ReportsService.updateSalesMetrics();
  } catch (error) {
    console.error('Error in sales metrics cron job:', error);
  }
});

// Update stock metrics every 4 hours
cron.schedule('0 */4 * * *', async () => {
  try {
    const products = await Products.findAll();
    for (const product of products) {
      await ReportsService.updateStockMetrics(product.id);
    }
  } catch (error) {
    console.error('Error in stock metrics cron job:', error);
  }
});

// Update seasonal metrics daily
cron.schedule('0 0 * * *', async () => {
  try {
    await ReportsService.updateSeasonalMetrics();
  } catch (error) {
    console.error('Error in seasonal metrics cron job:', error);
  }
}); 