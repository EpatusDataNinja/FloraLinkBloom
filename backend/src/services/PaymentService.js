import db from "../database/models/index.js";
import paypack from "../config/paypackConfig";
import axios from "axios";

const Payments = db["Payments"];
const Orders = db["Orders"];
const Products = db["Products"];
const users = db["Users"];


/**
 * Waits for transaction approval but only for 2 minutes.
 */
const waitForApproval = async (transactionId) => {
  const maxWaitTime = 120000; // 2 minutes
  const checkInterval = 5000; // Check every 5 seconds

  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const interval = setInterval(async () => {
      try {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime >= maxWaitTime) {
          clearInterval(interval);
          reject(new Error("Payment timeout: User did not approve in 2 minutes"));
          return;
        }

        const response = await paypack.events({ offset: 0, limit: 100 });
        const events = response.data.transactions;

        const transactionEvent = events.find(
          (event) =>
            event.data.ref === transactionId &&
            event.event_kind === "transaction:processed"
        );

        if (transactionEvent) {
          clearInterval(interval);
          resolve(transactionEvent);
        }
      } catch (error) {
        clearInterval(interval);
        reject(new Error("Payment check failed"));
      }
    }, checkInterval);
  });
};

/**
 * Process payment and wait for approval.
 */
export const processPayment = async (userID, number, amount) => {
  try {
    // Initiate payment request
    const response = await paypack.cashin({
      number,
      amount,
      environment: "development",
    });

    console.log("Transaction initiated:", response.data);
    const transactionId = response.data.ref;

    // Wait for approval (max 2 minutes)
    const approval = await Promise.race([
      waitForApproval(transactionId),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Payment timeout")), 120000))
    ]);

    // Payment successful, save transaction record
    await Payments.create({
      userID,
      amount,
      paymentMethod: "paypack",
      status: "paid",
    });

    return { success: true, transactionId };
  } catch (error) {
    console.error("Payment processing error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Process payment for cart items
 */
export const processCartPayment = async (userID, number, amount, items, orderDetails) => {
  try {
    console.log("Processing cart payment:", { userID, number, amount, items });

    // First create the order(s)
    const orders = await Promise.all(orderDetails.map(async (order) => {
      // Calculate total amount for this specific order
      const orderItem = items.find(item => item.productId === order.productID);
      const totalAmount = orderItem ? orderItem.price * order.quantity : 0;

      const newOrder = await Orders.create({
        userID,
        productID: order.productID,
        quantity: order.quantity,
        status: 'pending',
        shippingAddress: order.shippingAddress,
        number: order.number,
        totalAmount: totalAmount // Add the total amount for this order
      });
      return newOrder;
    }));

    // Initiate payment request
    const response = await paypack.cashin({
      number,
      amount,
      environment: process.env.NODE_ENV === "production" ? "production" : "development",
    });

    console.log("Paypack response:", response.data);
    const transactionId = response.data.ref;

    try {
      // Wait for approval
      const approval = await waitForApproval(transactionId);
      console.log("Payment approved:", approval);

      // Create payment record with order references
      const payment = await Payments.create({
        userID,
        amount,
        paymentMethod: "paypack",
        status: "paid",
        transactionId,
        orderID: orders[0].id, // Reference to first order
        items: JSON.stringify({
          orders: orders.map(order => ({
            id: order.id,
            amount: order.totalAmount
          })),
          products: items
        })
      });

      // Update orders with payment information and confirm status
      await Promise.all(orders.map(order => 
        Orders.update(
          { 
            status: 'paid',
            paymentID: payment.id 
          },
          { where: { id: order.id } }
        )
      ));

      return {
        success: true,
        paymentId: payment.id,
        transactionId,
        orderIds: orders.map(order => order.id),
        message: "Payment and orders processed successfully"
      };
    } catch (error) {
      // If payment fails, mark orders as failed
      await Promise.all(orders.map(order => 
        Orders.update(
          { status: 'failed' },
          { where: { id: order.id } }
        )
      ));
      
      console.error("Payment approval error:", error);
      throw new Error(error.message || "Payment approval failed");
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    throw new Error(error.message || "Payment processing failed");
  }
};

// Add a new method to update payment with order
export const updatePaymentWithOrder = async (paymentId, orderId) => {
  try {
    await Payments.update(
      { orderID: orderId },
      { where: { id: paymentId } }
    );
    return true;
  } catch (error) {
    console.error("Error updating payment with order:", error);
    return false;
  }
};

/**
 * Get all payments for a user.
 */
export const getAllPayments = async () => {
  try {
    return await Payments.findAll(
      {
        include: [
          {
            model: Orders,
            as: "order",
            include: [
              {
                model: Products,
                as: "product",
                
              }
            ]

          },
          {
            model: users,
            as: "payer",
            
          }

        ]
      }
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  };
}