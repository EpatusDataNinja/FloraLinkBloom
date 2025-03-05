import express from "express";
import {
  Signup,
  getAllUsers,
  getOneUser,
  updateOneUser,
  deleteOneUser,
  activateOneUser,
  deactivateOneUser,
  changePassword,
  checkEmail,
  checkCode,
  ResetPassword,
  getAdminOverview,
  getSellerOverview,
  getBuyerOverview,
  getSellerSalesReport,
  getUsersWithoutAppointments,
  updateProfile
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

const router = express.Router();

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Profile routes
router.put("/update/:id", verifyToken, upload.single('image'), updateOneUser);

// Other routes
router.post("/signup", Signup);
router.get("/", verifyToken, getAllUsers);
router.get("/admin/overview", verifyToken, getAdminOverview);
router.get("/seller/overview", verifyToken, getSellerOverview);
router.get("/buyer/overview", verifyToken, getBuyerOverview);
router.get("/seller/sales-report", verifyToken, getSellerSalesReport);
router.get("/:id", verifyToken, getOneUser);
router.delete("/delete/:id", verifyToken, deleteOneUser);
router.put("/activate/:id", verifyToken, activateOneUser);
router.put("/deactivate/:id", verifyToken, deactivateOneUser);
router.put("/changePassword", verifyToken, changePassword);
router.post("/check", checkEmail);
router.post("/code/:email", checkCode);
router.put("/resetPassword/:email", ResetPassword);

export default router; 