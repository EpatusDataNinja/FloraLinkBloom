import express from "express";
import {
  addMessageController,
  MessageWithAllController,
} from "../controllers/MessagesController.js"; 
import { protect } from "../middlewares/protect.js";

const router = express.Router();

router.post("/add/:id",protect, addMessageController);
router.get("/:id", protect,MessageWithAllController);

export default router;
