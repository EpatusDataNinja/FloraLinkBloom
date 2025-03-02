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
    },
    {
      sequelize,
      modelName: "Messages",
    }
  );

  return Messages;
};
