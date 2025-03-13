import express from "express";
import {
  addCategoryController,
  CategoryWithAllController,
  deleteOneCategoryController,
  getOneCategoryController,
  updateOneCategoryController

} from "../controllers/categoriesController.js"; // Update the import for the CategoriesController
import { protect } from "../middlewares/protect.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.delete("/delete/:id",protect, deleteOneCategoryController);
router.post("/add/",protect, addCategoryController);
router.get("/", verifyToken, CategoryWithAllController);
router.get("/all",protect,  CategoryWithAllController);
router.get("/one/:id",protect, getOneCategoryController);
router.put("/:id",protect, updateOneCategoryController);


export default router;
