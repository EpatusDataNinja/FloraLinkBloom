"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Users, { 
        foreignKey: "userID", 
        as: "user"  // This alias must match the one used in the query
      });
      Products.belongsTo(models.Categories, { 
        foreignKey: "categoryID", 
        as: "category"  // This alias must match the one used in the query
      });
      Products.hasMany(models.Orders, { 
        foreignKey: "productID", 
        as: "orders" 
      });
      
      // Add scopes for common queries
      Products.addScope('withSalesData', {
        include: [{
          model: models.Orders,
          as: 'orders',
          include: [{
            model: models.Payments,
            as: 'payments',
            where: { status: 'completed' }
          }]
        }]
      });

      Products.addScope('lowStock', (threshold) => ({
        where: {
          quantity: {
            [Op.lte]: threshold
          }
        }
      }));
    }
  }
  Products.init(
    {
      userID: DataTypes.INTEGER,
      categoryID: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.DECIMAL,
      quantity: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Products",
    }
  );
  return Products;
};
