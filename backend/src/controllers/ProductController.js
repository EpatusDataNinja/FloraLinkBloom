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
  getOneProduct,
  getPendingProducts
} from "../services/ProductService.js";
import Email from "../utils/mailer.js";

import db from "../database/models/index.js";
const Users = db["Users"];
const Orders = db["Orders"];
const Products = db["Products"];
const Categories = db["Categories"];

const Notification = db["Notifications"];
import imageUploader from "../helpers/imageUplouder.js";
import {

  getUser,

} from "../services/userService.js";

import {
  getOneCategoryWithDetails
} from "../services/categoriesService.js";

import fs from 'fs';
import { Op } from "sequelize";
import { Sequelize } from 'sequelize';
const sequelize = db.sequelize;

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
      image: `/uploads/${req.file.filename}`,
      userID: req.user.id,
      status: "Pending Approval"
    };

    // Add the product
    const product = await createProducts(productData);

    // Create notifications for admins without email
    try {
      const admins = await Users.findAll({ where: { role: "admin" } });
      
      // Create in-app notifications only
      for (const admin of admins) {
        await Notification.create({
          userID: admin.id,
          title: 'New Product Requires Approval',
          message: `A new product "${productData.name}" has been submitted and requires your approval.`,
          type: 'NEW_PRODUCT',
          relatedId: product.id
        });
      }

      // Try to send emails, but don't block on failure
      try {
        for (const admin of admins) {
          await new Email(admin, { 
            message: `A new product "${productData.name}" has been submitted and requires your approval.`
          }).sendNotification().catch(console.error);
        }
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Continue without email notifications
      }
    } catch (notifError) {
      console.error('Notification creation error:', notifError);
      // Continue even if notifications fail
    }

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

    // First, get the product details
    const product = await getOneProductsWithDetails(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if the user owns this product
    if (product.userID !== userID) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products"
      });
    }

    // Delete the product image if it exists
    if (product.image) {
      try {
        const imagePath = product.image.replace(/^\/uploads\//, '');
        const fullPath = `uploads/${imagePath}`;
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (imageError) {
        console.error('Error deleting image file:', imageError);
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete the product
    await deleteOneProducts(id);

    // Send notification to admins
    try {
      const admins = await Users.findAll({ where: { role: "admin" } });
      
      // Send notification to the seller
      await new Email(req.user, {
        title: "Product Deletion Confirmation",
        message: `Your product "${product.name}" has been deleted successfully.`
      }).sendNotification();

      // Notify admins
      for (const admin of admins) {
        await Notification.create({
          userID: admin.id,
          title: `Product Deleted by Seller`,
          message: `Product "${product.name}" has been deleted by seller ${req.user.firstname} ${req.user.lastname}.`,
          type: "PRODUCT_DELETED"
        });
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't block the deletion process if notification fails
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};


export const activateProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;

    // Debug logging
    console.log('Activating product:', {
      productId: id,
      userId: userID,
      userRole: req.user.role
    });

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to activate products",
      });
    }

    // Fetch product details
    const data = await getOneProductsWithDetails(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

    try {
      // Update product status
      const updatedProduct = await status_change(id, "In Stock");

      // Send notifications
      try {
        await new Email(User1, {
          title: "Product Activation Notice",
          message: `Your product ${data.name} has been activated and is now in stock!`
        }).sendNotification();

        await Notification.create({
          userID: User1.id,
          title: "Product Activated",
          message: `Your product ${data.name} has been activated and is now in stock.`,
          type: "activation",
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Continue even if notifications fail
      }

      return res.status(200).json({
        success: true,
        message: "Product activated successfully",
        data: updatedProduct
      });
    } catch (statusError) {
      // Handle invalid status transition
      return res.status(400).json({
        success: false,
        message: statusError.message,
      });
    }
  } catch (error) {
    console.error('Error in activateProductsController:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


export const deactivateProductsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;

    // Debug logging
    console.log('Deactivating product:', {
      productId: id,
      userId: userID,
      userRole: req.user.role
    });

    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reject products",
      });
    }

    // Fetch product details
    const data = await getOneProductsWithDetails(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

    try {
      // Update product status
      const updatedProduct = await status_change(id, "rejected");

      // Send notifications
      try {
        await new Email(User1, {
          title: "Product Rejection Notice",
          message: `Your product ${data.name} has been rejected. Please review and update the product details.`
        }).sendNotification();

        await Notification.create({
          userID: User1.id,
          title: "Product Rejected",
          message: `Your product ${data.name} has been rejected. Please review and update the product details.`,
          type: "rejection",
        });
      } catch (notifError) {
        console.error('Notification error:', notifError);
        // Continue even if notifications fail
      }

      return res.status(200).json({
        success: true,
        message: "Product rejected successfully",
        data: updatedProduct
      });
    } catch (statusError) {
      // Handle invalid status transition
      return res.status(400).json({
        success: false,
        message: statusError.message,
      });
    }
  } catch (error) {
    console.error('Error in deactivateProductsController:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
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

export const getPendingProductsController = async (req, res) => {
  try {
    const userID = req.user.id;
    let role = req.user.role;

    // Check if the user is an admin
    if (role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to view pending products",
      });
    }

    const products = await getPendingProducts();
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getPendingProductsController:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending products',
      error: error.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Products.findAll({
      include: [{
        model: Users,
        as: 'User',
        attributes: ['id', 'firstname', 'lastname', 'image']
      }],
      // ... other query options
    });

    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

export const getApprovedProducts = async (req, res) => {
  try {
    const products = await Products.findAll({
      where: { 
        status: "In Stock" 
      },
      include: [
        {
          model: Users,
          as: "user",
          attributes: ['id', 'firstname', 'lastname', 'image', 'status'],
          where: { 
            status: 'active'
          }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price) || 0,
        quantity: parseInt(productData.quantity) || 0,
        image: productData.image,
        status: productData.status,
        categoryID: productData.categoryID,
        userID: productData.user.id,
        firstname: productData.user.firstname,
        lastname: productData.user.lastname,
        userImage: productData.user.image,
        userStatus: productData.user.status,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
      };
    });

    console.log('Transformed products:', transformedProducts);

    return res.status(200).json({
      success: true,
      message: "Approved products retrieved successfully",
      data: transformedProducts
    });

  } catch (error) {
    console.error('Error in getApprovedProducts:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching approved products",
      error: error.message
    });
  }
};

export const searchProductsController = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice } = req.query;
        
        // Build search query
        const whereClause = {
            status: "In Stock", // Only show in-stock products
            [Op.or]: [
                { name: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } }
            ]
        };

        // Add price filter if provided
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = minPrice;
            if (maxPrice) whereClause.price[Op.lte] = maxPrice;
        }

        // Add category filter if provided
        if (category) {
            whereClause.categoryID = category;
        }

        const products = await Products.findAll({
            where: whereClause,
            include: [
                {
                    model: Categories,
                    as: 'category',
                    attributes: ['id', 'name']
                },
                {
                    model: Users,
                    as: 'user',
                    attributes: ['id', 'firstname', 'lastname', 'image', 'status'],
                    where: { status: 'active' } // Only show products from active sellers
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Transform the response to match the approved products format
        const transformedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price) || 0,
            quantity: parseInt(product.quantity) || 0,
            image: product.image,
            status: product.status,
            categoryID: product.categoryID,
            userID: product.user.id,
            firstname: product.user.firstname,
            lastname: product.user.lastname,
            userImage: product.user.image,
            category: product.category,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));

        return res.status(200).json({
            success: true,
            count: transformedProducts.length,
            data: transformedProducts
        });
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({
            success: false,
            message: "Error searching products",
            error: error.message
        });
    }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const trendingProducts = await Products.findAll({
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'quantity',
        'image',
        'status',
        'categoryID',
        'userID',
        'createdAt',
        [sequelize.fn('COUNT', sequelize.col('orders.id')), 'orderCount']
      ],
      include: [
        {
          model: Orders,
          as: 'orders',
          attributes: []
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'image', 'status'],
          where: { status: 'active' }
        }
      ],
      where: { 
        status: 'In Stock'
      },
      group: [
        'Products.id',
        'user.id',
        'user.firstname',
        'user.lastname',
        'user.email',
        'user.image',
        'user.status'
      ],
      order: [[sequelize.fn('COUNT', sequelize.col('orders.id')), 'DESC']],
      limit: 6
    });

    // Transform the response to include user data
    const transformedProducts = trendingProducts.map(product => ({
      ...product.toJSON(),
      user: {
        id: product.user.id,
        firstname: product.user.firstname,
        lastname: product.user.lastname,
        email: product.user.email,
        image: product.user.image,
        status: product.user.status
      }
    }));

    return res.status(200).json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
};

export const getSeasonalProducts = async (req, res) => {
  try {
    const { season } = req.params;
    
    // Get the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    // Define seasons and their months (matching frontend definition)
    const RWANDA_SEASONS = {
      'Long Rainy': [2, 3, 4],
      'Long Dry': [5, 6, 7],
      'Short Rainy': [8, 9, 10],
      'Short Dry': [11, 0, 1]
    };

    const seasonMonths = RWANDA_SEASONS[season];
    if (!seasonMonths) {
      return res.status(400).json({
        success: false,
        message: 'Invalid season specified'
      });
    }

    const products = await Products.findAll({
      where: {
        status: 'In Stock',
        createdAt: {
          [Op.and]: [
            sequelize.literal(`EXTRACT(MONTH FROM "Products"."createdAt") IN (${seasonMonths.join(',')})`)
          ]
        }
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: ['id', 'firstname', 'lastname', 'email', 'image', 'status'],
        where: { status: 'active' }
      }],
      order: [['createdAt', 'DESC']]
    });

    // Transform the response to include user data
    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        user: {
          id: product.user.id,
          firstname: product.user.firstname,
          lastname: product.user.lastname,
          email: product.user.email,
          image: product.user.image,
          status: product.user.status
        }
      };
    });

    console.log(`Found ${transformedProducts.length} products for season ${season}`);

    return res.status(200).json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching seasonal products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seasonal products'
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const products = await Products.findAll({
      include: [
        {
          model: Orders,
          as: 'orders',
          required: false,
          where: {
            createdAt: {
              [Op.gte]: sixtyDaysAgo
            }
          }
        },
        {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'image', 'status'],
          where: { status: 'active' }
        }
      ],
      where: {
        status: 'In Stock',
        '$orders.id$': null // Only get products with no orders in last 60 days
      }
    });

    // Transform the response to ensure user data is properly structured
    const transformedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        user: {
          id: productData.user.id,
          firstname: productData.user.firstname,
          lastname: productData.user.lastname,
          email: productData.user.email,
          image: productData.user.image,
          status: productData.user.status
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};
