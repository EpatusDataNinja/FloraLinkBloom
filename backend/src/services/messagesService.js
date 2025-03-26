import db from "../database/models/index.js";
const Messages = db["Messages"];
const Users = db["Users"];
const { Op } = require('sequelize');
const sequelize = require('sequelize');

export const createMessage = async (MessageData) => {
  try {
    if (!MessageData.senderId || !MessageData.receiverId || !MessageData.message) {
      throw new Error('Missing required message data');
    }

    const message = await Messages.create({
      ...MessageData,
      isRead: false,
      isDelivered: false,
      mediaType: MessageData.mediaType || 'text'
    });

    // Fetch the created message with sender information
    const messageWithSender = await Messages.findOne({
      where: { id: message.id },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image']
        }
      ]
    });

    return messageWithSender;
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error(`Error creating message: ${error.message}`);
  }
};

export const getAllMessages = async (userId, otherId) => {
  try {
    if (!userId || !otherId) {
      throw new Error('Both user IDs are required');
    }

    const messages = await Messages.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image'],
          where: { id: { [Op.ne]: null } }
        }
      ],
      raw: true,
      nest: true
    });

    if (!messages) {
      return [];
    }

    // Mark messages as read and notify sender
    const unreadMessages = messages.filter(
      msg => !msg.isRead && msg.receiverId === userId
    );

    if (unreadMessages.length > 0) {
      await Messages.update(
        { isRead: true },
        {
          where: {
            id: unreadMessages.map(msg => msg.id)
          }
        }
      );
    }

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error(`Error fetching messages: ${error.message}`);
  }
};

export const getChatHistory = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get all unique conversations for the user
    const conversations = await Messages.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      attributes: [
        'senderId',
        'receiverId'
      ],
      group: ['senderId', 'receiverId'],
      raw: true
    });

    // Get the last message and unread count for each conversation
    const chatHistory = await Promise.all(
      conversations.map(async (conv) => {
        try {
          const otherId = conv.senderId === userId ? conv.receiverId : conv.senderId;
          
          // Get last message with sender and receiver info
          const lastMessage = await Messages.findOne({
            where: {
              [Op.or]: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
              ]
            },
            include: [
              {
                model: Users,
                as: "sender",
                attributes: ['id', 'firstname', 'lastname', 'image']
              },
              {
                model: Users,
                as: "receiver",
                attributes: ['id', 'firstname', 'lastname', 'image']
              }
            ],
            order: [['createdAt', 'DESC']]
          });

          if (!lastMessage) {
            return null;
          }

          // Get unread count
          const unreadCount = await Messages.count({
            where: {
              senderId: otherId,
              receiverId: userId,
              isRead: false
            }
          });

          // Get total messages count
          const totalMessages = await Messages.count({
            where: {
              [Op.or]: [
                { senderId: userId, receiverId: otherId },
                { senderId: otherId, receiverId: userId }
              ]
            }
          });

          return {
            lastMessage,
            unreadCount,
            totalMessages,
            otherUser: lastMessage.senderId === userId ? 
              lastMessage.receiver : lastMessage.sender
          };
        } catch (error) {
          console.error(`Error processing conversation with user ${otherId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and sort by last message date
    return chatHistory
      .filter(chat => chat !== null)
      .sort((a, b) => 
        new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
      );
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw new Error(`Failed to get chat history: ${error.message}`);
  }
};

export const markMessageAsRead = async (messageId, userId) => {
  try {
    if (!messageId || !userId) {
      throw new Error('Message ID and User ID are required');
    }

    const message = await Messages.findByPk(messageId);
    if (message && message.receiverId === userId && !message.isRead) {
      await message.update({ isRead: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw new Error(`Error marking message as read: ${error.message}`);
  }
};

export const getUnreadMessagesCount = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const count = await Messages.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw new Error(`Error getting unread count: ${error.message}`);
  }
};

export const getUnreadMessages = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const messages = await Messages.findAll({
      where: {
        receiverId: userId,
        isRead: false
      },
      include: [
        {
          model: Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return messages;
  } catch (error) {
    console.error('Error getting unread messages:', error);
    throw new Error(`Error getting unread messages: ${error.message}`);
  }
};

export { Messages };




// activateMessage