import db from "../database/models/index.js";
const Messages = db["Messages"];
const users = db["Users"];
const { Op } = require('sequelize');
const sequelize = require('sequelize');


export const createMessage = async (MessageData) => {
  try {
    const message = await Messages.create({
      ...MessageData,
      isRead: false,
      isDelivered: false
    });

    // Fetch the created message with sender information
    const messageWithSender = await Messages.findOne({
      where: { id: message.id },
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image']
        }
      ]
    });

    return messageWithSender;
  } catch (error) {
    throw new Error(`Error creating Message: ${error.message}`);
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
          model: db.Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image'],
          where: { id: { [Op.ne]: null } }
        }
      ]
    });

    const validatedMessages = messages.map(msg => ({
      ...msg.toJSON(),
      sender: {
        ...msg.sender,
        image: msg.sender.image || null
      }
    }));

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

    return validatedMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId, userId) => {
  try {
    const message = await Messages.findByPk(messageId);
    if (message && message.receiverId === userId && !message.isRead) {
      await message.update({ isRead: true });
      return true;
    }
    return false;
  } catch (error) {
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

export const getRecentChats = async (userId) => {
  try {
    const recentMessages = await Messages.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: db.Users,
          as: "sender",
          attributes: ['id', 'firstname', 'lastname', 'image']
        },
        {
          model: db.Users,
          as: "receiver",
          attributes: ['id', 'firstname', 'lastname', 'image']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    return recentMessages;
  } catch (error) {
    throw new Error(`Error getting recent chats: ${error.message}`);
  }
};

export const markMessageAsDelivered = async (messageId) => {
  try {
    await Messages.update(
      { isDelivered: true },
      { where: { id: messageId } }
    );
    return true;
  } catch (error) {
    throw new Error(`Error marking message as delivered: ${error.message}`);
  }
};

export const getChatHistory = async (userId) => {
  try {
    // Get all unique conversations for the user
    const conversations = await Messages.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('senderId')), 'senderId'],
        [sequelize.fn('DISTINCT', sequelize.col('receiverId')), 'receiverId']
      ],
      raw: true
    });

    // Get the last message and unread count for each conversation
    const chatHistory = await Promise.all(
      conversations.map(async (conv) => {
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
              model: db.Users,
              as: "sender",
              attributes: ['id', 'firstname', 'lastname', 'image']
            },
            {
              model: db.Users,
              as: "receiver",
              attributes: ['id', 'firstname', 'lastname', 'image']
            }
          ],
          order: [['createdAt', 'DESC']]
        });

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
      })
    );

    // Sort by last message date
    return chatHistory.sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const getUnreadMessages = async (userId) => {
  try {
    const messages = await Messages.findAll({
      where: {
        receiverId: userId,
        isRead: false
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

    return messages;
  } catch (error) {
    console.error('Error getting unread messages:', error);
    throw error;
  }
};

export { Messages };




// activateMessage