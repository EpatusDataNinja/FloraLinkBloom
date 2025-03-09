"use strict";
const { Model } = require("sequelize");
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
