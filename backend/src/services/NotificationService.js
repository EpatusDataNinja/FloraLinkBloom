import db from "../database/models/index.js";
import Email from "../utils/mailer.js";

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
export const createNotification = async (notificationData, io = null) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Emit real-time notification if Socket.IO instance is provided
    emitNotification(io, notification);
    
    return notification;
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

// Add this function to NotificationService.js
export const emitNotification = (io, notification) => {
  if (io && notification.userID) {
    io.to(`user_${notification.userID}`).emit('newNotification', notification);
  }
};
