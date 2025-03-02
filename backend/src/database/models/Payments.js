// Payments Model
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      Payments.belongsTo(models.Users, { foreignKey: "userID", as: "payer" });
      Payments.belongsTo(models.Orders, { foreignKey: "orderID", as: "order" });
      
    }
  }
  Payments.init(
    {
      userID: { type: DataTypes.INTEGER, allowNull: false },
      orderID: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      paymentMethod: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Payments",
    }
  );
  return Payments;
};