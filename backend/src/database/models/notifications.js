"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notifications extends Model {
    static associate(models) {
      Notifications.belongsTo(models.Users, { foreignKey: "userID", as: "Users" });
    }
  }
  Notifications.init(
    {
      userID: DataTypes.INTEGER,
      title: DataTypes.STRING,
      message: DataTypes.TEXT,
      type: DataTypes.STRING,
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false }, // New field
    },
    {
      sequelize,
      modelName: "Notifications",
    }
  );
  return Notifications;
};
