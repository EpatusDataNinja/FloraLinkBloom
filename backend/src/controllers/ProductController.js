// ProductsController.js
import {
  createProducts,
  getAllProductses,
  deleteOneProducts,
  checkExistingProducts,
  getOneProductsWithDetails,
  updateOne,
  generalproducts,
  status_change,
  generalproducts_available,
  instock,
  outstock,
  getuserproduct,
  getOneProduct

} from "../services/ProductService.js";
import Email from "../utils/mailer.js";

import db from "../database/models/index.js";
const Users = db["Users"];
const Orders = db["Orders"];
const Products = db["Products"];

const Notification = db["Notifications"];
import imageUploader from "../helpers/imageUplouder.js";
import {

  getUser,

} from "../services/userService.js";

import {
  getOneCategoryWithDetails
} from "../services/categoriesService.js";

import fs from 'fs';

export const addProductsController = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Create product data object
    const productData = {
      ...req.body,
      image: `/uploads/${req.file.filename}`, // Store relative path
      userID: req.user.id, // Changed from userId to userID to match model
      status: "Pending Approval" // Set initial status to Pending Approval
    };

    // Validate required fields
    const requiredFields = ['name', 'price', 'description', 'categoryID'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Add the product
    const product = await createProducts(productData);

    // Construct full image URL for response
    const responseData = {
      ...product.toJSON(),
      image: product.image ? `${process.env.BASE_URL}${product.image}` : null
    };

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error in addProductsController:', error);
    
    // Delete uploaded file if product creation fails
    if (req.file) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) console.error('Error deleting file:', unlinkError);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message
    });
  }
};

export const deleteOneProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const data = await getOneProductsWithDetails(id, userID);
    if (!data) {
      return res.status(404).json({
        message: "product detail not found",
        data: [],
      });
    }


    const admins = await Users.findAll({ where: { role: "admin" } });
    await new Email(req.user, { message:  `Confirmation ! Your product ${data.name} has been deleted by your self ! . ` }).sendNotification();

    for (const admin of admins) {
      await Notification.create({
        userID: admin.id,
        title: `Seller ${req.user.name} has deleted his product  `,
        message: `A new Product ${req.body.name} has been posted need your approval to be in stock.`,
        type: "admin",
      });
  
      // Send email notification to each admin
      await new Email(admin, { message: `A new Product ${req.body.name} has been posted need your approval to be in stock. approval or reject !.` }).sendNotification();
    }
    const Products = await deleteOneProducts(req.params.id);

    if (!Products) {
      return res.status(404).json({
        success: false,
        message: "Products not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Products deleted successfully",
      Products,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};


export const activateProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id; // Get logged-in user's ID

    // Check if the user is an admin
    let role = req.user.role;
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to activate products",
      });
    }

    // Fetch product details
    const data = await getOneProductsWithDetails(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Product details not found",
        data: [],
      });
    }

    // Fetch the user associated with the product
    const User1 = await Users.findOne({ where: { id: data.userID } });
    if (!User1) {
      return res.status(404).json({
        success: false,
        message: "User not found for this product",
      });
    }

    await new Email(User1, { message: ` ! Your product ${data.name}  has been activated successfully ! now it status is Stock in !`}).sendNotification();

    // Send a notification to the user
    await Notification.create({
      userID: User1.id,
      title: `Product Activation!`,
      message: `Your product ${data.name} has been activated successfully and is now "In Stock". You can check it in the system.`,
      type: "activation",
    });

    // Update the product status to "In Stock"
    let status = "In Stock";
    const product = await status_change(id, status);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product status update failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product activated successfully and status updated to 'In Stock'",
      product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};


export const deactivateProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id; // Get logged-in user's ID



    // Check if the user is an admin
    let role = req.user.role;
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to diactivate products",
      });
    }

    // Fetch product details
    const data = await getOneProductsWithDetails(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Product details not found",
        data: [],
      });
    }

    // Fetch the user associated with the product
    const User1 = await Users.findOne({ where: { id: data.userID } });
    if (!User1) {
      return res.status(404).json({
        success: false,
        message: "User not found for this product",
      });
    }

    await new Email(User1, { message: ` ! Your product ${data.name}  has been rejected  !!`}).sendNotification();

    // Send a notification to the user
    await Notification.create({
      userID: User1.id,
      title: `Product rejection!`,
      message: `Your product ${data.name} has been rejected`,
      type: "rejection",
    });

    let status = "rejected";
    const product = await status_change(req.params.id, status);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "product deactivated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};





export const getAllUsersWithProductStats = async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [
        {
          model: Products,
          as: "Products",
          // attributes: ["id", "name", "price", "quantity", "status"],
        },
      ],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    const userData = await Promise.all(
      users.map(async (user) => {
        // Filter products that have the status "In Stock"
        const inStockProducts = user.Products.filter(product => product.status === "In Stock");

        // Skip users with no products or no "In Stock" products
        if (inStockProducts.length === 0) {
          return null; // Return null to filter out the user
        }

        const firstProduct = inStockProducts.length > 0 ? inStockProducts[0] : null;

        const totalProducts = await Products.count({
          where: { userID: user.id },
        });

        const totalSales = await Orders.sum("totalAmount", {
          where: {
            productID: inStockProducts.map((product) => product.id), // Filters using "In Stock" product IDs
          },
        });

        const totalOrders = await Orders.count({
          where: {
            productID: inStockProducts.map((product) => product.id),
          },
        });

        return {
          user: {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
          },
          firstProduct,
          statistics: {
            totalProducts,
            totalSales: totalSales || 0,
            totalOrders,
          },
        };
      })
    );

    // Filter out any null values from the results
    const filteredUserData = userData.filter(user => user !== null);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: filteredUserData,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};



export const getting_all_product = async (req, res) => {
  try {
    let data;
    if (!req.user) {
      // If the user is not logged in, return all public posts
      data = await generalproducts_available(); // Adjust this function to return only public posts if needed
      return res.status(200).json({
        success: true,
        message: "Public products retrieved successfully",
        data,
      });
    }
    const userID = req.user.id; // Get logged-in user's ID
    if (req.user.role == "admin") {
      data = await generalproducts();
    }
    if (req.user.role == "seller") {
      data = await getAllProductses(userID);
    }
    if (req.user.role == "buyer") {
      data = await generalproducts_available();
    }


    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No product found for the logged-in user",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product details retrieved successfully",
      data,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const userProduct = async (req, res) => {
  try {

  let data = await getuserproduct(req.params.id);

  

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No product found",
        data: [],
      });
    }

       const owner = await getUser(req.params.id);
    
           if (!owner) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

    return res.status(200).json({
      success: true,
      message: "Product details retrieved successfully",
      data,
      owner:owner
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};




export const out_of_stock_controller = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let data = await outstock(req.user.role === "seller" ? req.user.id : null);
    
    // Add pagination
    const total = data.length;
    data = data.slice(offset, offset + limit);

    if (!data || data.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No out-of-stock products found",
        data: [],
        total: 0,
        page,
        limit
      });
    }

    return res.status(200).json({
      success: true,
      message: "Out-of-stock products retrieved successfully",
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error("Error in out_of_stock_controller:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

export const instockController = async (req, res) => {
  try {
    // Add debugging logs
    console.log("Starting instockController");
    console.log("User from request:", req.user); // Check if user data is available

    const data = await instock(req.user?.id); // Pass user ID if needed

    console.log("Data retrieved:", data);
    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    // Detailed error logging
    console.error("Error in instockController:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch in-stock products",
      error: error.message
    });
  }
};

export const getOneProductsController = async (req, res) => {


  try {
    const { id } = req.params;
    const userID = req.user.id; // Get logged-in user's ID

    const data = await getOneProductsWithDetails(id);
    if (!data) {
      return res.status(404).json({
        message: "product detail not found",
        data: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "product detail retrieved successfully",
      data,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};



export const updateOne_controller = async (req, res) => {
  try {
    console.log('Update controller received:', {
      body: req.body,
      file: req.file,
      params: req.params,
      user: req.user
    });

    const { id } = req.params;
    const userID = req.user.id;

    // Get existing product
    const existingProduct = await getOneProductsWithDetails(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Verify ownership
    if (existingProduct.userID !== userID) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products"
      });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      categoryID: parseInt(req.body.categoryID),
      status: "Pending Approval", // Set status to Pending Approval for admin review
      userID: userID // Ensure userID is included
    };

    // Handle image update
    if (req.file) {
      // New image uploaded
      updateData.image = `/uploads/${req.file.filename}`; // Store relative path
      
      // Delete old image if it exists
      if (existingProduct.image && existingProduct.image.startsWith('uploads/')) {
        try {
          fs.unlinkSync(existingProduct.image);
        } catch (err) {
          console.error('Error deleting old image:', err);
          // Don't throw error here, just log it
        }
      }
    } else if (req.body.existingImage) {
      // Keep existing image if no new file uploaded
      updateData.image = req.body.existingImage;
    }

    console.log('Final update data:', updateData);

    // Update the product
    const updated = await updateOne(id, updateData);

    // Construct full image URL for response
    const responseData = {
      ...updated.toJSON(),
      image: updated.image ? `${process.env.BASE_URL}${updated.image}` : null
    };

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: responseData
    });

  } catch (error) {
    console.error('Error in updateOne_controller:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
};
