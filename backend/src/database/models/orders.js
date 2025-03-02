"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.belongsTo(models.Users, { foreignKey: "userID", as: "buyer" });
      Orders.belongsTo(models.Products, { foreignKey: "productID", as: "product" });
      Orders.hasMany(models.Payments, { foreignKey: "orderID", as: "payments" });

    }
  }
  Orders.init(
    {
      userID: { type: DataTypes.INTEGER, allowNull: false },
      productID: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: "pending" },
    },
    {
      sequelize,
      modelName: "Orders",
    }
  );
  return Orders;
};