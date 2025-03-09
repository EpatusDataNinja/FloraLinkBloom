import { Router } from "express";
import {
  // ... existing imports ...
  getBuyerDashboardStats
} from "../controllers/OrderController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// ... existing routes ...

// Buyer dashboard statistics
router.get("/stats", verifyToken, getBuyerDashboardStats);

export default router; 