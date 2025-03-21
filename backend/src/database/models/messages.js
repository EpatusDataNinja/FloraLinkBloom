"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Messages extends Model {
    static associate(models) {
      // Associations
      Messages.belongsTo(models.Users, { foreignKey: "senderId", as: "sender" });
      Messages.belongsTo(models.Users, { foreignKey: "receiverId", as: "receiver" });
    }
  }
  
  Messages.init(
    {
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      mediaType: {
        type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document'),
        defaultValue: 'text',
        allowNull: false
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "Messages",
    }
  );

  return Messages;
};
