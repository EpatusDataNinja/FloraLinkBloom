import express from "express";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import {
  addProductsController,
  getting_all_product,
  deleteOneProductsController,
  getOneProductsController,
  updateOne_controller,
  activateProductsController,
  deactivateProductsController,
  out_of_stock_controller,
  instockController,
  userProduct,
  getAllUsersWithProductStats,
  getPendingProductsController,
  getApprovedProducts,
  searchProductsController,
  getTrendingProducts,
  getSeasonalProducts,
  getFeaturedProducts
} from "../controllers/ProductController.js";
import { protect,optionalProtect } from "../middlewares/protect.js";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file
  },
  fileFilter: (req, file, cb) => {
    console.log('File being processed:', file);
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
  console.log('Multer error handler received:', err);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    console.error('Other error:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Middleware to validate required fields
const validateRequiredFields = (req, res, next) => {
  console.log('Validating fields:', req.body);
  console.log('Request file:', req.file);
  
  if (!req.body.name || !req.body.categoryID || !req.body.description || !req.body.price || !req.body.quantity) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }
  next();
};

// Add this before your routes
const logResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function(data) {
    console.log('API Response for:', req.path);
    console.log('Response data:', JSON.stringify(data, null, 2));
    return oldJson.call(this, data);
  };
  next();
};

// Reorder routes - more specific routes first
router.get("/instock", protect, instockController);
router.get("/outofstock", protect, out_of_stock_controller);
router.get("/users_statistics", getAllUsersWithProductStats);
router.get("/one/:id", protect, getOneProductsController);
router.get("/user/:id", userProduct);
router.get("/pending", protect, getPendingProductsController);
router.get("/approved", optionalProtect, getApprovedProducts);
router.get("/search", searchProductsController);
router.get("/trending", logResponse, getTrendingProducts);
router.get("/seasonal/:season", logResponse, getSeasonalProducts);
router.get("/featured", logResponse, getFeaturedProducts);
router.post("/add", protect, 
  (req, res, next) => {
    console.log('Add request received');
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    upload(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  validateRequiredFields,
  addProductsController
);
router.put("/update/:id", protect, 
  (req, res, next) => {
    console.log('Update request received for product:', req.params.id);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    
    upload(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  validateRequiredFields,
  updateOne_controller
);
router.put("/activate/:id", protect, activateProductsController);
router.put("/disactivate/:id", protect, deactivateProductsController);
router.delete("/delete/:id", protect, deleteOneProductsController);
router.get("/", optionalProtect, getting_all_product);

export default router;
