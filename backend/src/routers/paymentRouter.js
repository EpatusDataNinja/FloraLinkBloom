import express from "express";
import {
    paymentController,
    processCartPaymentController,
    updatePaymentOrderController
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.get("/", protect, paymentController);
router.post("/process-cart", protect, processCartPaymentController);
router.post("/update-order", protect, updatePaymentOrderController);

export default router;
