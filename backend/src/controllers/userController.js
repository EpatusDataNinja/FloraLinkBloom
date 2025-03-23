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
  let transaction;
  try {
    // Log the database connection status
    console.log("Database connection status:", db.sequelize?.connectionManager?.pool?.length ? "Connected" : "Not connected");
    
    // Ensure database connection is established
    if (!db.sequelize) {
      console.error("Database connection not established. DB object:", JSON.stringify(db, null, 2));
      throw new Error("Database connection not established");
    }

    // Start transaction
    transaction = await db.sequelize.transaction();
    console.log("Starting signup process with transaction:", transaction.id);
    
    // Log the request body (excluding password)
    const logSafeBody = { ...req.body };
    delete logSafeBody.password;
    console.log("Request body:", logSafeBody);
    
    // Validate required fields
    const requiredFields = ['role', 'firstname', 'lastname', 'email', 'phone', 'address', 'gender', 'password'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check for existing email
    const existingEmail = await Users.findOne({
      where: { email: req.body.email }
    });

    if (existingEmail) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Check for existing phone
    const existingPhone = await Users.findOne({
      where: { phone: req.body.phone }
    });

    if (existingPhone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Phone number already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user with transaction
    const userData = {
      ...req.body,
      password: hashedPassword,
      status: "inactive"
    };

    const newUser = await Users.create(userData, { transaction });

    // Create notifications with transaction
    await Notification.create({
      userID: newUser.id,
      title: "Account Pending Approval",
      message: "Your account is awaiting admin approval. You will be notified once it is reviewed.",
      type: "account",
      isRead: false
    }, { transaction });

    // Find admins
    const admins = await Users.findAll({
      where: { role: "admin" },
      attributes: ['id', 'email', 'firstname', 'lastname'],
      transaction
    });

    // Create admin notifications with transaction
    for (const admin of admins) {
      await Notification.create({
        userID: admin.id,
        title: "New User Registration",
        message: `New ${req.body.role} account requires approval: ${req.body.firstname} ${req.body.lastname}`,
        type: "admin_approval",
        isRead: false
      }, { transaction });
    }

    // Commit transaction
    await transaction.commit();
    console.log("Transaction committed successfully");

    // Send emails (non-blocking)
    Promise.all([
      new Email(newUser, {
        message: "Your account is pending approval. You will be notified once reviewed.",
        title: "Account Registration"
      }).sendNotification(),
      ...admins.map(admin => 
        new Email(admin, {
          message: `A new user (${req.body.role}) named ${req.body.firstname} ${req.body.lastname} has registered and requires your approval.`,
          title: "New User Registration"
        }).sendNotification()
      )
    ]).catch(error => {
      console.error("Email sending error:", error);
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role,
        gender: newUser.gender,
        phone: newUser.phone
      }
    });

  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Rollback transaction if it exists
    if (transaction) {
      try {
        await transaction.rollback();
        console.log("Transaction rolled back successfully");
      } catch (rollbackError) {
        console.error("Transaction rollback failed:", rollbackError);
      }
    }

    // Handle specific errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: `This ${error.errors[0].path} is already registered`
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user account",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    await new Email(newUser, {
      title: "Welcome to FloraLink",
      message: "Your account has been created successfully."
    }).sendAccountAdded();

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
    console.log('=== Starting User Update ===');
    console.log('User ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Validate user ID
    if (!req.params.id) {
      console.error('No user ID provided');
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    let image; 
    if (req.file) {
      try {
        console.log('Processing image upload...');
        image = await imageUploader(req);
        if (!image || !image.url) {
          throw new Error('Upload failed or image URL missing');
        }
        req.body.image = image.url;
        console.log('Image uploaded successfully:', image.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(400).json({
          success: false,
          message: "Failed to upload image",
          error: error.message
        });
      }
    }

    console.log('Updating user with data:', req.body);
    const user = await updateUser(req.params.id, req.body);
    
    if (!user) {
      console.error('User not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log('User updated successfully:', user);

    if(req.params.id != req.user.id) {
      const notification = await createNotification({ 
        userID: req.params.id,
        title: "Your account has been updated", 
        message: "Your account has been edited by admin", 
        type: 'account', 
        isRead: false 
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message
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
    await new Email(existingUser, { 
      message: "Your account has been deleted.",
      title: "Account Deleted"
    }).sendNotification();

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

export const activateOneUser = async (req, res) => {
  try {
    console.log('[INFO] Starting user activation process for ID:', req.params.id);
    
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      console.log('[ERROR] User not found for activation:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (existingUser.status === 'active') {
      console.log('[INFO] User is already active:', req.params.id);
      return res.status(200).json({
        success: true,
        message: "User is already active",
        user: existingUser
      });
    }

    const activatedUser = await activateUser(req.params.id);
    if (!activatedUser) {
      console.log('[ERROR] Failed to activate user:', req.params.id);
      return res.status(400).json({
        success: false,
        message: "Failed to activate user"
      });
    }

    // Create notification for the user
    await db["Notifications"].create({
      userID: existingUser.id,
      title: "Account Activated",
      message: "Your account has been activated. You can now log in to the platform.",
      type: "account_status",
      isRead: false
    });

    // Send email notification
    try {
      await new Email(existingUser, { 
        message: "Your account has been activated! You can now log in to your dashboard.",
        title: "Account Activated"
      }).sendNotification();
    } catch (emailError) {
      console.error('[WARN] Failed to send activation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('[INFO] Successfully activated user:', req.params.id);
    return res.status(200).json({ 
      success: true, 
      message: "User activated successfully",
      user: activatedUser
    });
  } catch (error) {
    console.error('[ERROR] Activation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const deactivateOneUser = async (req, res) => {
  try {
    console.log('[INFO] Starting user deactivation process for ID:', req.params.id);
    
    const existingUser = await getUser(req.params.id);
    if (!existingUser) {
      console.log('[ERROR] User not found for deactivation:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (existingUser.status === 'inactive') {
      console.log('[INFO] User is already inactive:', req.params.id);
      return res.status(200).json({
        success: true,
        message: "User is already inactive",
        user: existingUser
      });
    }

    const deactivatedUser = await deactivateUser(req.params.id);
    if (!deactivatedUser) {
      console.log('[ERROR] Failed to deactivate user:', req.params.id);
      return res.status(400).json({
        success: false,
        message: "Failed to deactivate user"
      });
    }

    // Create notification for the user
    await db["Notifications"].create({
      userID: existingUser.id,
      title: "Account Deactivated",
      message: "Your account has been deactivated. Please contact support for assistance.",
      type: "account_status",
      isRead: false
    });

    // Send email notification
    try {
      await new Email(existingUser, { 
        message: "Your account has been deactivated. Please contact support if you need assistance.",
        title: "Account Deactivated"
      }).sendNotification();
    } catch (emailError) {
      console.error('[WARN] Failed to send deactivation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('[INFO] Successfully deactivated user:', req.params.id);
    return res.status(200).json({ 
      success: true, 
      message: "User deactivated successfully",
      user: deactivatedUser
    });
  } catch (error) {
    console.error('[ERROR] Deactivation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
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
    
    // Get current date and last month's date
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // User Statistics
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

    // Calculate Total Platform Revenue (10% of all completed orders)
    const completedOrders = await Orders.findAll({
      where: {
        status: 'completed'
      },
      attributes: [
        'totalAmount'
      ],
      raw: true
    });

    const totalPlatformRevenue = completedOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.totalAmount) * 0.1); // 10% of each completed order
    }, 0);

    // Current Month Revenue
    const currentMonthRevenue = await Orders.sum('totalAmount', {
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [firstDayOfMonth, lastDayOfMonth]
        },
        status: 'completed'
      }
    }) || 0;

    // Last Month Revenue
    const lastMonthRevenue = await Orders.sum('totalAmount', {
      where: {
        createdAt: {
          [db.Sequelize.Op.between]: [firstDayOfLastMonth, lastDayOfLastMonth]
        },
        status: 'completed'
      }
    }) || 0;

    // Calculate Growth
    const growth = lastMonthRevenue === 0 
      ? '100%' 
      : `${(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)}%`;

    // Order Statistics
    const orderStats = await Orders.findAll({
      attributes: [
        [db.Sequelize.fn('COUNT', db.Sequelize.col('*')), 'totalOrders'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal("CASE WHEN status = 'completed' THEN 1 ELSE 0 END")), 'completed'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal("CASE WHEN status = 'pending' THEN 1 ELSE 0 END")), 'pending'],
        [db.Sequelize.fn('SUM', db.Sequelize.literal("CASE WHEN status = 'processing' THEN 1 ELSE 0 END")), 'processing'],
        [db.Sequelize.fn('SUM', db.Sequelize.col('totalAmount')), 'totalRevenue']
      ],
      raw: true
    });

    return res.status(200).json({
      success: true,
      userStats,
      productStats,
      orderStats: {
        ...orderStats[0],
        totalOrders: parseInt(orderStats[0].totalOrders) || 0,
        completed: parseInt(orderStats[0].completed) || 0,
        pending: parseInt(orderStats[0].pending) || 0,
        processing: parseInt(orderStats[0].processing) || 0,
        totalRevenue: parseFloat(orderStats[0].totalRevenue) || 0
      },
      revenueStats: {
        monthlyRevenue: currentMonthRevenue,
        growth,
        platformFees: totalPlatformRevenue.toFixed(2) // Total platform revenue from all completed orders
      }
    });

  } catch (error) {
    console.error("[ERROR] Failed to fetch system overview:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message 
    });
  }
};

export const getSellerOverview = async (req, res) => {
  try {
    console.log('[INFO] Getting seller overview. User:', req.user);
    
    // Check if user exists and has a role
    if (!req.user) {
      console.error('[ERROR] No user object in request');
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!req.user.role) {
      console.error('[ERROR] User has no role:', req.user);
      return res.status(400).json({
        success: false,
        message: "User role not found"
      });
    }

    // Check if user is a seller
    if (req.user.role !== "seller") {
      console.error('[ERROR] User is not a seller:', req.user.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Only sellers can view this overview."
      });
    }

    const sellerId = req.user.id;
    if (!sellerId) {
      console.error('[ERROR] User has no ID:', req.user);
      return res.status(400).json({
        success: false,
        message: "User ID not found"
      });
    }

    console.log(`[INFO] Fetching overview for seller ID: ${sellerId}`);

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
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

export const getBuyerOverview = async (req, res) => {
  try {
    console.log('[INFO] Getting buyer overview. User:', req.user);
    
    // Check if user exists and has a role
    if (!req.user) {
      console.error('[ERROR] No user object in request');
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!req.user.role) {
      console.error('[ERROR] User has no role:', req.user);
      return res.status(400).json({
        success: false,
        message: "User role not found"
      });
    }

    // Check if user is a buyer
    if (req.user.role !== "buyer") {
      console.error('[ERROR] User is not a buyer:', req.user.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Only buyers can view this overview."
      });
    }

    const buyerId = req.user.id;
    if (!buyerId) {
      console.error('[ERROR] User has no ID:', req.user);
      return res.status(400).json({
        success: false,
        message: "User ID not found"
      });
    }

    console.log(`[INFO] Fetching overview for buyer ID: ${buyerId}`);

    // Get all orders placed by the buyer
    const orders = await Orders.findAll({
      where: { userID: buyerId },
      attributes: ["status", "totalAmount"],
      raw: true,
    });

    console.log(`[INFO] Found ${orders.length} orders for buyer`);

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

    console.log(`[INFO] Buyer overview fetched successfully for buyer ID: ${buyerId}`);

    return res.status(200).json({
      success: true,
      orderStats,
      totalSpent: orderStats.totalSpent,
      totalRefunded: orderStats.totalRefunded,
      totalUnpaidOrders,
    });
  } catch (error) {
    console.error("[ERROR] Failed to fetch buyer overview:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
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



