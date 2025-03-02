
import express from "express";
import {
    paymentController,
} from "../controllers/paymentController.js";
import { protect,optionalProtect } from "../middlewares/protect.js";

const router = express.Router();

router.get("/", protect, paymentController);


export default router;
