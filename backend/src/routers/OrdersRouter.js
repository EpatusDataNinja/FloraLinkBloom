import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addOrderController,
  getAllOrdersController,
  createOrder1,
  changeOrderStatus,
  get_one_order,
  checkoutOrder,
  getBuyerDashboardStats
} from "../controllers/OrdersController.js"; 

const router = express.Router();

router.post("/add", verifyToken, createOrder1);
router.post("/checkout/:id", verifyToken, checkoutOrder);
router.get("/", verifyToken, getAllOrdersController);
router.get("/one/:id", verifyToken, get_one_order);
router.put("/status/:id", verifyToken, changeOrderStatus);
router.get("/stats", verifyToken, getBuyerDashboardStats);

export default router;
