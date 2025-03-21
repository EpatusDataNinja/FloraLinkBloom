import {
  createCategory,
  getAllCategories,
  deleteOneCategory,
  getOneCategoryWithDetails,
  updateOneCategory,

} from "../services/categoriesService.js";

// Create Category
export const addCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized, you are not a seller" 
      });
    }

    const newCategory = await createCategory(req.body, req.user.id);
    return res.status(201).json({ 
      success: true, 
      message: "Category created successfully", 
      Category: newCategory 
    });

  } catch (error) {
    console.error(error);
    // Check for specific error types
    if (error.message.includes("already exists")) {
      return res.status(400).json({ 
        success: false, 
        message: "A category with this name already exists in your list" 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all categories for the user
export const CategoryWithAllController = async (req, res) => {
  try {
    const data = await getAllCategories(req.user.id);
    return res.status(200).json({ success: true, message: "Categories retrieved successfully", data });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

// Delete a category (Only if it belongs to the user)
export const deleteOneCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(401).json({ success: false, message: "Not authorized, you are not an seller" });
    }

    const deletedCategory = await deleteOneCategory(req.params.id, req.user.id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({ success: true, message: "Category deleted successfully", Category: deletedCategory });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

// Update a category (Only if it belongs to the user)
export const updateOneCategoryController = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized, you are not a seller" 
      });
    }

    const updatedCategory = await updateOneCategory(req.params.id, req.body, req.user.id);
    if (!updatedCategory) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Category updated successfully", 
      Category: updatedCategory 
    });

  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(400).json({ 
        success: false, 
        message: "A category with this name already exists in your list" 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong" 
    });
  }
};

// Get one category details (Only if it belongs to the user)
export const getOneCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getOneCategoryWithDetails(id, req.user.id);
    if (!data) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ success: true, message: "Category retrieved successfully", data });

  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
