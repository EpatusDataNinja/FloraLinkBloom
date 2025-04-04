import {
  getAllNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../services/NotificationService.js";

// Get all notifications for the logged-in user
export const getNotificationsController = async (req, res) => {
  try {
    const userID = req.user.id;
    const notifications = await getAllNotifications(userID);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved",
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Error in getNotificationsController:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message
    });
  }
};


// Create a new notification
export const createNotificationController = async (req, res) => {
  try {
    const { userID, message, type } = req.body;
    const notification = await createNotification(
      { userID, message, type, isRead: false },
      req.app.get('io') // Get Socket.IO instance from Express app
    );

    return res.status(201).json({ 
      success: true, 
      message: "Notification created", 
      data: notification 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Mark a single notification as read
export const markNotificationAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const notification = await markNotificationAsRead(id, userID);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification marked as read", data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    const userID = req.user.id;
    await markAllNotificationsAsRead(userID);

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete a single notification
export const deleteNotificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id;
    const notification = await deleteNotification(id, userID);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted", data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete all notifications
export const deleteAllNotificationsController = async (req, res) => {
  try {
    const userID = req.user.id;
    await deleteAllNotifications(userID);

    return res.status(200).json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
