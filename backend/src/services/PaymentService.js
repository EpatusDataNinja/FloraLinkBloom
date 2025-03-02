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