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
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      categoryID: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending Approval"
      }
    },
    {
      sequelize,
      modelName: "Products",
    }
  );
  return Products;
};
