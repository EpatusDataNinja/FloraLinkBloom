import db from "../database/models/index.js";
const Messages = db["Messages"];
const users = db["Users"];
const { Op } = require('sequelize');


export const createMessage = async (MessageData) => {
  try {
    return await Messages.create(MessageData);
  } catch (error) {
    throw new Error(`Error creating Message: ${error.message}`);
  }
};


export const getAllMessages = async (userId, otherUserId) => {
  try {
    const messages = await Messages.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: [
        {
          model: users,
          as: "sender",
        },
        {
          model: users,
          as: "receiver",
        },
      ],
      order: [['createdAt', 'ASC']], // Order by message creation time, ascending
    });
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};




// activateMessage