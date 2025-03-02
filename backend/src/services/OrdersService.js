import db from "../database/models/index.js";
import { processPayment } from "./PaymentService.js";

const Orders = db["Orders"];
const Products = db["Products"];

export const createOrder = async (userID, productID, quantity, number) => {
  // Check if product exists
  const product = await Products.findByPk(productID);
  if (!product) throw new Error("Product not found");

  // Check stock availability
  if (product.quantity < quantity) throw new Error("Insufficient stock");

  // Calculate total amount
  const totalAmount = product.price * quantity;

  // Process payment before creating the order
  const paymentResult = await processPayment(userID, number, totalAmount);

  if (!paymentResult.success) {
    throw new Error("Payment failed or timed out");
  }

  // Payment successful, create the order in the database
  const order = await Orders.create({
    userID,
    productID,
    quantity,
    totalAmount,
    status: "paid",
  });

  // Reduce product stock after order creation
  await Products.update(
    { quantity: product.quantity - quantity },
    { where: { id: productID } }
  );

  return order;
};


export const updateOrder = async (id, order) => {
  const orderToUpdate = await Orders.findOne(
    { where: { id:id } },

  );
  if (orderToUpdate) {
    await Orders.update(order, { where:{ id:id } });
    return order;
  }
  return null;
};


// getAllOrders_by_bayer

export const getAllOrders_by_bayer = async (userID) => {
  try {
    return await Orders.findAll({
      where: { userID },
      include: [
        { model: db.Users, as: "buyer" },
        { model: db.Products, as: "product" },
      ],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getAllOrders_by_seller = async (userID) => {
  try {
    return await Orders.findAll({
      where: { userID },
      include: [
        { model: db.Users, as: "buyer" },
        { model: db.Products, as: "product" },
      ],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    return await Orders.findAll({
      include: [
        { 
          model: db.Users,
           as: "buyer" 
          },
        { 
          model: db.Products, 
          as: "product",
          include: [
            { 
              model: db.Users,
               as: "user" 
              }
          ],
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderID, status) => {
  try {
    const order = await Orders.findByPk(orderID);
    if (!order) {
      throw new Error("Order not found");
    }

    order.status = status;
    await order.save();
    return order;
  } catch (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }
};

export const getoneorder = async (orderID) => {
  try {
    return await Orders.findAll({
      where : {id : orderID},
      include: [
        { model: db.Users, as: "buyer" },
        { model: db.Products, as: "product" },
      ],
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
