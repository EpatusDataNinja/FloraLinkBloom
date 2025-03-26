import express from "express";
import multer from 'multer';
import path from 'path';
import {
  addMessageController,
  MessageWithAllController,
  getUnreadMessagesCount,
  searchMessages,
  exportChat,
  uploadMedia,
  getChatHistoryController,
  getUnreadMessagesController
} from "../controllers/MessagesController.js";
import { protect } from "../middlewares/protect.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'video/mp4', 'video/quicktime',
      'audio/mpeg', 'audio/wav',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Order matters! Put more specific routes first
router.get("/history", protect, getChatHistoryController);
router.get("/unread", protect, getUnreadMessagesController);
router.get("/unread/count", protect, getUnreadMessagesCount);
router.get("/search/:query", protect, searchMessages);
router.get("/export/:userId", protect, exportChat);
router.post("/upload/:id", protect, upload.single('media'), uploadMedia);
router.get("/:id", protect, MessageWithAllController);
router.post("/add/:id", protect, addMessageController);

export default router;
