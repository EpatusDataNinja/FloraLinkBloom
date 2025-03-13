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

  // Move hooks to a separate file to avoid circular dependencies
  Orders.addHook('afterCreate', async (order) => {
    try {
      // Emit an event instead of directly calling services
      sequelize.emit('orderCreated', order);
      
      // Send notification through the model itself
      const Notifications = sequelize.models.Notifications;
      if (Notifications) {
        await Notifications.create({
          userID: order.userID,
          title: 'New Order',
          message: `Order #${order.id} has been created`,
          type: 'order'
        });
      }
    } catch (error) {
      console.error('Error in order hook:', error);
    }
  });

  return Orders;
};