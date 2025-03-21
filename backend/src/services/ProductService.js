import { Sequelize } from 'sequelize';
import db from "../database/models/index.js";
const users = db["Users"];
const Products = db["Products"];
const Notifications = db["Notifications"];
const Categories = db["Categories"];
const { Op } = require("sequelize");

export const getuserproduct = async (userID) => {
  try {
    const Info = await Products.findAll({
      where: { userID: userID, status: "In Stock" }, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const getOneProductsWithDetails = async (id) => {
  try {
    const info = await Products.findByPk(id, {
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    if (!info) {
      throw new Error('Product not found');
    }

    return info;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

export const generalproducts = async (userID) => {
  try {
    const Info = await Products.findAll({
     include: [
        {
          model: Categories,
          as: "category",
        }
      ],   
    }
      
    );

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const generalproducts_available = async () => {
  try {
    const Info = await Products.findAll({
      where: { status: "In Stock"},
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],   
    }
      
    );

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

// buyeroutofstock

export const outstock = async (userID) => {
  try {
    const whereClause = {
      [Sequelize.Op.or]: [
        { status: "Out of Stock" },
        { status: "Pending Approval" },
        { status: "rejected" }
      ]
    };

    // If userID is provided, add it to the where clause
    if (userID) {
      whereClause.userID = userID;
    }

    const Info = await Products.findAll({
      where: whereClause,
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
      order: [['createdAt', 'DESC']] // Sort by newest first
    });

    return Info;
  } catch (error) {
    console.error("Error fetching out of stock products:", error);
    throw error;
  }
};

export const instock = async (userID) => {
  try {
    // First, let's check all products in the database
    const allProducts = await Products.findAll({
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log("All products in database:", allProducts.length);
    console.log("All product statuses:", allProducts.map(p => p.status));

    const whereClause = {
      status: "In Stock"  // Only look for exact match "In Stock"
    };

    // If userID is provided, add it to the where clause
    if (userID) {
      whereClause.userID = userID;
    }

    console.log("Fetching products with where clause:", whereClause);

    const Info = await Products.findAll({
      where: whereClause,
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
      order: [['createdAt', 'DESC']] // Sort by newest first
    });

    console.log("Found in-stock products:", Info.length);
    console.log("Product statuses:", Info.map(p => p.status));
    return Info;
  } catch (error) {
    console.error("Error fetching in stock products:", error);
    throw error;
  }
};

export const getAllProductses = async (userID) => {
  try {
    const Info = await Products.findAll({
      where: { userID }, 
      include: [
        {
          model: Categories,
          as: "category",
        }
      ],
    });

    return Info;
  } catch (error) {
    console.error("Error fetching profile details for user:", error);
    throw error;
  }
};

export const createProducts = async (ProductsData) => {
  try {
    // Log the incoming data
    console.log('Creating product with data:', ProductsData);
    
    // Validate required fields
    const requiredFields = ['name', 'categoryID', 'description', 'price', 'quantity'];
    for (const field of requiredFields) {
      if (!ProductsData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Create the product
    const product = await Products.create(ProductsData);
    
    // Log the created product
    console.log('Product created successfully:', product);
    
    return product;
  } catch (error) {
    console.error('Error in createProducts service:', error);
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

export const checkExistingProducts = async (name,id) => {
  return await Products.findOne({
    where: {
      name:name,
      userID: id,
    },
  });
};

// export const getAllProductses = async () => {
//   return await ProductsModel.findAll();
// };

export const deleteOneProducts = async (id) => {
  const restToDelete = await Products.findOne({ where: { id } });
  if (restToDelete) {
    await Products.destroy({ where: { id } });
    return restToDelete;
  }
  return null;
};

export const updateOne = async (id, data) => {
  try {
    console.log('Service updateOne called with data:', data);
    
    const product = await Products.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate data types before update
    const updateData = {
      ...data,
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
      categoryID: parseInt(data.categoryID)
    };

    // Remove any undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    console.log('Final update data in service:', updateData);

    await Products.update(updateData, { 
      where: { id },
      returning: true
    });

    // Fetch and return the updated product
    const updated = await Products.findByPk(id, {
      include: [
        {
          model: Categories,
          as: "category",
        }
      ]
    });

    return updated;
  } catch (error) {
    console.error('Update error in service:', error);
    throw error;
  }
};

export const status_change = async (id, status) => {
  try {
    const productToUpdate = await Products.findOne({ where: { id } });
    if (!productToUpdate) {
      return null;
    }

    await Products.update({ status: status }, { where: { id } });
    
    // Fetch and return the updated product with its category
    const updatedProduct = await Products.findByPk(id, {
      include: [
        {
          model: Categories,
          as: "category",
        }
      ]
    });

    return updatedProduct;
  } catch (error) {
    console.error("Error in status_change:", error);
    throw error;
  }
};

export const getPendingProducts = async () => {
  try {
    const products = await Products.findAll({
      where: {
        status: "Pending Approval"
      },
      include: [
        {
          model: users,
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"]
        }
      ]
    });

    console.log('Found pending products:', products.length);
    return products;
  } catch (error) {
    console.error('Error in getPendingProducts service:', error);
    throw error;
  }
};



