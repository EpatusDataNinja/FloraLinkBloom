import { 
  createOrder, 
  getAllOrders,
  getoneorder,
  updateOrder,
  getAllOrders_by_bayer,
  getAllOrders_by_seller

 } from "../services/OrdersService.js";

 import {
  getUser,
} from "../services/userService.js";
 import { sendNotification,createNotification } from "../services/NotificationService.js";
import db from "../database/models/index.js";
import paypack from "../config/paypackConfig";
import Email from "../utils/mailer.js";
const Orders = db["Orders"];
const Products = db["Products"];
const Payments = db["Payments"];
const Notification = db["Notifications"];
const Users = db["Users"];


/**
 * Handle order creation and payment processing
 */
const createOrder1 = async (req, res) => {
  try {
    const { productID, quantity, number } = req.body;
    const userID = req.user.id; // Assuming authentication middleware provides user

    if (!productID || !quantity || !number) {
      console.log("[ERROR] Missing required fields.");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`[INFO] Checking product availability for ID: ${productID}`);
    const product = await Products.findByPk(productID);
    if (!product) {
      console.log(`[ERROR] Product ${productID} not found.`);
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < quantity) {
      console.log(`[ERROR] Insufficient stock for product ${productID}. Available: ${product.quantity}, Requested: ${quantity}`);
      return res.status(400).json({ error: "Insufficient stock" });
    }

    const totalAmount = product.price * quantity;
    console.log(`[INFO] Initiating payment for user ${userID}. Amount: ${totalAmount}`);

    // Initiate payment request
    const paymentResponse = await paypack.cashin({
      number,
      amount: totalAmount,
      environment: "development",
    });

    console.log("[INFO] Transaction initiated:", paymentResponse.data);
    const transactionId = paymentResponse.data.ref;

    console.log(`[INFO] Waiting for user approval on transaction: ${transactionId}`);

    // Wait for user to approve payment (max 2 minutes)
    const paymentResult = await waitForPaymentApproval(transactionId);

    if (!paymentResult.success) {
      console.log(`[ERROR] Payment failed or timed out for transaction: ${transactionId}`);
      return res.status(400).json({ error: "Payment failed or timed out" });
    }

    console.log("[INFO] Payment approved! Creating order...");

    // Payment successful, create order
    const order = await Orders.create({
      userID,
      productID,
      quantity,
      totalAmount,
      status: "paid",
    });



// notify each , seller,admins, confirmetion to buyer make order and payed,....

const result = totalAmount * 0.9;
// console.log(`90% of ${amount} is ${result}`);


 // Fetch buyer and seller details
 const buyer = await Users.findByPk(userID);
 const seller = await Users.findByPk(product.userID); // Assuming `product.userID` is the seller's ID
 const admin = await Users.findOne({ where: { role: "admin" } });

 // Send notifications
 await sendNotification({
   user: req.user,
   title: "Order Confirmation",
   message: `Hi ${req.user.name}, your order for ${product.name} has been placed successfully. The total amount paid is ${totalAmount} Rwf.`,
   type: "order",
 });

 await sendNotification({
   user: seller,
   title: "New Order Received",
   message: `Hello, a new order has been placed for your product ${product.name}.Quantity ${quantity}. Amount: Rwf ${totalAmount}. Please prepare for delivery.`,
   type: "order",
 });

 if (admin) {
   await sendNotification({
     user: admin,
     title: "New Order Alert",
     message: `Admin Alert: A new order has been placed. Product: ${product.name},
      Amount: Rwf ${totalAmount}. check in system for more details ! and continiew to check any time 
     seller can be mark as delivered ! you can refund seller 90% which is Rwf${result}`,
     type: "order",
   });
 }















    // Reduce product stock after order creation
    await Products.update(
      { quantity: product.quantity - quantity },
      { where: { id: productID } }
    );

    console.log(`[INFO] Order created successfully: ${order.id}`);

    // Record successful payment
    await Payments.create({
      userID,
      orderID: order.id,
      amount: totalAmount,
      paymentMethod: "paypack",
      status: "paid",
    });

    console.log(`[INFO] Payment recorded successfully for order: ${order.id}`);

    return res.status(201).json({
      success: true,
      message: "Order successfully created and payment confirmed",
      order,
    });
  } catch (error) {
    console.error("[ERROR] Order creation failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Waits for user payment approval within 2 minutes.
 */
const waitForPaymentApproval = async (transactionId) => {
  const maxWaitTime = 60000; // 1 minute
  const checkInterval = 15000; // Check every 15 seconds

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`[INFO] Checking payment status every ${checkInterval / 1000} seconds for transaction: ${transactionId}`);

    const interval = setInterval(async () => {
      try {
        const elapsedTime = Date.now() - startTime;
        console.log(`[INFO] Checking Paypack transactions for transaction: ${transactionId}...`);

        const response = await paypack.events({ offset: 0, limit: 100 });
        const events = response.data.transactions;

        const transactionEvent = events.find(
          (event) =>
            event.data.ref === transactionId &&
            event.event_kind === "transaction:processed"
        );

        if (transactionEvent) {
          console.log(`[SUCCESS] Payment confirmed for transaction: ${transactionId}`);
          clearInterval(interval);
          resolve({ success: true, transactionId });
          return;
        }

        if (elapsedTime >= maxWaitTime) {
          console.log(`[ERROR] Payment timeout: No approval for transaction: ${transactionId}`);
          clearInterval(interval);
          reject({ success: false, message: "Payment timeout: User did not approve within 1 minute" });
        }
      } catch (error) {
        console.error(`[ERROR] Failed to check payment status for transaction: ${transactionId}`, error);
        clearInterval(interval);
        reject({ success: false, message: "Payment check failed" });
      }
    }, checkInterval);
  });
};



// export const checkoutOrder = async (req, res) => {
//   try {
//     const orderID = req.params.id;

//     // Retrieve the order
//     let orders = await getAllOrders();
//     const order = orders.find(order => order.id == orderID);

//     if (!order) {
//       console.log(`[ERROR] Order ${orderID} not found.`);
//       return res.status(404).json({ error: "Order not found" });
//     }

//     if (order.status === "refunded") {
//       console.log(`[ERROR] Order ${orderID} is already refunded.`);
//       return res.status(400).json({ error: "Order already refunded" });
//     }

//     const sellerPhone = order.product.user.phone;
//     const totalAmount = parseFloat(order.totalAmount);
//     const refundAmount = totalAmount * 0.9; // 90% to seller

//     console.log(`[INFO] Initiating refund of ${refundAmount} to seller: ${sellerPhone}`);

//     // Initiate refund via Paypack
//     const refundResponse = await paypack.cashout({
//       number: sellerPhone,
//       amount: refundAmount,
//       environment: "development",
//     });

//     console.log("[INFO] Refund transaction initiated:", refundResponse.data);
//     const transactionId = refundResponse.data.ref;

//     console.log(`[INFO] Waiting for transaction confirmation: ${transactionId}`);

//     // Wait for transaction approval
//     const refundResult = await waitForPaymentApproval(transactionId);

//     if (!refundResult.success) {
//       console.log(`[ERROR] Refund failed or timed out for transaction: ${transactionId}`);
//       return res.status(400).json({ error: "Refund failed or timed out" });
//     }

//     console.log("[INFO] Refund approved! Updating order status...");

//     // Update order status to refunded
//     await Orders.update({ status: "refunded" }, { where: { id: orderID } });

//     console.log(`[INFO] Order ${orderID} marked as refunded.`);

//     return res.status(200).json({
//       success: true,
//       message: "Refund processed successfully",
//       orderID,
//       refundAmount,
//       sellerPhone,
//     });

//   } catch (error) {
//     console.error("[ERROR] Checkout failed:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



const checkoutOrder = async (req, res) => {
  try {
    const { id } = req.params; // Order ID from request params

    console.log(`[INFO] Fetching order ID: ${id}`);
    let order = await Orders.findOne({
      where: { id },
      include: [
        {
          model: Products,
          as: "product",
          include: [
            {
              model: db.Users,
              as: "user", // Seller info
              attributes: ["phone", "id"],
            },
          ],
        },
      ],
    });

    if (!order) {
      console.log(`[ERROR] Order ${id} not found.`);
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "delivered") {
      console.log(`[ERROR] Order ${id} is not eligible for checkout.`);
      return res.status(400).json({ error: "Only delivered orders can be checked out" });
    }

    const totalAmount = parseFloat(order.totalAmount);
    const refundAmount = totalAmount * 0.9; // Seller gets 90%
    const sellerPhone = order.product.user.phone;
    const sellerId = order.product.user.id;

    console.log(`[INFO] Initiating refund of ${refundAmount} to seller ${sellerPhone}`);

    // Process refund through Paypack
    const refundResponse = await paypack.cashout({
      number: sellerPhone,
      amount: refundAmount,
      environment: "development",
    });

    console.log("[INFO] Refund transaction initiated:", refundResponse.data);
    const transactionId = refundResponse.data.ref;

    // // Wait for approval
    const refundResult = await waitForPaymentApproval(transactionId);

    if (!refundResult.success) {
      console.log(`[ERROR] Refund failed or timed out for transaction: ${transactionId}`);
      return res.status(400).json({ error: "Refund failed or timed out" });
    }

    console.log("[INFO] Refund successful! Updating order status...");

    // Update order status
    await Orders.update(
      { status: "completed" },
      { where: { id } }
    );

    console.log(`[INFO] Order ${id} marked as completed.`);

    // Save refund transaction
    await Payments.create({
      userID: sellerId,
      orderID: id,
      amount: refundAmount,
      paymentMethod: "paypack",
      status: "refunded",
    });

    // console.log(order.id);
    // console.log(sellerId);


    
    const buyer = await Users.findOne({ where: { id: order.userID } });
    const seller = await Users.findOne({ where: { id:sellerId } });

    // Send notification
    await createNotification({
      userID: order.userID,
      title: "Order Status Updated",
      message: `Your order status has been changed to completed !.`,
      type: "order",
      isRead: false,
    });

    // Send email notification to buyer
    console.log("Sending email to buyer:", buyer.email);
    await new Email(buyer, { 
      message: `Your order status has been changed to completed!`,
      title: "Order Completed"
    }).sendNotification();


        // Send notification
        await createNotification({
          userID: sellerId,
          title: "payment done !",
          message: `your order has been re-founded successfully, total amount of ${refundAmount} Rwf and we cut 10% as recharge ! !.`,
          type: "order",
          isRead: false,
        });
    
        // Send email notification to buyer
        console.log("Sending email to seller:", seller.email);
        await new Email(seller, { 
          message: `Your order has been refunded successfully, total amount of ${refundAmount} Rwf and we cut 10% as recharge!`,
          title: "Payment Refund"
        }).sendNotification();
    




    console.log(`[INFO] Refund recorded successfully for order: ${id}`);

    return res.status(200).json({
      success: true,
      message: "Order checked out and seller refunded successfully",
      refundAmount,
      sellerPhone,
    });

  } catch (error) {
    console.error("[ERROR] Checkout failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




const createOrder11 = async (req, res) => {
  try {
    const { productID, quantity, number } = req.body;
    const userID = req.user.id; // Assuming you have authentication middleware

    if (!productID || !quantity || !number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await createOrder(userID, productID, quantity, number);

    res.status(201).json({
      success: true,
      message: "Order created, waiting for payment confirmation",
      order,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    let orders = [];
    
    if (req.user.role === "admin") {
      orders = await getAllOrders();
    }

    if (req.user.role === "buyer") {
      orders = await getAllOrders_by_bayer(req.user.id);
    }

    if (req.user.role === "seller") {
      const allOrders = await getAllOrders();
      orders = allOrders.filter(order => order.product.userID === req.user.id);
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const get_one_order = async (req, res) => {
  try {
    let orders = [];
    
    if (req.user.role === "admin") {
      orders = await getAllOrders();
      orders = orders.filter(order => order.id== req.params.id);
    }

    if (req.user.role === "buyer") {
      orders = await getAllOrders_by_bayer(req.user.id);
    }

    if (req.user.role === "seller") {
      const allOrders = await getAllOrders();
      orders = allOrders.filter(order => order.product.userID === req.user.id);
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};


const changeOrderStatus = async (req, res) => {
  try {
    const order = await getoneorder(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let order1 = await Orders.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Products,
          as: "product",
          include: [
            {
              model: db.Users,
              as: "user", // Seller info
              attributes: ["phone", "id", "email"],
            },
          ],
        },
      ],
    });

    const update = await updateOrder(req.params.id, { status: req.body.status });

    const buyer = await Users.findOne({ where: { id: order1.userID } });

    // Send notification
    await createNotification({
      userID: order1.userID,
      title: "Order Status Updated",
      message: `Your order status has been changed to ${req.body.status}.`,
      type: "order",
      isRead: false,
    });

    // Send email notification to buyer
    console.log("Sending email to buyer:", buyer.email);
    await new Email(buyer, { 
      message: `Your order status has been changed to ${req.body.status}!`,
      title: "Order Status Update"
    }).sendNotification();

    if (req.body.status === 'delivered') {
      const admins = await Users.findAll({ where: { role: "admin" } });

      for (const admin of admins) {
        // Admin notifications
        await Notification.create({
          userID: admin.id,
          title: "Order status!",
          message: `New Order status has changed to ${req.body.status}. Now you can refund seller.`,
          type: "admin",
        });

        // Send email to admin
        console.log("Sending email to admin:", admin.email);
        await new Email(admin, { message: `New Order status has changed to ${req.body.status}. Now you can refund seller.` }).sendNotification();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status changed successfully",
    });
  } catch (error) {
    console.error("Error changing order status:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

const getBuyerDashboardStats = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get order statistics
    const [totalOrders, pendingOrders, deliveredOrders, totalSpent] = await Promise.all([
      Orders.count({
        where: { userID }
      }),
      Orders.count({
        where: { 
          userID,
          status: 'pending'
        }
      }),
      Orders.count({
        where: { 
          userID,
          status: 'delivered'
        }
      }),
      Orders.sum('totalAmount', {
        where: { 
          userID,
          status: ['delivered', 'shipped']
        }
      })
    ]);

    // Get recent orders
    const recentOrders = await Orders.findAll({
      where: { userID },
      include: [{
        model: Products,
        as: 'product',
        attributes: ['name', 'image']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get recently viewed products
    const recentProducts = await Products.findAll({
      where: { 
        status: 'In Stock'
      },
      order: [['updatedAt', 'DESC']],
      limit: 4,
      attributes: ['id', 'name', 'price', 'image', 'quantity']
    });

    // Format the response
    return res.status(200).json({
      success: true,
      data: {
        orderStats: {
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalSpent: totalSpent || 0,
          totalUnpaidOrders: pendingOrders, // Same as pendingOrders for now
          totalRefunded: 0 // Add actual refunded count if you have this data
        },
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          product: order.product ? {
            name: order.product.name,
            image: order.product.image
          } : null
        })),
        recentProducts: recentProducts.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: product.quantity
        }))
      }
    });

  } catch (error) {
    console.error('Error in getBuyerDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

const addOrderController = async (req, res) => {
  // Your existing code
};

export {
  getBuyerDashboardStats,
  addOrderController,
  getAllOrdersController,
  createOrder1,
  changeOrderStatus,
  get_one_order,
  checkoutOrder
};



