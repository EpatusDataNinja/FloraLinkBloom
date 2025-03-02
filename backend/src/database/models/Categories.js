"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      Categories.belongsTo(models.Users, { foreignKey: "userID", as: "user" }); // Category belongs to a User
      Categories.hasMany(models.Products, { foreignKey: "categoryID", as: "Products" });
    }
  }

  Categories.init(
    {
      name: DataTypes.STRING,
      userID: { type: DataTypes.INTEGER, allowNull: false }, // Foreign key to reference Users
    },
    {
      sequelize,
      modelName: "Categories",
    }
  );

  return Categories;
};
