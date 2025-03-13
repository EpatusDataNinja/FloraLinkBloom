import db from "../database/models/index.js";
import Email from "../utils/mailer.js"; // Assuming an email service exists

const Notification = db["Notifications"];

// Get all notifications for a user
export const getAllNotifications = async (userID) => {
  try {
    return await Notification.findAll({ where: { userID } });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    return await Notification.create(notificationData);
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Mark a single notification as read
export const markNotificationAsRead = async (id, userID) => {
  try {
    const notification = await Notification.findOne({ where: { id, userID } });

    if (!notification) {
      return null;
    }

    await Notification.update({ isRead: true }, { where: { id, userID } });

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userID) => {
  try {
    await Notification.update({ isRead: true }, { where: { userID } });
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete a single notification
export const deleteNotification = async (id, userID) => {
  try {
    const notification = await Notification.findOne({ where: { id, userID } });

    if (!notification) {
      return null;
    }

    await Notification.destroy({ where: { id, userID } });

    return notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Delete all notifications for a user
export const deleteAllNotifications = async (userID) => {
  try {
    await Notification.destroy({ where: { userID } });
    return true;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};

// Add notification types enum
export const NotificationType = {
  NEW_PRODUCT: 'NEW_PRODUCT',
  PRODUCT_APPROVED: 'PRODUCT_APPROVED',
  PRODUCT_REJECTED: 'PRODUCT_REJECTED',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_STATUS_CHANGE: 'ORDER_STATUS_CHANGE',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  STOCK_UPDATE: 'STOCK_UPDATE'
};

// Enhanced sendNotification function
export const sendNotification = async ({ user, title, message, type, relatedId = null }) => {
  try {
    // Save in-app notification
    const notification = await Notification.create({
      userID: user.id,
      title,
      message,
      type,
      relatedId,
      isRead: false
    });

    // Send email notification
    if (user.email) {
      await new Email(user, { 
        message,
        title,
        type
      }).sendNotification();
    }

    return notification;
  } catch (error) {
    console.error("[ERROR] Notification sending failed:", error);
    throw error;
  }
};

// Add specific notification functions
export const sendProductApprovalRequest = async (product, adminUsers) => {
  try {
    const notificationPromises = adminUsers.map(admin => 
      sendNotification({
        user: admin,
        title: 'New Product Approval Required',
        message: `A new product "${product.name}" requires your approval.`,
        type: NotificationType.NEW_PRODUCT,
        relatedId: product.id
      })
    );

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("[ERROR] Product approval notification failed:", error);
    throw error;
  }
};

export const sendProductStatusUpdate = async (seller, product, status) => {
  try {
    const title = status === 'approved' ? 
      'Product Approved' : 
      'Product Rejected';
    
    const message = status === 'approved' ?
      `Your product "${product.name}" has been approved and is now live.` :
      `Your product "${product.name}" has been rejected. Please review and update accordingly.`;

    await sendNotification({
      user: seller,
      title,
      message,
      type: status === 'approved' ? 
        NotificationType.PRODUCT_APPROVED : 
        NotificationType.PRODUCT_REJECTED,
      relatedId: product.id
    });
  } catch (error) {
    console.error("[ERROR] Product status notification failed:", error);
    throw error;
  }
};

export const sendLowStockNotification = async (seller, product) => {
  try {
    await sendNotification({
      user: seller,
      title: 'Low Stock Alert',
      message: `Your product "${product.name}" is running low on stock.`,
      type: NotificationType.LOW_STOCK,
      relatedId: product.id
    });
  } catch (error) {
    console.error("[ERROR] Low stock notification failed:", error);
    throw error;
  }
};

export const sendOutOfStockNotification = async (seller, product) => {
  try {
    await sendNotification({
      user: seller,
      title: 'Out of Stock Alert',
      message: `Your product "${product.name}" is now out of stock.`,
      type: NotificationType.OUT_OF_STOCK,
      relatedId: product.id
    });
  } catch (error) {
    console.error("[ERROR] Out of stock notification failed:", error);
    throw error;
  }
};
