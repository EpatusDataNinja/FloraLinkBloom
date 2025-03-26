import { send } from "process";
import {
  // Update the necessary imports for Message services here
  createMessage,
  getAllMessages,
  Messages,
  getChatHistory,
  getUnreadMessages
} from "../services/messagesService.js";
import { io } from '../socket/socketSetup.js';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

export const addMessageController = async (req, res) => {
  try {
    if (req.user.role !== "seller" && req.user.role !== "buyer" && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized to create a message"
      });
    }

    const { id } = req.params;
    const { message, replyTo } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const messageData = {
      senderId: req.user.id,
      receiverId: id,
      message,
      replyTo: replyTo || null,
      isRead: false,
      isDelivered: false
    };

    const newMessage = await createMessage(messageData);

    // Emit socket event for real-time updates
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${id}`).emit('newMessage', newMessage);
    }

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      Message: newMessage
    });
  } catch (error) {
    console.error('Error in addMessageController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating message",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const MessageWithAllController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required"
      });
    }

    const messages = await getAllMessages(userId, id);

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No messages found between the users",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching messages",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Add error handling for database schema
    try {
      const count = await Messages.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });

      return res.status(200).json({
        success: true,
        count: count || 0
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If the column doesn't exist, return 0 as a fallback
      if (dbError.message.includes('column') && dbError.message.includes('does not exist')) {
        return res.status(200).json({
          success: true,
          count: 0,
          warning: 'Database schema needs update'
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting unread message count',
      error: error.message
    });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { id } = req.params;
    const mediaType = req.file.mimetype.split('/')[0];
    
    const messageData = {
      senderId: req.user.id,
      receiverId: id,
      message: req.body.message || 'Sent a file',
      mediaType,
      mediaUrl: `/uploads/chat/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    };

    const newMessage = await createMessage(messageData);

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      Message: newMessage
    });
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    return res.status(500).json({
      success: false,
      message: "Error uploading media",
      error: error.message
    });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { query } = req.params;
    const userId = req.user.id;

    const messages = await Messages.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { senderId: userId },
              { receiverId: userId }
            ]
          },
          {
            [Op.or]: [
              { message: { [Op.iLike]: `%${query}%` } },
              { fileName: { [Op.iLike]: `%${query}%` } }
            ]
          }
        ]
      },
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error in searchMessages:', error);
    return res.status(500).json({
      success: false,
      message: "Error searching messages",
      error: error.message
    });
  }
};

export const exportChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await getAllMessages(currentUserId, userId);

    const csvWriter = createObjectCsvWriter({
      path: `uploads/exports/chat-${Date.now()}.csv`,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'sender', title: 'Sender' },
        { id: 'message', title: 'Message' },
        { id: 'type', title: 'Type' },
        { id: 'fileName', title: 'File Name' }
      ]
    });

    const records = messages.map(msg => ({
      date: new Date(msg.createdAt).toLocaleString(),
      sender: `${msg.sender.firstname} ${msg.sender.lastname}`,
      message: msg.message,
      type: msg.mediaType,
      fileName: msg.fileName || ''
    }));

    await csvWriter.writeRecords(records);

    res.download(`uploads/exports/chat-${Date.now()}.csv`);
  } catch (error) {
    console.error('Error in exportChat:', error);
    return res.status(500).json({
      success: false,
      message: "Error exporting chat",
      error: error.message
    });
  }
};

export const getChatHistoryController = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const chatHistory = await getChatHistory(userId);

    return res.status(200).json({
      success: true,
      data: chatHistory
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting chat history",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getUnreadMessagesController = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const messages = await getUnreadMessages(userId);

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error getting unread messages:', error);
    return res.status(500).json({
      success: false,
      message: "Error getting unread messages",
      error: error.message
    });
  }
};

