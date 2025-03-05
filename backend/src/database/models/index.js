"use strict";

import { readdirSync } from "fs";
import { basename as _basename, join } from "path";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const basename = _basename(__filename);
const env = process.env.NODE_ENV;
const config = require("../config/config.js")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Test the connection and verify database state
sequelize
  .authenticate()
  .then(async () => {
    console.log('Database connection has been established successfully.');
    console.log('Connected to database:', config.database);
    console.log('Environment:', env);

    // Check if Users table has any data
    const userCount = await sequelize.query('SELECT COUNT(*) FROM "Users"', {
      type: Sequelize.QueryTypes.SELECT
    });
    console.log('Number of users in database:', userCount[0].count);

    if (userCount[0].count === '0') {
      console.log('WARNING: No users found in database. You may need to run seeders.');
      console.log('Run: npx sequelize-cli db:seed:all');
    }
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

readdirSync(__dirname)
  .filter((file) => {
    const isTrue =
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    return isTrue;
  })
  .forEach((file) => {
    const model = sequelize.import(join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  db[modelName].associate(db);
});

db.Sequelize = Sequelize;

export default db;