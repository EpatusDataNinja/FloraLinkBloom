"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Products, { foreignKey: "userID", as: "Products" });
      Users.hasMany(models.Notifications, { foreignKey: "userID", as: "notifications" });
      Users.hasMany(models.Payments, { foreignKey: "userID", as: "payments" });
      Users.hasMany(models.Orders, { foreignKey: "userID", as: "orders" });
      Users.hasMany(models.Categories, { foreignKey: "userID", as: "categories" }); // A User has multiple Categories
    }
  }

  Users.init(
    {
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password: DataTypes.STRING,
      phone: { type: DataTypes.STRING, unique: true },
      gender: DataTypes.ENUM("Male", "Female", "Other"),
      role: DataTypes.STRING,
      address: DataTypes.TEXT,
      code: DataTypes.STRING,
      status: DataTypes.STRING,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Users",
    }
  );

  return Users;
};
