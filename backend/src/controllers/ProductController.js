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

export const addProductsController = async (req, res) => {
  try {
    req.body.userID = req.user.id;
    console.log('User ID:', req.body.userID);

    let role = req.user.role;
    if (role !== "seller") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to add products",
      });
    }

    // Log the entire req.body for debugging purposes
    console.log('Request Body:', req.body);

    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    req.body.name = req.body.name.toUpperCase();

    if (!req.body.description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!req.body.price || !req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity are required",
      });
    }

    req.body.status = "Out of Stock";

    // Fetch category details
    const data = await getOneCategoryWithDetails(req.body.categoryID, req.body.userID);
    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Handle image upload if present
    let image;
    if (req.files && req.files.image) {
      try {
        image = await imageUploader(req);
        if (!image || !image.url) {
          throw new Error('Upload failed or image URL missing');
        }
        req.body.image = image.url;
        console.log('Image URL:', req.body.image);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Handle image upload error gracefully
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: error.message,
        });
      }
    } else {
      req.body.image = null;
    }

    // Check for existing product
    const existingProduct = await checkExistingProducts(req.body.name, req.user.id);
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    
    // Create new product
    const newProduct = await createProducts(req.body);

    await new Email(req.user, { message: "Your product is out of stock status, wait foe admin approval ! You will be notified once reviewed." }).sendNotification();

      // Find all admins
  const admins = await Users.findAll({ where: { role: "admin" } });

  // Notify all admins about the new user signup
  for (const admin of admins) {
    await Notification.create({
      userID: admin.id,
      title: "New Product are inserted your  Awaiting Approval",
      message: `A new Product ${req.body.name} has been posted need your approval to be in stock.`,
      type: "admin",
    });

    // Send email notification to each admin
    await new Email(admin, { message: `A new Product ${req.body.name} has been posted need your approval to be in stock. approval or reject !.` }).sendNotification();
  }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
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




export const out_of_stock_controller= async (req, res) => {
  try {
   let data = await outstock();
    const userID = req.user.id; 
    if (req.user.role == "seller") {
      data = data.filter(data => data.userID === req.user.id);
    }

    if (req.user.role == "admin") {
      data = await outstock();
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

export const instockController= async (req, res) => {
  try {
    let data= await instock();
    const userID = req.user.id; 
    if (req.user.role == "seller") {
      data = data.filter(data => data.userID === req.user.id);
      
    }

    if (req.user.role == "buyer" || req.user.role == "admin") {
     data= await instock();
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
    const { id } = req.params;
    req.body.userID = req.user.id;
    let role = req.user.role;
    if (role != "seller") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to add products",
      });
    }


    req.body.name = req.body.name.toUpperCase();
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!req.body.description) {
      return res.status(400).json({
        success: false,
        message: "description is required",
      });
    }

    if (!req.body.price || !req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity are required",
      });
    }

    if (!req.body.price || !req.body.quantity) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity are required",
      });
    }
    const product = await getOneProductsWithDetails(id, req.user.id);
    if (!product) {
      return res.status(404).json({
        message: "product detail not found",
        data: [],
      });
    }
    req.body.name = req.body.name.toUpperCase();
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const data = await getOneCategoryWithDetails(req.body.categoryID);
    if (!data) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    let image;
    if (req.files && req.files.image) {
      try {
        image = await imageUploader(req);
        if (!image || !image.url) {
          throw new Error('Upload failed or image URL missing');
        }
        req.body.image = image.url;
        console.log(req.body.image)
      } catch (error) {
        console.error('Error uploading image:', error);
        // Handle error appropriately
      }
    }

    const updated = await updateOne(id, req.body);

    return res.status(201).json({
      success: true,
      message: "product created successfully",
      updated: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};