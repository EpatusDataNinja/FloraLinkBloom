import express from "express";
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
  getAllUsersWithProductStats


} from "../controllers/ProductController.js";
import { protect,optionalProtect } from "../middlewares/protect.js";

const router = express.Router();

router.delete("/delete/:id", protect, deleteOneProductsController);
router.post("/add/", protect, addProductsController);
router.get("/", optionalProtect, getting_all_product);
router.get("/users_statistics", getAllUsersWithProductStats);
router.get("/outofstock", protect, out_of_stock_controller);
router.get("/instock", protect, instockController);
router.get("/one/:id", protect, getOneProductsController);
router.get("/user/:id", userProduct);
router.put("/update/:id", protect, updateOne_controller);
router.put("/activate/:id", protect, activateProductsController);
router.put("/disactivate/:id", protect, deactivateProductsController);

export default router;