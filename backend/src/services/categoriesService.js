import db from "../database/models/index.js";

const Categories = db["Categories"];


// Create Category - Ensure uniqueness per user
export const createCategory = async (categoryData, userID) => {
  try {
    // Check if a category with the same name exists for the user
    const existingCategory = await Categories.findOne({
      where: {
        name: categoryData.name,
        userID,
      },
    });

    if (existingCategory) {
      throw new Error(`Category "${categoryData.name}" already exists in your list.`);
    }

    categoryData.userID = userID;
    return await Categories.create(categoryData);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all categories for a specific user
export const getAllCategories = async (userID) => {
  try {
    return await Categories.findAll({
      where: { userID }, // Fetch only categories belonging to the user
    });
  } catch (error) {
    console.error("Error fetching user-specific categories:", error);
    throw error;
  }
};

// Delete a category (Ensure it belongs to the user)
export const deleteOneCategory = async (id, userID) => {
  const categoryToDelete = await Categories.findOne({ where: { id, userID } });
  if (categoryToDelete) {
    await Categories.destroy({ where: { id, userID } });
    return categoryToDelete;
  }
  return null;
};

// Update a category (Ensure uniqueness for the same user)
export const updateOneCategory = async (id, category, userID) => {
  const categoryToUpdate = await Categories.findOne({ where: { id, userID } });
  
  if (!categoryToUpdate) {
    throw new Error("Category not found");
  }

  const duplicateCategory = await Categories.findOne({
    where: { 
      name: category.name, 
      userID, 
      id: { [db.Sequelize.Op.ne]: id } 
    },
  });

  if (duplicateCategory) {
    throw new Error(`Category "${category.name}" already exists in your list.`);
  }

  await Categories.update(category, { where: { id, userID } });
  return category;
};

// Get one category with details (Ensure it belongs to the user)
export const getOneCategoryWithDetails = async (id, userID) => {
  try {
    return await Categories.findOne({
      where: { id, userID },
    });
  } catch (error) {
    console.error("Error fetching category details:", error);
    throw error;
  }
};

