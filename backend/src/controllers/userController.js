import Email from "../utils/mailer.js";
import bcrypt from "bcrypt";
import {
  createUser,
  getUserByEmail,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  GetUserPassword,
  getallUsers,
  getUserByPhone,
  getUserByCode,
  updateUserCode,
  getUsers1
} from "../services/userService.js";
import {
  createNotification,
} from "../services/NotificationService";

import imageUploader from "../helpers/imageUplouder.js";
import db from "../database/models/index.js";
const Users = db["Users"];
const Products = db["Products"];
const Orders = db["Orders"];
const Categories = db["Categories"];
const Payments = db["Payments"];
const Notification = db["Notifications"];



export const Signup = async (req, res) => {
  try {
    if (!req.body.role || req.body.role === "" || 
      !req.body.firstname || req.body.firstname === "" ||
       !req.body.lastname || req.body.lastname === "" ||
        !req.body.email || req.body.email === "" || 
        !req.body.phone || req.body.phone === ""
    || !req.body.address || req.body.address === "" || 
    !req.body.gender || req.body.gender === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide all information",
      });
    }



    const { password, confirmPassword } = req.body;

    // Check if password is provided
    if (!password || password === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a password",
      });
    }
  
    // Check if confirmPassword is provided
    if (!confirmPassword || confirmPassword === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a confirmation password",
      });
    }
  
    // Compare password and confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    if (req.body.role !== "buyer" && req.body.role !== "seller") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid role",
      });
    }
    
  

    const userExist = await getUserByEmail(req.body.email);
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    const Exist = await getUserByPhone(req.body.phone);
    if (Exist) {
      return res.status(400).json({
        success: false,
        message: "your Phone number already exists",
      });
    }
    // // Generate password
    // const password = `D${Math.random().toString(36).slice(-8)}`;

    // // Create user with generated password and set status to active
    // req.body.password = password;
    

      req.body.status = "inactive";
    
    

    const newUser = await createUser(req.body);
    newUser.password = password;

  // notification 
  await Notification.create({
    userID: newUser.id,
    title: "Account Pending Approval",
    message: "Your account is awaiting admin approval. You will be notified once it is reviewed.",
    type: "account",
  });

  // Send email notification to the user
  await new Email(newUser, { message: "Your account is pending approval. You will be notified once reviewed." }).sendNotification();

  // Find all admins
  const admins = await Users.findAll({ where: { role: "admin" } });

  // Notify all admins about the new user signup
  for (const admin of admins) {
    await Notification.create({
      userID: admin.id,
      title: "New User Awaiting Approval",
      message: `A new user ${req.body.role} called ${req.body.firstname} ${req.body.lastname} has signed up and requires approval.`,
      type: "admin",
    });

    // Send email notification to each admin
    await new Email(admin, { message: `A new user ${req.body.role} called has been registered in system ${req.body.firstname} ${req.body.lastname}) needs to be checked and approval or reject !.` }).sendNotification();
  }

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        restaurents: newUser.restaurents,
        role: req.body.role, 
        gender: req.body.gender, 
        phone: req.body.phone, 
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const changePassword = async (req, res) => {
  console.log(req.user.id)
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if ( !oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide userId, oldPassword, newPassword, and confirmPassword",
    });
  }

  try {
    const user = await GetUserPassword(req.user.id);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid user",
      });
    }

    console.log("Retrieved user from database:", user);

    const storedPassword = user || null;

    if (!storedPassword) {
      return res.status(500).json({
        success: false,
        message: "User password not found in the database",
      });
    }

    const validPassword = await bcrypt.compare(oldPassword, storedPassword);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUser(req.user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addUser = async (req, res) => {
  let role = req.user.role;

  if (!req.body.role || req.body.role === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide role",
    });
  }

  if (!req.body.firstname || req.body.firstname === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide firstname",
    });
  }
  if (!req.body.lastname || req.body.lastname === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide lastname",
    });
  }
  if (!req.body.email || req.body.email === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }
  if (!req.body.phone || req.body.phone === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide phone",
    });
  }
  if (role === "user") {
      return res.status(400).json({
        success: false,
        message: "you are not allowed to add any user",
      });
    
  }



  try {
    const userExist = await getUserByEmail(req.body.email);
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "email already exist",
      });
    }

    const phoneExist = await getUserByPhone(req.body.phone);
    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "phone number has been used",
      });
    }

    // generate password
    const password = `D${Math.random().toString(36).slice(-8)}`;

    // create user with generated password and set status to active
    req.body.password = password;
    req.body.status = "active";
    console.log(req.body);

    const newUser = await createUser(req.body);
    newUser.password = password;

    // send email
    await new Email(newUser).sendAccountAdded();

    const notification = await createNotification({ userID:newUser.id,title:"Account created for you", message:"your account has been created successfull", type:'account', isRead: false });
    

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role, 


      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let filteredUsers = [];
    let users = await getUsers();

    if (req.user.role === "admin") {
      // Admin can see everyone except themselves
      filteredUsers = users.filter(user => user.id !== req.user.id);
    } else if (req.user.role === "buyer") {
      // Buyer can see only sellers, but not themselves or admin
      filteredUsers = users.filter(user => user.role === "seller" && user.id !== req.user.id && user.role !== "admin");
    } else if (req.user.role === "seller") {
      // Seller can see only buyers, but not themselves or admin
      filteredUsers = users.filter(user => user.role === "buyer" && user.id !== req.user.id && user.role !== "admin");
    } else {
      // For other roles, return an empty array
      filteredUsers = [];
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: filteredUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};



export const getUsersWithoutAppointments = async (req, res) => {
  try {
    // Fetch all users with their appointments
    let users = await getUsers1();

    // Get the current date
    const currentDate = new Date();

    // Filter users who joined more than 3 years ago
    const threeYearsAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 3));

    const usersJoinedMoreThan3YearsAgo = users.filter(user => new Date(user.joindate) < threeYearsAgo);

    if (usersJoinedMoreThan3YearsAgo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found who joined more than 3 years ago",
        users: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: usersJoinedMoreThan3YearsAgo
    });
  } catch (error) {
    console.error("Error fetching users who joined more than 3 years ago:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const getOneUser = async (req, res) => {

  try {
    const user = await getUser(req.params.id);

       if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

export const updateOneUser = async (req, res) => {
  try {
    console.log('=== Profile Update Request ===');
    console.log('User ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('File:', req.file);
    console.log('Authenticated user:', req.user);

    // Check if the user exists
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      console.log('ERROR: User not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.log('Found existing user:', JSON.stringify(existingUser, null, 2));

    // Validate the request body
    const allowedFields = ['firstname', 'lastname', 'phone', 'gender', 'address'];
    const updateData = {};
    
    // Handle text fields from FormData
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    });

    console.log('Fields to update:', JSON.stringify(updateData, null, 2));

    // Handle image upload if present
    if (req.file) {
      try {
        // Create a URL for the uploaded file
        const fileUrl = `${process.env.BASE_URL || ''}/uploads/${req.file.filename}`;
        updateData.image = fileUrl;
        console.log('Image uploaded successfully:', fileUrl);
      } catch (error) {
        console.error('Error handling image:', error);
        return res.status(500).json({
          success: false,
          message: "Error processing image",
          error: error.message
        });
      }
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      console.log('No fields to update');
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    console.log('Attempting to update user with data:', JSON.stringify(updateData, null, 2));

    // Update user
    const updatedUser = await updateUser(req.params.id, updateData);
    if (!updatedUser) {
      console.log('Failed to update user');
      return res.status(400).json({
        success: false,
        message: "Failed to update user"
      });
    }

    console.log('Successfully updated user:', JSON.stringify(updatedUser, null, 2));

    // Create notification if updated by admin
    if (req.params.id != req.user.id) {
      await createNotification({
        userID: req.params.id,
        title: "Account Updated",
        message: "Your account has been updated by admin",
        type: 'account',
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('=== Error in updateOneUser ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const deleteOneUser = async (req, res) => {
  try {
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await deleteUser(req.params.id);

    // Send notification
    await createNotification({
      userID: existingUser.id,
      title: "Account Deleted",
      message: "Your account has been deleted. If you have any concerns, please contact support.",
      type: "account",
    });

    // Send email notification
    await new Email(existingUser, { message: "Your account has been deleted." }).sendNotification();

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const activateOneUser = async (req, res) => {
  try {
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await activateUser(req.params.id);

    // Send notification
    await createNotification({
      userID: existingUser.id,
      title: "Account Activated",
      message: "Your account has been activated. You can now log in and use the platform.",
      type: "account",
    });

    // Send email notification
    await new Email(existingUser, { message: "Your account has been activated! now you can login to your dasshboard" }).sendNotification();

    return res.status(200).json({ success: true, message: "User activated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const deactivateOneUser = async (req, res) => {
  try {
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await deactivateUser(req.params.id);

    // Send notification
    await createNotification({
      userID: existingUser.id,
      title: "Account Deactivated",
      message: "Your account has been deactivated. Please contact support for assistance.",
      type: "account",
    });

    // Send email notification
    await new Email(existingUser, { message: "Your account has been deactivated." }).sendNotification();

    return res.status(200).json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};


export const checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your Email",
    });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "There is no account associated with that email",
      });
    }

    // Generate a random 6-digit code including time string
    const timestamp = Date.now().toString().slice(-3); // Get the last 3 digits of the timestamp
    const randomPart = Math.floor(100 + Math.random() * 900).toString(); // Get a 3-digit random number
    const code = timestamp + randomPart; // Combine both parts to form a 6-digit code


    await new Email(user, null, code).sendResetPasswordCode();
    const user1 = await updateUserCode(email, {code:code});

    return res.status(200).json({
      success: true,
      message: "Code sent to your email successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkCode = async (req, res) => {
  const { code } = req.body;
  if (!req.params.email) {
    return res.status(400).json({
      success: false,
      message: "Please provide your Email",
    });
  }

  try {
    const user = await getUserByCode(req.params.email,code);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "invalid code",
      });
    }

    return res.status(200).json({
      success: true,
      message: "now you can reset your password",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const ResetPassword = async (req, res) => {

  const user = await getUserByEmail(req.params.email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "There is no account associated with that email",
    });
  }
  if (!user.code) {
    return res.status(400).json({
      success: false,
      message: "No Reset Code",
    });
  }
  const { newPassword, confirmPassword } = req.body;
  if ( !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide newPassword, and confirmPassword",
    });
  }

  try {

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUser(user.id, { password: hashedPassword,code:'' });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully, Login",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAdminOverview = async (req, res) => {
  try {
    console.log("[INFO] Fetching system overview...");
    const users = await Users.findAll({
      attributes: ["role"],
      raw: true,
    });
    const userStats = {
      buyers: users.filter((u) => u.role === "buyer").length,
      sellers: users.filter((u) => u.role === "seller").length,
      admins: users.filter((u) => u.role === "admin").length,
      totalUsers: users.length,
    };

    // Product Statistics
    const products = await Products.findAll({
      attributes: ["status"],
      raw: true,
    });
    const productStats = products.reduce((acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    }, {});
    productStats.totalProducts = products.length;

    // Order Statistics
    const orders = await Orders.findAll({
      attributes: ["status", "totalAmount"],
      raw: true,
    });
    const orderStats = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalOrders += 1;
        acc.totalRevenue += parseFloat(order.totalAmount);
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0 }
    );

    // Category Statistics
    const categories = await Categories.findAll({
      include: [
        {
          model: Products,
          as: "Products",
          attributes: ["id"],
        },
      ],
    });



    // Profit from Refunded Orders (10% of refunded payments)
    const refundedPayments = await Payments.findAll({
      where: { status: "refunded" },
      attributes: ["amount"],
      raw: true,
    });

    const totalProfit = refundedPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount) * 0.1,
      0
    );

    console.log("[INFO] System overview fetched successfully.");

    return res.status(200).json({
      success: true,
      userStats,
      productStats,
      orderStats,
      totalProfit,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch system overview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSellerOverview = async (req, res) => {
  try {

    let role = req.user.role;
    if (role != "seller") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed seller!",
      });
    }
    const sellerId = req.user.id; // Logged-in user ID
    console.log(`[INFO] Fetching overview for seller ID: ${sellerId}`);

    // Check if the user is a seller
    const seller = await Users.findOne({ where: { id: sellerId, role: "seller" } });
    if (!seller) {
      console.log(`[ERROR] User ${sellerId} is not authorized to view seller stats.`);
      return res.status(403).json({ error: "Access denied. Only sellers can view this overview." });
    }

    // Get products listed by the seller
    const products = await Products.findAll({
      where: { userID: sellerId },
      attributes: ["status"],
      raw: true,
    });

    const productStats = products.reduce((acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    }, {});
    productStats.totalProducts = products.length;

    // Get orders for the seller's products
    const orders = await Orders.findAll({
      include: [
        {
          model: Products,
          as: "product",
          where: { userID: sellerId },
          attributes: [],
        },
      ],
      attributes: ["status", "totalAmount"],
      raw: true,
    });

    const orderStats = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalOrders += 1;
        acc.totalEarnings += order.status === "completed" ? parseFloat(order.totalAmount) : 0;
        return acc;
      },
      { totalOrders: 0, totalEarnings: 0 }
    );

    // Calculate 10% cut from refunded payments
    const refundedPayments = await Payments.findAll({
      where: { userID: sellerId, status: "refunded" },
      attributes: ["amount"],
      raw: true,
    });

    const totalRefundDeductions = refundedPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount) * 0.1,
      0
    );

    // Get total unpaid orders (status: "pending")
    const totalUnpaidOrders = orderStats["pending"] || 0;

    // Get total refunded orders (status: "refunded")
    const totalRefundedOrders = orderStats["refunded"] || 0;

    console.log(`[INFO] Seller overview fetched for seller ID: ${sellerId}`);

    return res.status(200).json({
      success: true,
      productStats,
      orderStats,
      totalRefundDeductions,
      totalUnpaidOrders,
      totalRefundedOrders,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch seller overview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getBuyerOverview = async (req, res) => {
  try {

    let role = req.user.role;
    if (role != "buyer") {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to add products",
      });
    }
    const buyerId = req.user.id; // Logged-in buyer ID
    console.log(`[INFO] Fetching overview for buyer ID: ${buyerId}`);

    // Check if the user is a buyer
    const buyer = await Users.findOne({ where: { id: buyerId, role: "buyer" } });
    if (!buyer) {
      console.log(`[ERROR] User ${buyerId} is not authorized to view buyer stats.`);
      return res.status(403).json({ error: "Access denied. Only buyers can view this overview." });
    }
    // userID
    // Get all orders placed by the buyer
    const orders = await Orders.findAll({
      where: { userID:buyerId },
      attributes: ["status", "totalAmount"],
      raw: true,
    });

    const orderStats = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        acc.totalOrders += 1;
        acc.totalSpent += order.status === "completed" ? parseFloat(order.totalAmount) : 0;
        acc.totalRefunded += order.status === "refunded" ? parseFloat(order.totalAmount) : 0;
        return acc;
      },
      { totalOrders: 0, totalSpent: 0, totalRefunded: 0 }
    );

    // Get total unpaid orders (status: "pending")
    const totalUnpaidOrders = orderStats["pending"] || 0;

    console.log(`[INFO] Buyer overview fetched for buyer ID: ${buyerId}`);

    return res.status(200).json({
      success: true,
      orderStats,
      totalSpent: orderStats.totalSpent,
      totalRefunded: orderStats.totalRefunded,
      totalUnpaidOrders,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch buyer overview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSellerSalesReport = async (req, res) => {
  try {
    const sellerId = req.user.id;
    console.log(`[INFO] Fetching sales report for seller ID: ${sellerId}`);

    // Check if the user is a seller
    const seller = await Users.findOne({ where: { id: sellerId, role: "seller" } });
    if (!seller) {
      console.log(`[ERROR] User ${sellerId} is not authorized to view sales reports.`);
      return res.status(403).json({ error: "Access denied. Only sellers can view this report." });
    }

    // Get completed orders for the seller's products
    const completedOrders = await Orders.findAll({
      include: [
        {
          model: Products,
          as: "product",
          where: { userID: sellerId },
          attributes: ["name", "price"],
        },
      ],
      where: { status: "completed" },
      attributes: ["id", "quantity", "totalAmount", "createdAt"],
      raw: true,
    });

    // Calculate total sales and total earnings
    const totalSales = completedOrders.length;
    const totalEarnings = completedOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Get refunded payments and their deductions (10% fee)
    const refundedPayments = await Payments.findAll({
      where: { userID: sellerId, status: "refunded" },
      attributes: ["amount"],
      raw: true,
    });
    const totalRefundDeductions = refundedPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount) * 0.1,
      0
    );

    // Get total unpaid orders (status: "pending")
    const totalUnpaidOrders = await Orders.count({
      include: [{ model: Products, as: "product", where: { userID: sellerId } }],
      where: { status: "pending" },
    });

    // Get total refunded orders
    const totalRefundedOrders = await Orders.count({
      include: [{ model: Products, as: "product", where: { userID: sellerId } }],
      where: { status: "refunded" },
    });

    console.log(`[INFO] Sales report generated for seller ID: ${sellerId}`);

    return res.status(200).json({
      success: true,
      report: completedOrders.map(order => ({
        orderId: order.id,
        productName: order["product.name"],
        quantity: order.quantity,
        totalAmount: order.totalAmount,
        orderDate: order.createdAt,
      })),
      totalSales,
      totalEarnings,
      totalRefundDeductions,
      totalUnpaidOrders,
      totalRefundedOrders,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch sales report:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Check if the user exists
    const existingUser = await getUser(req.user.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Validate and prepare update data
    const updateData = {};
    const allowedFields = ['firstname', 'lastname', 'phone', 'gender'];
    
    // Handle text fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        updateData[field] = req.body[field];
      }
    });

    // Handle image upload if present
    if (req.files && req.files.image) {
      try {
        const uploadResult = await imageUploader(req);
        if (uploadResult && uploadResult.url) {
          updateData.image = uploadResult.url;
        }
      } catch (error) {
        console.error('Image upload error:', error);
        return res.status(400).json({
          success: false,
          message: "Failed to upload image"
        });
      }
    }

    // If no valid fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    // Update user
    const updatedUser = await updateUser(req.user.id, updateData);
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Failed to update profile"
      });
    }

    // Get fresh user data
    const user = await getUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



