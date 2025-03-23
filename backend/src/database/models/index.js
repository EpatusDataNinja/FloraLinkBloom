"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config.js")[env];
const db = {};

let sequelize;
try {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
} catch (error) {
  console.error('Failed to initialize Sequelize:', error);
  process.exit(1);
}

// Load models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize instance and Sequelize class to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize database function
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    console.log('Connected to database:', config.database);
    console.log('Environment:', env);
    console.log('Loaded models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));

    // Check if Users table exists
    const tableExists = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Users'
      );
    `);
    
    if (tableExists[0][0].exists) {
      const [result] = await sequelize.query('SELECT COUNT(*) FROM "Users"');
      const userCount = result[0].count;
      console.log('Number of users in database:', userCount);

      if (parseInt(userCount) === 0) {
        console.log('WARNING: No users found in database. You may need to run seeders.');
        console.log('Run: npx sequelize-cli db:seed:all');
      }
    } else {
      console.log('Users table does not exist. Please run migrations.');
      console.log('Run: npx sequelize-cli db:migrate');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

db.initializeDatabase = initializeDatabase;
module.exports = db;