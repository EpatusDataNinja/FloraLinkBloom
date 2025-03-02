import express from "express";
import {
  getNotificationsController,
  createNotificationController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
  deleteAllNotificationsController
} from "../controllers/NotificationController.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.get("/", protect, getNotificationsController); 
router.post("/create", protect, createNotificationController); 
router.put("/read/:id", protect, markNotificationAsReadController); 
router.put("/read-all", protect, markAllNotificationsAsReadController);
router.delete("/delete/:id", protect, deleteNotificationController);
router.delete("/delete-all", protect, deleteAllNotificationsController); 

export default router;
