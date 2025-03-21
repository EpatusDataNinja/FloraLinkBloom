import {
    getAllPayments,
    processCartPayment,
    updatePaymentWithOrder
} from "../services/PaymentService.js";
import Email from "../utils/mailer.js";
import db from "../database/models/index.js";
const Users = db["Users"];

export const paymentController = async (req, res) => {
  try {
    let data =  await getAllPayments();
    if (req.user.role == "admin") {
        data = data;
        }
    if (req.user.role === "buyer") {
        data = data.filter(payment => payment.userID === req.user.id);
        }
    if (req.user.role === "seller") {
        data = data.filter(payment => payment.order.product.userID === req.user.id);
        }



    // if (!req.user) {
    //   // If the user is not logged in, return all public posts
    //   data = await generalproducts_available(); // Adjust this function to return only public posts if needed
    //   return res.status(200).json({
    //     success: true,
    //     message: "Public products retrieved successfully",
    //     data,
    //   });
    // }
    // const userID = req.user.id; // Get logged-in user's ID
    // if (req.user.role == "admin") {
    //   data = await generalproducts();
    // }
    // if (req.user.role == "seller") {
    //   data = await getAllProductses(userID);
    // }
    // if (req.user.role == "buyer") {
    //   data = await generalproducts_available();
    // }


    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No payment found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
};

// Add new controller for processing cart payments
export const processCartPaymentController = async (req, res) => {
  try {
    const { amount, number, items, orderDetails } = req.body;
    const userID = req.user.id;

    if (!amount || !number || !items || !orderDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information"
      });
    }

    // Validate that all required data is present
    const isValidData = orderDetails.every(order => 
      order.productID && 
      order.quantity && 
      order.price && 
      order.shippingAddress && 
      order.number
    );

    if (!isValidData) {
      return res.status(400).json({
        success: false,
        message: "Invalid order details provided"
      });
    }

    console.log("Processing payment request:", { amount, number, items, orderDetails });

    const result = await processCartPayment(userID, number, amount, items, orderDetails);

    // Get the buyer's information
    const buyer = await Users.findByPk(userID);
    if (buyer) {
      // Send payment confirmation email
      try {
        await new Email(buyer, {
          message: `Your payment of ${amount} Rwf has been processed successfully. Order IDs: ${result.orderIds.join(', ')}`,
          title: "Payment Confirmation"
        }).sendNotification();
      } catch (emailError) {
        console.error("Error sending payment confirmation email:", emailError);
        // Don't throw error, continue with response
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment and orders processed successfully",
      paymentId: result.paymentId,
      transactionId: result.transactionId,
      orderIds: result.orderIds
    });
  } catch (error) {
    console.error("Payment controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error processing payment"
    });
  }
};

export const updatePaymentOrderController = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    
    if (!paymentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Order ID are required"
      });
    }

    const updated = await updatePaymentWithOrder(paymentId, orderId);

    if (updated) {
      // Get the payment details including user information
      const payment = await db.Payments.findOne({
        where: { id: paymentId },
        include: [{
          model: Users,
          as: 'user'
        }]
      });

      if (payment && payment.user) {
        // Send payment update email
        try {
          await new Email(payment.user, {
            message: `Your payment (ID: ${paymentId}) has been updated with order ID: ${orderId}`,
            title: "Payment Update"
          }).sendNotification();
        } catch (emailError) {
          console.error("Error sending payment update email:", emailError);
          // Don't throw error, continue with response
        }
      }

      return res.status(200).json({
        success: true,
        message: "Payment updated with order ID"
      });
    } else {
      throw new Error("Failed to update payment");
    }
  } catch (error) {
    console.error("Error updating payment with order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating payment with order"
    });
  }
};
