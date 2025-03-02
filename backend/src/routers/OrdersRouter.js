import express from "express";
import {
  addOrderController,
  getAllOrdersController,
  createOrder1,
  changeOrderStatus,
  get_one_order,
  checkoutOrder
} from "../controllers/OrdersController.js"; 
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.post("/add",protect, createOrder1 );
router.post("/checkout/:id",protect, checkoutOrder );
router.get("/", protect,getAllOrdersController);
router.get("/one/:id", protect,get_one_order);
router.put("/status/:id", protect,changeOrderStatus);

export default router;
